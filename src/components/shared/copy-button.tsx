import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/**
 * Copies a value and says so in place.
 *
 * The confirmation is the icon swapping to a tick for a moment rather than a
 * toast: these sit next to identifiers a person copies several of in a row, and
 * three stacked toasts for three copies is noise about something that plainly
 * worked.
 */
const CopyButton = ({ value, label = 'Copy', className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard access is denied in some contexts. The value is on screen
      // and selectable, so this is not worth interrupting anyone over.
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onCopy}
          aria-label={label}
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            className
          )}
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={13}
            strokeWidth={2.2}
            className={cn(copied && 'text-emerald-600 dark:text-emerald-400')}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : label}</TooltipContent>
    </Tooltip>
  );
};

export default CopyButton;
