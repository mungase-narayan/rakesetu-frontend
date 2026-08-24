import { Link } from 'react-router';
import { Alert02Icon } from '@hugeicons/core-free-icons';

import { ROUTES } from '@/routes/route-paths';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import AuthCard from './auth-card';

/** While the link is being checked. */
export const TokenChecking = ({ title }: { title: string }) => (
  <AuthCard title={title} description="Checking your link…">
    <div className="space-y-3">
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-2/3 rounded-lg" />
    </div>
  </AuthCard>
);

/**
 * The one screen every bad link lands on.
 *
 * Unknown, expired, revoked and already-used all look identical here because
 * they look identical from the API — telling somebody holding a guessed token
 * which of the four it was tells them whether to keep guessing.
 */
export const TokenInvalid = ({
  title,
  action,
}: {
  title: string;
  action: 'invitation' | 'reset';
}) => (
  <AuthCard
    icon={Alert02Icon}
    tone="danger"
    title={title}
    description={
      <>
        This link is invalid, has expired, or has already been used.
        {action === 'invitation'
          ? ' Ask an administrator to send you a new invitation.'
          : ' Request a new reset link and try again.'}
      </>
    }
    footer={
      <Link to={ROUTES.auth.login} className="underline underline-offset-4">
        Back to sign in
      </Link>
    }
  >
    {action === 'reset' && (
      <Button asChild className="w-full">
        <Link to={ROUTES.auth.forgotPassword}>Request a new link</Link>
      </Button>
    )}
  </AuthCard>
);
