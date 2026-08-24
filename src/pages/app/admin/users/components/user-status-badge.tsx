import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { UserStatus } from '@/types/user-admin.types';

/**
 * Status as a colour as well as a word.
 *
 * `inactive` is the one worth reading carefully: it is the state every account
 * created from this screen starts in, because the create endpoint sets no
 * password. It means "cannot sign in yet", not "switched off".
 */
const TONE: Record<UserStatus, string> = {
  active:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  inactive:
    'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  suspended:
    'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400',
  blocked: 'border-destructive/30 bg-destructive/10 text-destructive',
  archived: 'border-border bg-muted text-muted-foreground',
};

const UserStatusBadge = ({ status }: { status: UserStatus }) => (
  <Badge
    variant="outline"
    className={cn('capitalize', TONE[status] ?? TONE.archived)}
  >
    {status}
  </Badge>
);

export default UserStatusBadge;
