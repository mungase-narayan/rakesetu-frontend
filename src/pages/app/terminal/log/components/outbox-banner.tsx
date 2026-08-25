import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, RefreshIcon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IstTime } from '@/components/shared';
import { clearDead, MAX_ATTEMPTS } from '@/lib/offline-queue';
import { RAKE_EVENT_TYPE_LABELS } from '@/constants/rake-event.constants';
import { useOutbox } from '@/api/rake-event';
import type { RakeEventType } from '@/types/rake-event.types';

/**
 * What is waiting to be sent, and what has given up.
 *
 * **This banner is the reason the offline queue is honest.** A queue nobody can
 * see is indistinguishable from an event that was lost: a supervisor taps
 * "record it", the connection is gone, and without this they walk away
 * believing the placement landed. The count says otherwise, and it stays until
 * the outbox is empty.
 *
 * Each entry names its rake and its event rather than showing a bare number,
 * because "3 pending" is not something a supervisor can act on and "R-4412
 * placed for loading" is — they can go and check.
 */
const OutboxBanner = () => {
  const { pending, dead, flush } = useOutbox();

  if (pending.length === 0 && dead.length === 0) return null;

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <Alert>
          <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={2} />
          <AlertDescription className="space-y-2">
            <p>
              <strong className="tabular-nums">{pending.length}</strong> event
              {pending.length === 1 ? '' : 's'} saved on this device, waiting
              for a connection. They will be sent automatically — and each
              carries the key it was created with, so a retry cannot record it
              twice.
            </p>

            <ul className="space-y-1 text-xs">
              {pending.map((entry) => (
                <li key={entry.key} className="flex flex-wrap gap-x-2">
                  <span className="font-medium">{entry.rakeCode}</span>
                  <span>
                    {
                      RAKE_EVENT_TYPE_LABELS[
                        entry.body.eventType as RakeEventType
                      ]
                    }
                  </span>
                  <span className="text-muted-foreground">
                    queued <IstTime value={entry.queuedAt} />
                    {entry.attempts > 0 &&
                      ` · ${entry.attempts} of ${MAX_ATTEMPTS} attempts`}
                  </span>
                </li>
              ))}
            </ul>

            <Button size="sm" variant="outline" onClick={() => void flush()}>
              Try now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {dead.length > 0 && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} size={16} strokeWidth={2} />
          <AlertDescription className="space-y-2">
            <p>
              <strong className="tabular-nums">{dead.length}</strong> event
              {dead.length === 1 ? '' : 's'} could not be sent after{' '}
              {MAX_ATTEMPTS} attempts and are no longer being retried. Record
              them again once the problem below is fixed.
            </p>

            <ul className="space-y-1 text-xs">
              {dead.map((entry) => (
                <li key={entry.key}>
                  <span className="font-medium">{entry.rakeCode}</span>{' '}
                  {
                    RAKE_EVENT_TYPE_LABELS[
                      entry.body.eventType as RakeEventType
                    ]
                  }{' '}
                  — {entry.lastError ?? 'unknown error'}
                </li>
              ))}
            </ul>

            <Button size="sm" variant="outline" onClick={clearDead}>
              Dismiss these
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OutboxBanner;
