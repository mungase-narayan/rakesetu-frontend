/**
 * The master-data shapes, mirroring the backend schema.
 *
 * Kept in sync by hand for the same reason `pagination.types.ts` is: the two
 * projects do not share a package. Where the backend derives a union from a
 * `pgEnum`, the same union is written out here — a drift shows up as a select
 * that offers a value the API rejects, so the lists are exported as `const`
 * arrays and the unions derived from them, exactly as the backend does.
 */
import type { PaginationParams } from './pagination.types';

export const LINE_TYPES = ['single', 'double', 'multiple'] as const;
export type LineType = (typeof LINE_TYPES)[number];

export const TERMINAL_TYPES = [
  'goods_shed',
  'private_siding',
  'pft',
  'port',
] as const;
export type TerminalType = (typeof TERMINAL_TYPES)[number];

export const WAGON_OWNERS = ['IR', 'WIS', 'GPWIS', 'private'] as const;
export type WagonOwner = (typeof WAGON_OWNERS)[number];

export const WAGON_STATUSES = [
  'available',
  'in_use',
  'sick',
  'poh_due',
  'condemned',
] as const;
export type WagonStatus = (typeof WAGON_STATUSES)[number];

export const RAKE_STATES = [
  'EMPTY_AVAILABLE',
  'ALLOTTED',
  'MOVING_TO_LOADING',
  'PLACED_FOR_LOADING',
  'LOADING',
  'LOADED_RELEASED',
  'IN_TRANSIT_LOADED',
  'AT_DEST_YARD',
  'PLACED_FOR_UNLOADING',
  'UNLOADING',
  'UNLOADED_RELEASED',
  'EMPTY_RETURNING',
  'DETAINED',
  'SICK',
  'DIVERTED',
  'HELD_FOR_ORDER',
] as const;
export type RakeState = (typeof RAKE_STATES)[number];

export const CUSTOMER_TIERS = [
  'platinum',
  'gold',
  'silver',
  'standard',
] as const;
export type CustomerTier = (typeof CUSTOMER_TIERS)[number];

export const CHARGE_RULE_TYPES = [
  'free_time',
  'demurrage',
  'wharfage',
  'bsc',
  'dev_charge',
  'terminal_charge',
  'base_rate',
] as const;
export type ChargeRuleType = (typeof CHARGE_RULE_TYPES)[number];

export const DOCUMENT_TYPES = [
  'rate_circular',
  'goods_tariff',
  'commodity_classification',
  'demurrage_rule',
  'embargo_notice',
  'zonal_instruction',
  'forwarding_note',
  'rr',
  'waiver_evidence',
  'other',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const HANDLING_MODES = ['mechanised', 'manual', 'mixed'] as const;
export type HandlingMode = (typeof HANDLING_MODES)[number];

export const COMMODITY_GROUPS = [
  'cement',
  'coal',
  'steel',
  'foodgrain',
  'fertiliser',
  'petroleum',
  'container',
  'other',
] as const;
export type CommodityGroup = (typeof COMMODITY_GROUPS)[number];

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------

export interface Station {
  code: string;
  name: string;
  division: string;
  zone: string;
  lat: number;
  lng: number;
  isJunction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  fromCode: string;
  toCode: string;
  distanceKm: number;
  lineType: LineType;
  maxAxleLoadT: number;
  isElectrified: boolean;
  nominalSpeedKmph: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChargeableDistance {
  id: string;
  fromCode: string;
  toCode: string;
  km: number;
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * `basis` has no default, here or on the wire.
 *
 * One of these two numbers belongs on an invoice and the other does not, so the
 * caller says which it wants. See the backend's distance service.
 */
export type DistanceBasis = 'tariff' | 'operational';

export interface PathSection {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  nominalSpeedKmph: number;
}

export interface PathResult {
  stations: string[];
  sections: PathSection[];
  totalKm: number;
  totalMinutes: number;
}

export interface DistanceResponse {
  from: string;
  to: string;
  km: number;
  basis: DistanceBasis;
  path?: PathResult;
}

export interface ListStationsQuery extends PaginationParams {
  search?: string;
  division?: string;
  zone?: string;
}

export interface ListSectionsQuery extends PaginationParams {
  fromCode?: string;
  toCode?: string;
  lineType?: LineType;
}

export interface ListChargeableDistancesQuery extends PaginationParams {
  fromCode?: string;
  toCode?: string;
}

// ---------------------------------------------------------------------------
// Reference catalogues
// ---------------------------------------------------------------------------

export interface Commodity {
  code: string;
  name: string;
  group: CommodityGroup;
  class: string;
  minWeightCondition: string;
  isHazardous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCommoditiesQuery extends PaginationParams {
  search?: string;
  group?: CommodityGroup;
  isHazardous?: boolean;
}

export interface WagonType {
  code: string;
  name: string;
  tareT: number;
  ccT: number;
  ccPlus82T: number;
  commodityGroups: CommodityGroup[];
  lengthM: number;
  isCovered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListWagonTypesQuery extends PaginationParams {
  search?: string;
  commodityGroup?: CommodityGroup;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export interface Wagon {
  id: string;
  orgId: string;
  number: string;
  typeCode: string;
  owner: WagonOwner;
  ownerOrgId: string | null;
  /** `YYYY-MM-DD`. The §5.3 solver constraint. */
  pohDueOn: string;
  fitnessDueOn: string;
  status: WagonStatus;
  builtYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListWagonsQuery extends PaginationParams {
  search?: string;
  status?: WagonStatus;
  typeCode?: string;
  /** ISO date. */
  pohDueBefore?: string;
}

export interface Rake {
  id: string;
  orgId: string;
  code: string;
  wagonTypeCode: string;
  wagonCount: number;
  owner: WagonOwner;
  homeDivision: string;
  /** A projection cache — written by the Phase 4 event spine, never edited here. */
  currentState: RakeState;
  currentStation: string | null;
  stateSince: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListRakesQuery extends PaginationParams {
  search?: string;
  state?: RakeState;
  station?: string;
  wagonType?: string;
  division?: string;
  isActive?: boolean;
}

export interface CompositionEntry {
  id: string;
  position: number;
  fromTs: string;
  toTs: string | null;
  wagonId: string;
  wagonNumber: string;
  typeCode: string;
  pohDueOn: string;
  fitnessDueOn: string;
  status: WagonStatus;
}

export interface RakeConstraints {
  rakeId: string;
  at: string;
  earliestPohDue: string | null;
  earliestFitnessDue: string | null;
  wagonCount: number;
  totalLengthM: number;
}

export interface RakeCompositionResponse {
  at: string;
  composition: CompositionEntry[];
  constraints: RakeConstraints;
}

// ---------------------------------------------------------------------------
// Terminals and embargoes
// ---------------------------------------------------------------------------

export interface Terminal {
  id: string;
  orgId: string;
  stationCode: string;
  code: string;
  name: string;
  type: TerminalType;
  placementLines: number;
  isMechanised: boolean;
  handlingMode: HandlingMode;
  commodityGroups: CommodityGroup[];
  maxRakeLength: number;
  avgPlacementMinutes: number;
  operatorOrgId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListTerminalsQuery extends PaginationParams {
  search?: string;
  type?: TerminalType;
  stationCode?: string;
  commodityGroup?: CommodityGroup;
  isActive?: boolean;
}

export interface SectionRef {
  from: string;
  to: string;
}

/**
 * `embargoes.scope` — **DECISIONS D8**.
 *
 * An omitted key means "no restriction on that dimension". Present keys are
 * AND-ed; values within one key are OR-ed. The scope builder writes this shape
 * and the API reads back the sentence it means.
 */
export interface EmbargoScope {
  v: 1;
  stations?: string[];
  sections?: SectionRef[];
  commodityCodes?: string[];
  wagonTypeCodes?: string[];
  terminalIds?: string[];
  divisions?: string[];
}

export interface Embargo {
  id: string;
  orgId: string;
  scope: EmbargoScope;
  fromTs: string;
  toTs: string;
  reason: string;
  circularRef: string | null;
  documentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** The plain-English reading, produced by the same module that matches it. */
  summary: string;
}

export interface ListEmbargoesQuery extends PaginationParams {
  activeAt?: string;
  station?: string;
  commodity?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Commercial
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  orgId: string;
  /** The tenant that logs in, when there is one — DECISIONS D7. */
  customerOrgId: string | null;
  code: string;
  name: string;
  gstin: string | null;
  tier: CustomerTier;
  creditLimit: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSiding {
  id: string;
  orgId: string;
  customerId: string;
  terminalId: string;
  commodityCodes: string[];
  isDefaultLoading: boolean;
  isDefaultDest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Customer {
  sidings: CustomerSiding[];
}

export interface ListCustomersQuery extends PaginationParams {
  search?: string;
  tier?: CustomerTier;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Charge rules
// ---------------------------------------------------------------------------

export interface RuleSelector {
  v: 1;
  commodityGroups?: CommodityGroup[];
  terminalTypes?: TerminalType[];
  handlingModes?: HandlingMode[];
  wagonTypeCodes?: string[];
  divisions?: string[];
}

/** One value per dimension — what a *query* knows, as opposed to what a rule constrains. */
export interface RuleSelectorInput {
  commodityGroup?: CommodityGroup;
  terminalType?: TerminalType;
  handlingMode?: HandlingMode;
  wagonTypeCode?: string;
  division?: string;
}

export type ChargeRuleParams = Record<string, unknown>;

export interface ChargeRule {
  id: string;
  type: ChargeRuleType;
  params: ChargeRuleParams;
  selector: RuleSelector;
  effectiveFrom: string;
  effectiveTo: string | null;
  circularRef: string;
  documentId: string | null;
  clauseRef: string | null;
  version: number;
  supersedesId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListChargeRulesQuery extends PaginationParams {
  type?: ChargeRuleType;
  /** The as-of picker. Filters to the rules in force on this date. */
  effectiveAt?: string;
  circularRef?: string;
}

export type RejectionReason =
  | { kind: 'out_of_window'; detail: string }
  | { kind: 'selector_mismatch'; dimension: string; detail: string }
  | { kind: 'unknown_version'; detail: string }
  | { kind: 'less_specific'; detail: string }
  | { kind: 'lower_version'; detail: string };

export interface RuleCandidate {
  rule: ChargeRule;
  specificity: number;
}

export interface RuleRejection {
  rule: ChargeRule;
  reason: RejectionReason;
}

/** What the rule tester renders: the winner, and why each loser lost. */
export interface RuleResolution {
  type: ChargeRuleType;
  asOf: string;
  selector: RuleSelectorInput;
  winner: RuleCandidate | null;
  rejected: RuleRejection[];
  ambiguity?: { rules: ChargeRule[]; detail: string };
}

export interface ResolveRuleQuery extends RuleSelectorInput {
  type: ChargeRuleType;
  asOf: string;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface DocumentRow {
  id: string;
  orgId: string;
  type: DocumentType;
  title: string;
  number: string | null;
  issuedOn: string | null;
  effectiveFrom: string | null;
  supersededById: string | null;
  supersededAt: string | null;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  pageCount: number | null;
  isCorpus: boolean;
  uploadedBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListDocumentsQuery extends PaginationParams {
  search?: string;
  type?: DocumentType;
  isCorpus?: boolean;
  isActive?: boolean;
}

/** The URL is minted per request and never stored — see the backend service. */
export interface DownloadUrlResponse {
  url: string;
  expiresInSeconds: number;
}
