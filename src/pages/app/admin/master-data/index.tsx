import { useState } from 'react';

import { PageHeader } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/routes/route-paths';

import StationsTab from './components/stations-tab';
import SectionsTab from './components/sections-tab';
import DistancesTab from './components/distances-tab';
import CommoditiesTab from './components/commodities-tab';
import WagonTypesTab from './components/wagon-types-tab';
import WagonsTab from './components/wagons-tab';
import RakesTab from './components/rakes-tab';
import TerminalsTab from './components/terminals-tab';

const TABS = [
  { value: 'stations', label: 'Stations', element: <StationsTab /> },
  { value: 'sections', label: 'Sections', element: <SectionsTab /> },
  { value: 'distances', label: 'Tariff distances', element: <DistancesTab /> },
  { value: 'terminals', label: 'Terminals', element: <TerminalsTab /> },
  { value: 'commodities', label: 'Commodities', element: <CommoditiesTab /> },
  { value: 'wagon-types', label: 'Wagon types', element: <WagonTypesTab /> },
  { value: 'wagons', label: 'Wagons', element: <WagonsTab /> },
  { value: 'rakes', label: 'Rakes', element: <RakesTab /> },
];

/**
 * Master data — one screen, eight datasets.
 *
 * Tabs rather than eight sidebar entries, because these tables are read
 * together: a section references two stations, a rake references a wagon type,
 * a terminal references a station and a set of commodity groups. Splitting them
 * across the navigation would turn "add the missing station, then the section"
 * into two round trips through a menu.
 *
 * Each tab is deliberately the same shape — filters, an export, a table, a
 * dialog — so the seventh one needs no explanation once the first has been used.
 */
const MasterDataPage = () => {
  const [tab, setTab] = useState('stations');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master data"
        description="The rail network, the asset register and the catalogues every freight engine reads. Most of it is global reference data, shared by every tenant."
        breadcrumb={[
          { label: 'Admin', to: ROUTES.admin.dashboard },
          { label: 'Master data' },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex-wrap">
          {TABS.map((entry) => (
            <TabsTrigger key={entry.value} value={entry.value}>
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((entry) => (
          // Mounted only when selected: eight tables all fetching on mount is
          // eight requests for seven screens nobody is looking at.
          <TabsContent key={entry.value} value={entry.value}>
            {tab === entry.value && entry.element}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MasterDataPage;
