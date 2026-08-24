import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import PasswordRules from './password-rules';
import { setPasswordSchema, type SetPasswordFormValues } from '../schema';

interface SetPasswordFormProps {
  submitLabel: string;
  pendingLabel: string;
  isLoading: boolean;
  onSubmit: (password: string) => void;
}

/**
 * Shared by "accept invitation" and "reset password".
 *
 * One component because the two are the same act — choose a password, confirm
 * it, meet the policy — and the moment they are two components one of them
 * stops matching the server's rules.
 */
const SetPasswordForm = ({
  submitLabel,
  pendingLabel,
  isLoading,
  onSubmit,
}: SetPasswordFormProps) => {
  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    // Rules light up as they are met rather than after a failed submit.
    mode: 'onChange',
  });

  // `useWatch`, not `form.watch()`: the latter returns a function the React
  // Compiler cannot memoize safely, which `react-hooks/incompatible-library`
  // fails the build on. The subscription is the same; this is the hook form of it.
  const password = useWatch({ control: form.control, name: 'password' }) ?? '';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values.password))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordRules value={password} />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? pendingLabel : submitLabel}
        </Button>
      </form>
    </Form>
  );
};

export default SetPasswordForm;
