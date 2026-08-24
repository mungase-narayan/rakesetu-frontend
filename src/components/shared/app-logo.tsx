import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

/**
 * The RakeSetu mark: a wagon silhouette on the primary colour. Inline SVG
 * rather than an <img> so it inherits currentColor and never flashes.
 */
const AppLogo = ({ className }: Props) => {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-5 w-5 text-primary-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="7" y="5" width="18" height="16" rx="4" />
        <path d="M7 13h18" />
        <path d="M11 25l-2 3M21 25l2 3" />
        <path d="M11 21v3M21 21v3" />
        <circle cx="12" cy="17" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="20" cy="17" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
};

export default AppLogo;
