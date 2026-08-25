import type {
  ChargeRuleType,
  CommodityGroup,
  CustomerTier,
  DocumentType,
  HandlingMode,
  LineType,
  RakeState,
  TerminalType,
  WagonOwner,
  WagonStatus,
} from '@/types/master-data.types';

/**
 * Display labels for the master-data enums.
 *
 * Typed as full records rather than partials so adding a value to a union is a
 * compile error here, not a raw `dev_charge` rendered in a table cell.
 */
export const LINE_TYPE_LABELS: Record<LineType, string> = {
  single: 'Single line',
  double: 'Double line',
  multiple: 'Multiple lines',
};

export const TERMINAL_TYPE_LABELS: Record<TerminalType, string> = {
  goods_shed: 'Goods shed',
  private_siding: 'Private siding',
  pft: 'Private freight terminal',
  port: 'Port',
};

export const HANDLING_MODE_LABELS: Record<HandlingMode, string> = {
  mechanised: 'Mechanised',
  manual: 'Manual',
  mixed: 'Mixed',
};

export const COMMODITY_GROUP_LABELS: Record<CommodityGroup, string> = {
  cement: 'Cement',
  coal: 'Coal',
  steel: 'Steel',
  foodgrain: 'Foodgrain',
  fertiliser: 'Fertiliser',
  petroleum: 'Petroleum',
  container: 'Container',
  other: 'Other',
};

export const WAGON_OWNER_LABELS: Record<WagonOwner, string> = {
  IR: 'Indian Railways',
  WIS: 'Wagon Investment Scheme',
  GPWIS: 'General Purpose WIS',
  private: 'Private',
};

export const WAGON_STATUS_LABELS: Record<WagonStatus, string> = {
  available: 'Available',
  in_use: 'In use',
  sick: 'Sick',
  poh_due: 'Overhaul due',
  condemned: 'Condemned',
};

/**
 * The twelve lifecycle states then the four exception states, in cycle order —
 * so a filter dropdown reads as the journey it describes.
 */
export const RAKE_STATE_LABELS: Record<RakeState, string> = {
  EMPTY_AVAILABLE: 'Empty, available',
  ALLOTTED: 'Allotted',
  MOVING_TO_LOADING: 'Moving to loading',
  PLACED_FOR_LOADING: 'Placed for loading',
  LOADING: 'Loading',
  LOADED_RELEASED: 'Loaded, released',
  IN_TRANSIT_LOADED: 'In transit, loaded',
  AT_DEST_YARD: 'At destination yard',
  PLACED_FOR_UNLOADING: 'Placed for unloading',
  UNLOADING: 'Unloading',
  UNLOADED_RELEASED: 'Unloaded, released',
  EMPTY_RETURNING: 'Empty, returning',
  DETAINED: 'Detained',
  SICK: 'Sick',
  DIVERTED: 'Diverted',
  HELD_FOR_ORDER: 'Held for order',
};

export const CUSTOMER_TIER_LABELS: Record<CustomerTier, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  standard: 'Standard',
};

export const CHARGE_RULE_TYPE_LABELS: Record<ChargeRuleType, string> = {
  free_time: 'Free time',
  demurrage: 'Demurrage',
  wharfage: 'Wharfage',
  bsc: 'Busy-season charge',
  dev_charge: 'Development charge',
  terminal_charge: 'Terminal charge',
  base_rate: 'Base freight rate',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rate_circular: 'Rate circular',
  goods_tariff: 'Goods tariff',
  commodity_classification: 'Commodity classification',
  demurrage_rule: 'Demurrage rule',
  embargo_notice: 'Embargo notice',
  zonal_instruction: 'Zonal instruction',
  forwarding_note: 'Forwarding note',
  rr: 'Railway receipt',
  waiver_evidence: 'Waiver evidence',
  other: 'Other',
};

/**
 * Which document types are corpus material by default.
 *
 * `is_corpus` is the seam that keeps Phase 12 from embedding a customer's
 * waiver photo, so the upload form pre-selects rather than leaving it to
 * whoever is uploading in a hurry. It stays editable — a rate circular can be
 * filed as evidence in a dispute.
 */
export const CORPUS_DOCUMENT_TYPES: DocumentType[] = [
  'rate_circular',
  'goods_tariff',
  'commodity_classification',
  'demurrage_rule',
  'zonal_instruction',
];
