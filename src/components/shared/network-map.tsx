import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks';
import {
  STATE_GROUPS,
  STATE_GROUP_LABEL,
  STATE_GROUP_MEMBERS,
  type LiveRake,
  type LiveTerminal,
  type SectionLoadRow,
  type StateGroup,
} from '@/types/rake-event.types';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';

/**
 * The network map — rakes, terminals and sections over OpenStreetMap tiles.
 *
 * **It still knows nothing about its transport.** Phase 4 fed it a five-second
 * poll; Phase 5 feeds it Server-Sent Events, and not a line here changed for
 * that — it takes a snapshot and draws it. That is the property worth
 * protecting: the day the transport changes again, this file should not be in
 * the diff.
 *
 * `CircleMarker` rather than an icon marker, and that is a deliberate trade.
 * Leaflet's default icon ships as three PNGs resolved by a bundler-hostile
 * relative URL, and every project that uses it ends up with the same
 * `delete L.Icon.Default.prototype._getIconUrl` incantation pasted from Stack
 * Overflow. A circle is drawn by Leaflet itself: no assets, no bundler
 * workaround, and its radius and colour are plain props — which is what a map
 * that will grow a congestion colour in Phase 8 actually wants.
 */

/**
 * Colour per state group.
 *
 * Chosen against a dark *and* a light tile layer, not sampled from the design
 * tokens: the tokens are tuned for a page background, and a colour that reads
 * as "muted foreground" on a card is invisible over a map. They are also
 * distinguishable without relying on hue alone — the legend names the states
 * and the tooltip repeats the state in words, so the colour is a shortcut and
 * never the only carrier of the meaning.
 */
const GROUP_COLOR: Record<StateGroup, string> = {
  empty: '#2563eb',
  moving: '#16a34a',
  at_terminal: '#d97706',
  exception: '#dc2626',
};

/** The Solapur–Pune–Nagpur belt the seed covers. */
const DEFAULT_CENTER: [number, number] = [18.4, 76.2];
const DEFAULT_ZOOM = 7;

interface NetworkMapProps {
  rakes: LiveRake[];
  terminals: LiveTerminal[];
  /** Section geometry and recent traffic. Absent until the request lands. */
  sections?: SectionLoadRow[];
  /** The busiest section in the window — the denominator for line width. */
  maxTraversals?: number;
  /**
   * The section ids of the selected rake's **remaining** path, from the ETA
   * engine. Drawn over everything else so the answer to "where is it going" is
   * on the map rather than only in the sheet.
   */
  pathSectionIds?: string[];
  onSelectRake?: (rake: LiveRake) => void;
  selectedRakeId?: string | null;
  className?: string;
}

/**
 * Terminal occupancy, as §5.4 defines it for this phase: rakes standing on the
 * terminal's lines against the lines it has.
 *
 * **Naive but honest.** It counts placements and releases, not a queue model —
 * a rake waiting in the yard for a line is not counted, because nothing in the
 * event log says it is waiting. Phase 8's discrete-event twin replaces the
 * measure; until then the map says what can be said, and the legend says what
 * the colour means so nobody reads more into it.
 */
const OCCUPANCY_COLOR = (ratio: number, isDark: boolean): string => {
  if (ratio >= 1) return '#dc2626';
  if (ratio >= 0.66) return '#d97706';
  if (ratio > 0) return '#16a34a';
  return isDark ? '#94a3b8' : '#475569';
};

/**
 * Nudges markers that share a station apart.
 *
 * Forty rakes over fifty-nine stations means several sit on the same
 * coordinate, and stacked circles render as one — so the map would say "three
 * rakes at Kurduvadi" by drawing a single dot. A small deterministic spiral
 * keyed on the index within the group separates them without pretending to know
 * where in the yard each one stands.
 */
const spread = (lat: number, lng: number, index: number): [number, number] => {
  if (index === 0) return [lat, lng];
  const angle = index * 2.39996; // the golden angle, so rings do not line up
  const radius = 0.035 * Math.sqrt(index);
  return [lat + radius * Math.cos(angle), lng + radius * Math.sin(angle)];
};

const NetworkMap = ({
  rakes,
  terminals,
  sections,
  maxTraversals = 0,
  pathSectionIds,
  onSelectRake,
  selectedRakeId,
  className,
}: NetworkMapProps) => {
  const { theme } = useTheme();
  const mapRef = useRef<LeafletMap | null>(null);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  /** Positioned rakes only, spread within their station. */
  const positioned = useMemo(() => {
    const perStation = new Map<string, number>();
    return rakes
      .filter((rake) => rake.lat !== null && rake.lng !== null)
      .map((rake) => {
        const key = rake.stationCode ?? 'unknown';
        const index = perStation.get(key) ?? 0;
        perStation.set(key, index + 1);
        const [lat, lng] = spread(
          rake.lat as number,
          rake.lng as number,
          index
        );
        return { rake, lat, lng };
      });
  }, [rakes]);

  /**
   * Rakes whose station has no coordinates are not silently dropped — the count
   * is reported under the legend. A map that quietly shows 37 of 40 rakes is a
   * map somebody will make a decision from.
   */
  const unplotted = rakes.length - positioned.length;

  /** How many rakes are standing on each terminal's lines, right now. */
  const occupancy = useMemo(() => {
    const counts = new Map<string, number>();
    for (const rake of rakes) {
      if (!rake.terminalId) continue;
      if (
        rake.stateGroup !== 'at_terminal' &&
        rake.stateGroup !== 'exception'
      ) {
        continue;
      }
      counts.set(rake.terminalId, (counts.get(rake.terminalId) ?? 0) + 1);
    }
    return counts;
  }, [rakes]);

  const pathIds = useMemo(
    () => new Set(pathSectionIds ?? []),
    [pathSectionIds]
  );

  /**
   * Sections are drawn in two passes — quiet ones first, busy ones last — so a
   * heavily used line is never hidden under an idle one that happened to sort
   * after it. Leaflet paints in insertion order and has no z-index for paths.
   */
  const orderedSections = useMemo(
    () => [...(sections ?? [])].sort((a, b) => a.traversals - b.traversals),
    [sections]
  );

  // Leaflet measures its container on mount, and a map created inside a tab or
  // a card that was hidden at that moment renders as a grey box. Re-measuring
  // once after mount is the standard fix and costs one frame.
  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <MapContainer
          ref={mapRef}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-[520px] w-full"
          // Leaflet paints its own background behind the tiles; without this it
          // is white and flashes on every pan in dark mode.
          style={{ background: isDark ? '#0b1220' : '#e5e7eb' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /*
             * OSM ships one light tile set. Rather than depending on a second
             * provider for a dark one — another host, another attribution,
             * another thing to break — the same tiles are inverted and
             * hue-rotated back. It is the standard trick and it keeps the map
             * from being a lit panel in an otherwise dark app.
             */
            className={
              isDark
                ? 'brightness-[0.65] contrast-[1.05] invert hue-rotate-180 saturate-[0.7]'
                : undefined
            }
          />

          {/*
            Sections underneath everything: they are the background the rest of
            the map is read against, and a line drawn over a marker would hide
            the thing somebody clicked.
          */}
          {orderedSections.map((section) => {
            const onPath = pathIds.has(section.sectionId);
            const share =
              maxTraversals > 0 ? section.traversals / maxTraversals : 0;

            return (
              <Polyline
                key={section.sectionId}
                positions={[
                  [section.fromLat, section.fromLng],
                  [section.toLat, section.toLng],
                ]}
                pathOptions={{
                  color: onPath ? '#2563eb' : isDark ? '#64748b' : '#94a3b8',
                  // A quiet section is thin but still drawn. A missing line
                  // would read as "no track here", which is a different and
                  // wrong statement.
                  weight: onPath ? 4 : 1 + share * 5,
                  opacity: onPath ? 0.95 : 0.25 + share * 0.5,
                }}
              >
                <Tooltip sticky>
                  <span className="font-medium">
                    {section.fromCode} → {section.toCode}
                  </span>
                  <br />
                  {section.distanceKm} km · {section.traversals} traversal
                  {section.traversals === 1 ? '' : 's'} in the window
                </Tooltip>
              </Polyline>
            );
          })}

          {/*
            Terminals next, so a rake marker always draws over the terminal it
            is standing at rather than disappearing behind it. Radius by
            placement lines — capacity — and **colour by current occupancy**,
            which is what a controller is actually scanning the map for.
          */}
          {terminals.map((terminal) => {
            const onHand = occupancy.get(terminal.id) ?? 0;
            const ratio =
              terminal.placementLines > 0
                ? onHand / terminal.placementLines
                : 0;
            const color = OCCUPANCY_COLOR(ratio, isDark);

            return (
              <CircleMarker
                key={terminal.id}
                center={[terminal.lat, terminal.lng]}
                radius={6 + terminal.placementLines * 2}
                pathOptions={{
                  color,
                  weight: onHand > 0 ? 2 : 1,
                  fillColor: color,
                  // Filled faintly rather than solid: the terminal is a
                  // container for the rake markers drawn on top of it, and a
                  // solid disc would swallow them.
                  fillOpacity: onHand > 0 ? 0.12 : 0,
                  dashArray: onHand > 0 ? undefined : '3 3',
                }}
              >
                <Tooltip direction="top" offset={[0, -4]}>
                  <span className="font-medium">{terminal.name}</span>
                  <br />
                  {onHand} of {terminal.placementLines} placement line
                  {terminal.placementLines === 1 ? '' : 's'} occupied ·{' '}
                  {terminal.isMechanised ? 'mechanised' : 'manual'}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {positioned.map(({ rake, lat, lng }) => {
            const selected = rake.rakeId === selectedRakeId;
            return (
              <CircleMarker
                key={rake.rakeId}
                center={[lat, lng]}
                radius={selected ? 9 : 6}
                eventHandlers={{ click: () => onSelectRake?.(rake) }}
                pathOptions={{
                  color: selected
                    ? isDark
                      ? '#f8fafc'
                      : '#0f172a'
                    : '#ffffff',
                  weight: selected ? 2.5 : 1.25,
                  fillColor: GROUP_COLOR[rake.stateGroup],
                  fillOpacity: 0.92,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]}>
                  <span className="font-medium">{rake.code}</span> ·{' '}
                  {RAKE_STATE_LABELS[rake.state]}
                  <br />
                  {rake.stationName ??
                    rake.stationCode ??
                    'Unknown location'} · {rake.hoursInState} h in state
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <MapLegend
        unplotted={unplotted}
        hasSections={orderedSections.length > 0}
      />
    </div>
  );
};

/**
 * The legend names the states, not the colours.
 *
 * "Amber" is not information a controller can act on. "At a terminal — placed,
 * loading, released" tells them which of six states the dot could be, and that
 * is the question a four-colour map raises the moment somebody looks at it.
 */
const MapLegend = ({
  unplotted,
  hasSections,
}: {
  unplotted: number;
  hasSections: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {STATE_GROUPS.map((group) => (
        <div key={group} className="flex items-start gap-2">
          <span
            className="mt-1 size-2.5 shrink-0 rounded-full ring-1 ring-white/70"
            style={{ backgroundColor: GROUP_COLOR[group] }}
            aria-hidden
          />
          <div className="text-xs leading-tight">
            <p className="font-medium">{STATE_GROUP_LABEL[group]}</p>
            <p className="text-muted-foreground">
              {STATE_GROUP_MEMBERS[group]
                .map((state) => RAKE_STATE_LABELS[state])
                .join(' · ')}
            </p>
          </div>
        </div>
      ))}
      <div className="flex items-start gap-2">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground"
          aria-hidden
        />
        <div className="text-xs leading-tight">
          <p className="font-medium">Terminals</p>
          <p className="text-muted-foreground">
            Ring size = placement lines · colour = lines occupied now
          </p>
        </div>
      </div>

      {hasSections && (
        <div className="flex items-start gap-2">
          <span
            className="mt-1.5 h-0.5 w-4 shrink-0 rounded-full bg-muted-foreground"
            aria-hidden
          />
          <div className="text-xs leading-tight">
            <p className="font-medium">Sections</p>
            <p className="text-muted-foreground">
              Thickness = traversals in the last 24 h · blue = selected
              rake&rsquo;s remaining path
            </p>
          </div>
        </div>
      )}
    </div>

    {unplotted > 0 && (
      <p className="text-xs text-muted-foreground">
        {unplotted} rake{unplotted === 1 ? '' : 's'} not shown — no coordinates
        for their current station.
      </p>
    )}
  </div>
);

export { GROUP_COLOR };
export default NetworkMap;
