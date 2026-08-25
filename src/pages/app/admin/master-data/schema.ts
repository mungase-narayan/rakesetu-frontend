import { z } from 'zod';

import {
  CHARGE_RULE_TYPES,
  COMMODITY_GROUPS,
  CUSTOMER_TIERS,
  DOCUMENT_TYPES,
  HANDLING_MODES,
  LINE_TYPES,
  RAKE_STATES,
  TERMINAL_TYPES,
  WAGON_OWNERS,
  WAGON_STATUSES,
} from '@/types/master-data.types';

/**
 * Client-side validation for the master-data forms.
 *
 * Deliberately the same rules the API enforces, not a looser subset. The server
 * is the authority — these schemas exist so a typo is caught before a round
 * trip, not so the server can trust them. Where a rule encodes a *reason*
 * (`class` is required because Phase 10 prices with it), the message says so,
 * because a form that only says "Required" teaches nobody anything.
 */

const stationCode = z
  .string()
  .trim()
  .min(2, 'A station code is at least 2 characters')
  .max(8, 'A station code is at most 8 characters')
  .regex(/^[A-Z0-9]+$/, 'Station codes are uppercase letters and digits');

export const stationSchema = z.object({
  code: stationCode,
  name: z.string().trim().min(2, 'Name is required').max(120),
  division: z.string().trim().min(2, 'Division is required').max(60),
  zone: z.string().trim().min(2, 'Zone is required').max(10),
  lat: z
    .number({ message: 'Latitude is required' })
    .min(6, 'Latitude is outside India')
    .max(38, 'Latitude is outside India'),
  lng: z
    .number({ message: 'Longitude is required' })
    .min(68, 'Longitude is outside India')
    .max(98, 'Longitude is outside India'),
  isJunction: z.boolean().optional(),
});

export const sectionSchema = z
  .object({
    fromCode: stationCode,
    toCode: stationCode,
    distanceKm: z
      .number({ message: 'Distance is required' })
      .gt(0, 'Distance must be greater than zero')
      .max(500),
    lineType: z.enum(LINE_TYPES),
    maxAxleLoadT: z.number({ message: 'Axle load is required' }).gt(0).max(40),
    isElectrified: z.boolean().optional(),
    nominalSpeedKmph: z
      .number({ message: 'Nominal speed is required' })
      .gt(
        0,
        'Speed must be greater than zero — it is the divisor in the ETA cold start'
      )
      .max(200),
  })
  .refine((value) => value.fromCode !== value.toCode, {
    // A zero-length self-loop, which the shortest-path search would relax forever.
    message: 'A section cannot start and end at the same station',
    path: ['toCode'],
  });

export const chargeableDistanceSchema = z
  .object({
    fromCode: stationCode,
    toCode: stationCode,
    km: z
      .number({ message: 'Distance is required' })
      .int('Tariff tables publish whole kilometres')
      .gt(0)
      .max(5000),
    sourceRef: z.string().trim().max(120).optional(),
  })
  .refine((value) => value.fromCode !== value.toCode, {
    message: 'A tariff distance needs two different stations',
    path: ['toCode'],
  });

export const commoditySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9]+$/, 'Uppercase code'),
  name: z.string().trim().min(2, 'Name is required').max(120),
  group: z.enum(COMMODITY_GROUPS),
  class: z
    .string()
    .trim()
    .min(1, 'Class is required — Phase 10 prices freight with it')
    .max(10),
  minWeightCondition: z
    .string()
    .trim()
    .min(
      1,
      'Required — this is the minimum-weight rule the charge engine applies'
    )
    .max(20),
  isHazardous: z.boolean().optional(),
});

export const wagonTypeSchema = z.object({
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(2, 'Name is required').max(120),
  tareT: z.number({ message: 'Tare weight is required' }).gt(0).max(100),
  ccT: z.number({ message: 'Carrying capacity is required' }).gt(0).max(200),
  ccPlus82T: z.number({ message: 'CC+8+2 is required' }).gt(0).max(200),
  commodityGroups: z
    .array(z.enum(COMMODITY_GROUPS))
    .min(
      1,
      'Pick at least one commodity group — this is the solver’s compatibility check'
    ),
  lengthM: z.number({ message: 'Length is required' }).gt(0).max(100),
  isCovered: z.boolean().optional(),
});

export const wagonSchema = z.object({
  number: z.string().trim().min(3, 'Wagon number is required').max(20),
  typeCode: z.string().trim().min(2, 'Wagon type is required').max(20),
  owner: z.enum(WAGON_OWNERS),
  pohDueOn: z
    .string()
    .min(
      1,
      'Required — the solver refuses a rake whose overhaul falls mid-journey'
    ),
  fitnessDueOn: z
    .string()
    .min(
      1,
      'Required — a wagon out of fitness mid-haul strands the whole rake'
    ),
  status: z.enum(WAGON_STATUSES).optional(),
  builtYear: z.number().int().min(1900).max(2100).optional(),
});

export const rakeSchema = z.object({
  code: z.string().trim().min(2, 'Rake code is required').max(20),
  wagonTypeCode: z.string().trim().min(2, 'Wagon type is required'),
  wagonCount: z
    .number({ message: 'Wagon count is required' })
    .int()
    .min(1)
    .max(120),
  owner: z.enum(WAGON_OWNERS),
  homeDivision: z.string().trim().min(2, 'Home division is required').max(60),
  currentStation: z.string().trim().max(8).optional(),
  currentState: z.enum(RAKE_STATES).optional(),
});

export const terminalSchema = z.object({
  code: z.string().trim().min(2, 'Terminal code is required').max(20),
  name: z.string().trim().min(2, 'Name is required').max(120),
  stationCode: stationCode,
  type: z.enum(TERMINAL_TYPES),
  placementLines: z
    .number({ message: 'Placement lines are required' })
    .int()
    .min(1, 'A terminal has at least one placement line')
    .max(20),
  handlingMode: z.enum(HANDLING_MODES),
  commodityGroups: z
    .array(z.enum(COMMODITY_GROUPS))
    .min(1, 'Pick at least one'),
  maxRakeLength: z
    .number({ message: 'Maximum rake length is required' })
    .int()
    .min(1)
    .max(120),
  avgPlacementMinutes: z.number().int().min(1).max(2880).optional(),
  isMechanised: z.boolean().optional(),
});

export const customerSchema = z.object({
  code: z.string().trim().min(2, 'Customer code is required').max(20),
  name: z.string().trim().min(2, 'Name is required').max(200),
  tier: z.enum(CUSTOMER_TIERS),
  gstin: z
    .string()
    .trim()
    .length(15, 'A GSTIN is exactly 15 characters')
    .optional()
    .or(z.literal('')),
  creditLimit: z.number().min(0).optional(),
  contactEmail: z
    .string()
    .trim()
    .email('Enter a valid email')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().trim().max(20).optional(),
});

export const sidingSchema = z.object({
  terminalId: z.string().min(1, 'Pick a terminal'),
  commodityCodes: z
    .array(z.string())
    .min(1, 'A siding permits at least one commodity'),
  isDefaultLoading: z.boolean().optional(),
  isDefaultDest: z.boolean().optional(),
});

export const documentUploadSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(300),
  type: z.enum(DOCUMENT_TYPES),
  number: z.string().trim().max(120).optional(),
  issuedOn: z.string().optional(),
  effectiveFrom: z.string().optional(),
  isCorpus: z.boolean().optional(),
});

export const chargeRuleSchema = z.object({
  type: z.enum(CHARGE_RULE_TYPES),
  effectiveFrom: z.string().min(1, 'Every rule states when it starts'),
  effectiveTo: z.string().optional(),
  circularRef: z
    .string()
    .trim()
    .min(2, 'Required — an unattributable charge is not defensible')
    .max(120),
  clauseRef: z.string().trim().max(60).optional(),
  version: z.number().int().min(1).optional(),
  /** Free-form JSON, validated against `type` by the API. */
  params: z.string().min(2, 'Parameters are required'),
  selector: z
    .string()
    .min(2, 'A selector is required — use {"v":1} to match everything'),
});

export type StationFormValues = z.infer<typeof stationSchema>;
export type SectionFormValues = z.infer<typeof sectionSchema>;
export type ChargeableDistanceFormValues = z.infer<
  typeof chargeableDistanceSchema
>;
export type CommodityFormValues = z.infer<typeof commoditySchema>;
export type WagonTypeFormValues = z.infer<typeof wagonTypeSchema>;
export type WagonFormValues = z.infer<typeof wagonSchema>;
export type RakeFormValues = z.infer<typeof rakeSchema>;
export type TerminalFormValues = z.infer<typeof terminalSchema>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type SidingFormValues = z.infer<typeof sidingSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type ChargeRuleFormValues = z.infer<typeof chargeRuleSchema>;
