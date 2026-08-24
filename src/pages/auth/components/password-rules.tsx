import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { PASSWORD_RULES } from '../schema';

/**
 * The policy, shown as it is met rather than reported after a rejection.
 *
 * Live feedback rather than an error list: a person setting their first
 * password has no way to guess the rules, and telling them only once they have
 * failed is a worse version of telling them up front.
 */
const PasswordRules = ({ value }: { value: string }) => (
  <ul className="grid gap-1.5 sm:grid-cols-2">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(value);
      return (
        <li
          key={rule.id}
          className={cn(
            'flex items-center gap-1.5 text-xs transition-colors',
            met
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
          )}
        >
          <HugeiconsIcon
            icon={met ? CheckmarkCircle02Icon : CircleIcon}
            size={13}
            strokeWidth={met ? 2.4 : 2}
            className="shrink-0"
          />
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRules;
