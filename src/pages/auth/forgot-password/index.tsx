import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailOpenIcon, MailSend01Icon } from '@hugeicons/core-free-icons';

import { ROUTES } from '@/routes/route-paths';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForgotPassword } from '@/api/invitation';

import AuthCard from '../components/auth-card';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schema';

/**
 * `/auth/forgot-password`
 *
 * The confirmation screen deliberately does **not** say whether an account
 * exists. The API answers identically for a real address and an unknown one,
 * and a UI that said "no such account" would undo that in one sentence — this
 * page is the easiest place in the product to test a leaked address list
 * against.
 */
const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading } = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (sentTo) {
    return (
      <AuthCard
        icon={MailOpenIcon}
        tone="success"
        title="Check your inbox"
        description={
          <>
            If an account exists for{' '}
            <span className="font-medium text-foreground">{sentTo}</span>, a
            reset link is on its way. It expires in an hour and can be used
            once.
          </>
        }
        footer={
          <Link to={ROUTES.auth.login} className="underline underline-offset-4">
            Back to sign in
          </Link>
        }
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSentTo(null);
            form.reset();
          }}
        >
          Use a different address
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={MailSend01Icon}
      title="Forgot your password?"
      description="Enter the email address on your account and we will send you a link to choose a new password."
      footer={
        <Link to={ROUTES.auth.login} className="underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            forgotPassword(
              { data: { email: values.email } },
              { onSuccess: () => setSentTo(values.email) }
            )
          )}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
