import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, FilterIcon } from '@hugeicons/core-free-icons';

import { successToast } from '@/lib/toast.lib';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CorrelationIdProps {
  value: string | null;
  onFilter?: (value: string) => void;
}

/**
 * The correlation id, click-to-copy and click-to-filter.
 *
 * One approval can fan out into several audit rows; the id is what relates them
 * to each other and to the log lines from the same request. Filtering by it
 * turns "something changed" into "here is the whole of what that one click
 * did", which is the question an audit trail actually gets asked.
 */
const CorrelationId = ({ value, onFilter }: CorrelationIdProps) => {
  if (!value) return <span className="text-muted-foreground">—</span>;

  const short = value.length > 12 ? `${value.slice(0, 8)}…` : value;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      successToast({ message: 'Correlation id copied.' });
    } catch {
      // Clipboard access is denied in some contexts; the id is still visible
      // in the tooltip, so this is not worth an error toast.
    }
  };

  return (
    <div
      className="flex items-center gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1 rounded px-1 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {short}
            <HugeiconsIcon icon={Copy01Icon} size={11} strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="font-mono text-xs">{value}</span>
        </TooltipContent>
      </Tooltip>

      {onFilter && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground"
              aria-label="Filter by this correlation id"
              onClick={() => onFilter(value)}
            >
              <HugeiconsIcon icon={FilterIcon} size={12} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show this request&apos;s whole trail</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default CorrelationId;
