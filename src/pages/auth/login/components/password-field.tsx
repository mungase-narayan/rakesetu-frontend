import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { useFormContext } from 'react-hook-form';
import {
  LockPasswordIcon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { LoginFormValues } from '../schema';

interface Props {
  disabled?: boolean;
}

const PasswordField = ({ disabled }: Props) => {
  const form = useFormContext<LoginFormValues>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                disabled={disabled}
                autoComplete="current-password"
                className="pl-9 pr-10"
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : ViewIcon}
                  size={15}
                />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
