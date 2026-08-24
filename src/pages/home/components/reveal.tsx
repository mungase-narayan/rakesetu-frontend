import type { ReactNode } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds, for lists of cards. */
  delay?: number;
}

/**
 * Fades and lifts its children into view once, when scrolled to. Respects
 * reduced-motion via motion's own `useReducedMotion` handling of `initial`.
 */
const Reveal = ({ children, className, delay = 0 }: Props) => (
  <motion.div
    className={cn(className)}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default Reveal;
