import * as React from 'react';

import { cn } from '@/lib/utils';

const INPUT_CLASS = cn(
  'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none',
  'selection:bg-primary selection:text-primary-foreground',
  'placeholder:text-muted-foreground/60',
  'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  'dark:bg-white/4 dark:border-white/9 dark:placeholder:text-muted-foreground/50',
  'focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
);

// Native temporal inputs reset their caret in Safari every time a controlled
// `value` is written back to them mid-edit, so manually typed dates/times never
// "stick" (each keystroke re-renders and Safari jumps the cursor). These types
// get routed through TemporalInput, which keeps the user's keystrokes while the
// field is focused. Chrome is unaffected either way.
const TEMPORAL_TYPES = new Set([
  'date',
  'datetime-local',
  'time',
  'month',
  'week',
]);

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  if (
    typeof type === 'string' &&
    TEMPORAL_TYPES.has(type) &&
    props.value !== undefined &&
    props.onChange
  ) {
    return (
      <TemporalInput
        type={type}
        className={cn(INPUT_CLASS, className)}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(INPUT_CLASS, className)}
      {...props}
    />
  );
}

/**
 * Controlled date/time input that survives Safari's mid-edit caret reset. While
 * the field is focused it shows the user's own keystrokes (`buffer`) and ignores
 * incoming `value` changes, so Safari never rewrites the DOM value under the
 * cursor. It stays fully controlled (no uncontrolled ref hijack), so
 * react-hook-form's `ref`/`onBlur`/`onChange` keep working.
 */
function TemporalInput({
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<'input'>) {
  const [buffer, setBuffer] = React.useState(value);
  const editingRef = React.useRef(false);

  // Mirror external value changes (prefill, reset, programmatic updates) only
  // when the user isn't actively typing into the field.
  React.useEffect(() => {
    if (!editingRef.current) setBuffer(value);
  }, [value]);

  return (
    <input
      data-slot="input"
      value={buffer ?? ''}
      onFocus={(e) => {
        editingRef.current = true;
        onFocus?.(e);
      }}
      onChange={(e) => {
        setBuffer(e.target.value);
        onChange?.(e);
      }}
      onBlur={(e) => {
        editingRef.current = false;
        setBuffer(value);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

export { Input };
