import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default:
          'bg-primary/15 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/25',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/50',
        destructive:
          'bg-destructive/15 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-red-400 dark:border-destructive/25',
        outline: 'border border-border text-foreground bg-transparent',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-emerald-500/12 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-400 dark:border-emerald-400/20',
        warning:
          'bg-amber-500/12 text-amber-700 border border-amber-500/20 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400/20',
        info: 'bg-sky-500/12 text-sky-700 border border-sky-500/20 dark:bg-sky-400/15 dark:text-sky-400 dark:border-sky-400/20',
        primary: 'bg-primary/12 text-primary border border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
