import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';
import { AppLogo } from '@/components/shared';

interface AuthCardProps {
  icon?: IconSvgElement;
  /** Tints the icon well — `danger` for a dead link, `success` for a done state. */
  tone?: 'default' | 'success' | 'danger';
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

const TONE = {
  default: 'border-primary/20 bg-primary/10 text-primary',
  success:
    'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  danger: 'border-destructive/25 bg-destructive/10 text-destructive',
};

/** The frame the three public token screens share, so they read as one flow. */
const AuthCard = ({
  icon,
  tone = 'default',
  title,
  description,
  children,
  footer,
}: AuthCardProps) => (
  <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
    <div className="w-full max-w-md space-y-6">
      <Link
        to={ROUTES.home}
        className="flex items-center justify-center gap-2.5"
      >
        <AppLogo />
        <span className="text-lg font-bold tracking-tight">RakeSetu</span>
      </Link>

      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-7">
        <div className="space-y-4 text-center">
          {icon && (
            <div
              className={cn(
                'mx-auto flex size-12 items-center justify-center rounded-xl border',
                TONE[tone]
              )}
            >
              <HugeiconsIcon icon={icon} size={22} strokeWidth={1.9} />
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {description && (
              <div className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>

      {footer && (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export default AuthCard;
