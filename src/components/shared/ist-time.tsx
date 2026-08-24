import { cn } from '@/lib/utils';
import { formatIst } from '@/lib/ist';

interface IstTimeProps {
  value: string | Date | null | undefined;
  variant?: 'datetime' | 'date';
  className?: string;
  /** Fallback when the value is absent — "Never", "Not placed", etc. */
  emptyLabel?: string;
}

const IstTime = ({
  value,
  variant = 'datetime',
  className,
  emptyLabel = '—',
}: IstTimeProps) => {
  if (!value) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {emptyLabel}
      </span>
    );
  }

  const date = value instanceof Date ? value : new Date(value);
  const valid = !Number.isNaN(date.getTime());

  return (
    <time
      // The machine-readable half stays UTC, which is what it is.
      dateTime={valid ? date.toISOString() : undefined}
      title={valid ? `${date.toISOString()} (UTC)` : undefined}
      className={cn('whitespace-nowrap tabular-nums', className)}
    >
      {formatIst(value, variant)}
    </time>
  );
};

export default IstTime;
