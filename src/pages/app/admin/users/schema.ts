import { z } from 'zod';

import { AVAILABLE_USER_ROLES, USER_STATUSES } from '@/constants';

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be at most 100 characters`);

/**
 * Deliberately absent: `password`.
 *
 * The create endpoint sets none — there is no mail transport in the project and
 * no invitation table, so an account is created inactive and activated by an
 * administrator. A password field here would collect a secret the API cannot
 * store; the dialog says so in words instead.
 */
export const createUserSchema = z.object({
  firstName: name('First name'),
  middleName: z.string().trim().max(100).optional(),
  lastName: name('Last name'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(AVAILABLE_USER_ROLES).optional(),
});

export const editUserSchema = z.object({
  firstName: name('First name'),
  middleName: z.string().trim().max(100).optional(),
  lastName: name('Last name'),
  phone: z.string().trim().max(20).optional(),
  status: z.enum(USER_STATUSES),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
