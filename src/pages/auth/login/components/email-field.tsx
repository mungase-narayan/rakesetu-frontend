import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon } from '@hugeicons/core-free-icons';
import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { LoginFormValues } from '../schema';

interface Props {
  disabled?: boolean;
}

const EmailField = ({ disabled }: Props) => {
  const form = useFormContext<LoginFormValues>();

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email address</FormLabel>
          <FormControl>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="email"
                placeholder="you@railway.gov.in"
                disabled={disabled}
                autoComplete="email"
                className="pl-9"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailField;
