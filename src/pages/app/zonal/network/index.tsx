import NetworkPage from '../../controller/network';

/**
 * The zonal manager's map.
 *
 * The same component. §9's matrix gives this persona read-only sight of the
 * network, and there is nothing on the map to write — so a duplicate with a
 * `readOnly` prop would be a second screen to keep in step for no behavioural
 * difference. The workspace boundary is `RoleLayout`, not this file.
 */
const ZonalNetworkPage = () => (
  <NetworkPage
    title="Division network"
    description="Where the fleet is right now, projected from the event log. Read-only."
  />
);

export default ZonalNetworkPage;
