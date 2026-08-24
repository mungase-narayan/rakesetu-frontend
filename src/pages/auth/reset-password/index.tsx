import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  CheckmarkCircle02Icon,
  LockPasswordIcon,
} from '@hugeicons/core-free-icons';

import { ROUTES } from '@/routes/route-paths';
import { Button } from '@/components/ui/button';
import { IstTime } from '@/components/shared';
import { useResetPassword, useResetPreview } from '@/api/invitation';

import AuthCard from '../components/auth-card';
import SetPasswordForm from '../components/set-password-form';
import { TokenChecking, TokenInvalid } from '../components/token-states';

/** `/auth/reset-password/:token` — choosing a new password. */
const ResetPasswordPage = () => {
  const { token = '' } = useParams();
  const { preview, isLoading, isError } = useResetPreview(token);
  const { resetPassword, isLoading: saving } = useResetPassword();
  const [done, setDone] = useState(false);

  if (isLoading) return <TokenChecking title="Reset your password" />;
  if (isError || !preview) {
    return (
      <TokenInvalid title="This reset link is no longer valid" action="reset" />
    );
  }

  if (done) {
    return (
      <AuthCard
        icon={CheckmarkCircle02Icon}
        tone="success"
        title="Password updated"
        description="Every other session has been signed out. Sign in with your new password."
      >
        <Button asChild className="w-full">
          <Link to={ROUTES.auth.login}>Go to sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={LockPasswordIcon}
      title="Choose a new password"
      description={
        <>
          For{' '}
          <span className="font-medium text-foreground">{preview.email}</span>.
          Setting it will sign out every other device.
        </>
      }
      footer={
        <>
          This link expires <IstTime value={preview.expiresAt} />
        </>
      }
    >
      <SetPasswordForm
        submitLabel="Update my password"
        pendingLabel="Updating…"
        isLoading={saving}
        onSubmit={(password) =>
          resetPassword(
            { token, data: { password } },
            { onSuccess: () => setDone(true) }
          )
        }
      />
    </AuthCard>
  );
};

export default ResetPasswordPage;
