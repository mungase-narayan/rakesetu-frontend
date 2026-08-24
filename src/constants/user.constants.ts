export const USER_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'blocked',
  'archived',
] as const;

export const ORGANIZATION_TYPES = [
  'railway_zone',
  'freight_customer',
  'terminal_operator',
] as const;

/** The six RakeSetu personas — mirrors the backend role_name pgEnum. */
export const USER_ROLES = {
  ADMIN: 'admin',
  ZONAL_MANAGER: 'zonal_manager',
  FREIGHT_CONTROLLER: 'freight_controller',
  TERMINAL_SUPERVISOR: 'terminal_supervisor',
  COMMERCIAL_OFFICER: 'commercial_officer',
  FREIGHT_CUSTOMER: 'freight_customer',
} as const;

export const AVAILABLE_USER_ROLES = Object.values(USER_ROLES) as Array<
  (typeof USER_ROLES)[keyof typeof USER_ROLES]
>;

/** Human labels for the role chips shown in the UI. */
export const USER_ROLE_LABELS: Record<
  (typeof AVAILABLE_USER_ROLES)[number],
  string
> = {
  admin: 'Administrator',
  zonal_manager: 'Zonal Manager',
  freight_controller: 'Freight Controller',
  terminal_supervisor: 'Terminal Supervisor',
  commercial_officer: 'Commercial Officer',
  freight_customer: 'Freight Customer',
};
