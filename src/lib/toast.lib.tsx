import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Alert01Icon,
  Alert02Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
}

type ToastVariant = 'success' | 'error' | 'warning';

interface VariantConfig {
  title: string;
  icon: IconSvgElement;
  iconWrap: string;
  bar: string;
}

const VARIANTS: Record<ToastVariant, VariantConfig> = {
  success: {
    title: 'Success',
    icon: CheckmarkCircle01Icon,
    iconWrap:
      'bg-emerald-500/12 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-400 dark:border-emerald-400/20',
    bar: 'bg-emerald-500 dark:bg-emerald-400',
  },
  error: {
    title: 'Error',
    icon: Alert01Icon,
    iconWrap:
      'bg-red-500/12 text-red-600 border-red-500/20 dark:bg-red-400/15 dark:text-red-400 dark:border-red-400/20',
    bar: 'bg-red-500 dark:bg-red-400',
  },
  warning: {
    title: 'Warning',
    icon: Alert02Icon,
    iconWrap:
      'bg-amber-500/12 text-amber-600 border-amber-500/20 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400/20',
    bar: 'bg-amber-500 dark:bg-amber-400',
  },
};

const showToast = (variant: ToastVariant, message: string) => {
  const v = VARIANTS[variant];

  return toast.custom(
    (t) => (
      <div className="relative flex w-[min(92vw,400px)] items-start gap-3 overflow-hidden rounded-xl bg-card p-4 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            v.iconWrap
          )}
        >
          <HugeiconsIcon icon={v.icon} size={16} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
          <p className="mt-0.5 whitespace-pre-line wrap-break-word text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>

        <button
          onClick={() => toast.dismiss(t)}
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-muted">
          <div
            className={cn('h-full animate-[shrink_4s_linear_forwards]', v.bar)}
          />
        </div>
      </div>
    ),
    { duration: 4000 }
  );
};

export const successToast = ({ message }: ToastProps) =>
  showToast('success', message);

export const errorToast = ({ message }: ToastProps) =>
  showToast('error', message);

export const warningToast = ({ message }: ToastProps) =>
  showToast('warning', message);
