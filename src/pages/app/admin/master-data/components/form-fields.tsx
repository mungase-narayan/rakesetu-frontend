import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * The four field shapes the master-data forms are built from.
 *
 * Seven tabs, each with a create and an edit dialog, is fourteen forms over
 * roughly sixty fields. Written out longhand that is a thousand lines of
 * `FormField`/`FormItem`/`FormControl` in which the interesting part — which
 * field, what validation — is the minority of the text. These wrappers keep the
 * per-form code to a list of fields, which is what a form is.
 */

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TextField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder,
  uppercase,
}: BaseProps<T> & { placeholder?: string; uppercase?: boolean }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            value={(field.value as string) ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(uppercase && 'uppercase')}
            onChange={(event) =>
              field.onChange(
                uppercase
                  ? event.target.value.toUpperCase()
                  : event.target.value
              )
            }
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

export const NumberField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  step = 'any',
  placeholder,
}: BaseProps<T> & { step?: string; placeholder?: string }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            type="number"
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            value={
              field.value === undefined || field.value === null
                ? ''
                : String(field.value)
            }
            // An empty input is `undefined`, not `0`. Coercing a blank to zero
            // would write a zero-kilometre section rather than refusing one.
            onChange={(event) =>
              field.onChange(
                event.target.value === ''
                  ? undefined
                  : Number(event.target.value)
              )
            }
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  options,
  placeholder = 'Select…',
}: BaseProps<T> & {
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <Select
          value={(field.value as string) ?? ''}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

export const SwitchField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: BaseProps<T>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem
        className={cn(
          'flex items-center justify-between rounded-lg border border-border/60 p-3',
          className
        )}
      >
        <div className="space-y-0.5 pr-4">
          <FormLabel className="text-sm">{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </FormControl>
      </FormItem>
    )}
  />
);

/**
 * A checkbox list writing an array of values.
 *
 * Used for `commodityGroups` on wagon types and terminals, where the field is
 * genuinely a set and a multi-select popover would hide the choices behind a
 * click — on a form whose whole job is to say what a wagon can carry.
 */
export const CheckboxGroupField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  options,
}: BaseProps<T> & { options: readonly { value: string; label: string }[] }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => {
      const selected = (field.value as string[] | undefined) ?? [];
      return (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-2 text-xs"
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked
                        ? [...selected, option.value]
                        : selected.filter((value) => value !== option.value)
                    )
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      );
    }}
  />
);
