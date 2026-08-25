/**
 * `{ value, label }` pairs from a labels record.
 *
 * Its own module rather than a second export from `form-fields.tsx`: that file
 * exports only components, which is what lets fast refresh keep form state
 * across an edit. A stray helper beside them silently turns every keystroke in
 * a form into a remount during development.
 */
export const optionsFrom = <K extends string>(
  labels: Record<K, string>
): { value: string; label: string }[] =>
  (Object.entries(labels) as [K, string][]).map(([value, label]) => ({
    value,
    label,
  }));
