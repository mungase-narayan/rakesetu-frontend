import { z } from 'zod';

/**
 * The password policy, mirroring the backend's `invitation.validator.ts`.
 *
 * Duplicated on purpose and kept identical on purpose: the server is the one
 * that enforces it, but a rule only checked after a round trip is a rule the
 * person discovers by being rejected. The strength meter reads these same
 * predicates, so what the UI praises and what the API accepts cannot drift.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (v: string) => v.length >= 8,
  },
  {
    id: 'lower',
    label: 'A lowercase letter',
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    id: 'upper',
    label: 'An uppercase letter',
    test: (v: string) => /[A-Z]/.test(v),
  },
  { id: 'digit', label: 'A number', test: (v: string) => /[0-9]/.test(v) },
] as const;

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

/**
 * Confirmation is a UI-only field — it never reaches the API.
 *
 * It exists because this is the one form where a typo is unrecoverable without
 * a second email: the person cannot "try the old password" if they never had
 * one.
 */
export const setPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
