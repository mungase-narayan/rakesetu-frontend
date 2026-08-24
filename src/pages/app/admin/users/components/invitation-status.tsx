import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, MailSend01Icon } from '@hugeicons/core-free-icons';

import { formatIst } from '@/lib/ist';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AdminUserInvitation } from '@/types/user-admin.types';

/**
 * What became of the invitation, beside the "invitation pending" chip.
 *
 * Shown only for accounts that have never been activated — once somebody has a
 * password, how their invitation went is history nobody needs. The failed state
 * is the one that earns its place: without it, a send that never happened is
 * indistinguishable from an invitation sitting unopened, and the admin has no
 * reason to press Resend.
 */
const InvitationStatus = ({
  invitation,
}: {
  invitation?: AdminUserInvitation | null;
}) => {
  if (!invitation) return null;

  if (invitation.status === 'failed') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
            <HugeiconsIcon icon={Alert02Icon} size={12} strokeWidth={2.2} />
            Delivery failed
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {invitation.lastError ?? 'The invitation email could not be sent.'}
          {invitation.attempts > 1 && ` (${invitation.attempts} attempts)`}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (invitation.status === 'sent') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={MailSend01Icon} size={12} strokeWidth={2} />
            Invitation sent
          </span>
        </TooltipTrigger>
        <TooltipContent>Sent {formatIst(invitation.sentAt)}</TooltipContent>
      </Tooltip>
    );
  }

  // queued or sending — in flight, and not worth alarming anyone about.
  return (
    <span className="text-[11px] text-muted-foreground">Invitation queued</span>
  );
};

export default InvitationStatus;
