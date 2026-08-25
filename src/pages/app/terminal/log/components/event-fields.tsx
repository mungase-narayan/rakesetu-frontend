import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ATTRIBUTION_LABELS, reasonsFor } from '@/constants';
import type { RakeEventType } from '@/types/rake-event.types';

import { eventFields, type EventFieldValues } from './event-fields.helpers';

/**
 * Only the fields this event actually carries.
 *
 * **Event-specific, not a universal form.** `rake_events.payload` is `jsonb`
 * precisely because fourteen of the twenty-four event types carry nothing; a
 * form that showed net weight next to a departure would be asking a supervisor
 * to leave a box blank forty times a shift, and the one time they did not would
 * be a weight attached to an event that has no weight.
 *
 * The reason code is a **closed list**, and that is a downstream contract
 * rather than a convenience: Phase 10 adjudicates waivers by matching these
 * exact strings, and free text goes in the note beside it. The attribution is
 * shown next to each option because it is what the choice actually decides.
 */
const EventFields = ({
  eventType,
  values,
  onChange,
  disabled,
}: {
  eventType: RakeEventType;
  values: EventFieldValues;
  onChange: (patch: Partial<EventFieldValues>) => void;
  disabled?: boolean;
}) => {
  const fields = eventFields(eventType);
  if (fields.length === 0) return null;

  const reasons = reasonsFor(eventType);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.includes('lineNumber') && (
        <div className="space-y-1.5">
          <Label htmlFor="lineNumber">Line number</Label>
          <Input
            id="lineNumber"
            inputMode="text"
            placeholder="L1"
            className="h-11"
            value={values.lineNumber}
            disabled={disabled}
            onChange={(event) => onChange({ lineNumber: event.target.value })}
          />
        </div>
      )}

      {fields.includes('netWeightT') && (
        <div className="space-y-1.5">
          <Label htmlFor="netWeightT">Net weight (tonnes)</Label>
          <Input
            id="netWeightT"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            className="h-11"
            value={values.netWeightT}
            disabled={disabled}
            onChange={(event) => onChange({ netWeightT: event.target.value })}
          />
        </div>
      )}

      {fields.includes('wagonsLoaded') && (
        <div className="space-y-1.5">
          <Label htmlFor="wagonsLoaded">Wagons loaded</Label>
          <Input
            id="wagonsLoaded"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            className="h-11"
            value={values.wagonsLoaded}
            disabled={disabled}
            onChange={(event) => onChange({ wagonsLoaded: event.target.value })}
          />
        </div>
      )}

      {fields.includes('reasonCode') && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reasonCode">Reason</Label>
          <Select
            value={values.reasonCode || undefined}
            disabled={disabled}
            onValueChange={(value) => onChange({ reasonCode: value })}
          >
            <SelectTrigger id="reasonCode" className="h-11 w-full">
              <SelectValue placeholder="Choose a reason" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((reason) => (
                <SelectItem key={reason.code} value={reason.code}>
                  <span className="font-medium">{reason.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {ATTRIBUTION_LABELS[reason.attribution]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            The reason is what a waiver claim is later weighed against, so pick
            the closest one and put the detail in the note.
          </p>
        </div>
      )}

      {fields.includes('note') && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            rows={2}
            maxLength={500}
            placeholder="Anything the reason code does not cover"
            value={values.note}
            disabled={disabled}
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default EventFields;
