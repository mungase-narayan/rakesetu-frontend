import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  CheckmarkCircle02Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons';

import { ROUTES } from '@/routes/route-paths';
import { Button } from '@/components/ui/button';
import { IstTime } from '@/components/shared';
import { useAcceptInvitation, useInvitationPreview } from '@/api/invitation';

import AuthCard from '../components/auth-card';
import SetPasswordForm from '../components/set-password-form';
import { TokenChecking, TokenInvalid } from '../components/token-states';

/**
 * `/auth/invitation/:token` — an invited person sets their first password.
 *
 * The link is validated **before** the form renders rather than on submit. A
 * person who has just typed and confirmed a password only to be told the link
 * died three days ago has done the work twice for nothing.
 */
const InvitationPage = () => {
  const { token = '' } = useParams();
  const { preview, isLoading, isError } = useInvitationPreview(token);
  const { acceptInvitation, isLoading: accepting } = useAcceptInvitation();
  const [done, setDone] = useState(false);

  if (isLoading) return <TokenChecking title="Accept your invitation" />;
  if (isError || !preview) {
    return (
      <TokenInvalid
        title="This invitation is no longer valid"
        action="invitation"
      />
    );
  }

  if (done) {
    return (
      <AuthCard
        icon={CheckmarkCircle02Icon}
        tone="success"
        title="Your account is ready"
        description={
          <>
            You can now sign in as{' '}
            <span className="font-medium text-foreground">{preview.email}</span>
            .
          </>
        }
      >
        <Button asChild className="w-full">
          <Link to={ROUTES.auth.login}>Go to sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={UserAdd01Icon}
      title={`Welcome, ${preview.firstName}`}
      description={
        <>
          You have been invited to join{' '}
          <span className="font-medium text-foreground">
            {preview.organizationName ?? 'RakeSetu'}
          </span>
          . Choose a password to activate your account.
        </>
      }
      footer={
        <>
          This link expires <IstTime value={preview.expiresAt} />
        </>
      }
    >
      <SetPasswordForm
        submitLabel="Activate my account"
        pendingLabel="Activating…"
        isLoading={accepting}
        onSubmit={(password) =>
          acceptInvitation(
            { token, data: { password } },
            { onSuccess: () => setDone(true) }
          )
        }
      />
    </AuthCard>
  );
};

export default InvitationPage;
