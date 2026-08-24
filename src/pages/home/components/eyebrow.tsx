import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
}

/** Small pill label that sits above a section heading. */
const Eyebrow = ({ children, className }: Props) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[13px] font-semibold tracking-wide text-primary',
      className
    )}
  >
    {children}
  </span>
);

export default Eyebrow;
