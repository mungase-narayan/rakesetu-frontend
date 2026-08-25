import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';

import { useCustomer, useCustomerMutations } from '@/api/commercial';
import { useTerminalList } from '@/api/terminal';
import { useCommodityList } from '@/api/commercial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { successToast } from '@/lib/toast.lib';
import { CUSTOMER_TIER_LABELS } from '@/constants';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

interface CustomerSheetProps {
  customerId: string | null;
  onClose: () => void;
}

/**
 * A customer's detail panel: tier, credit limit, and the sidings they may load
 * or receive at.
 *
 * The sidings are the operationally interesting half. A siding permit names
 * *commodities*, not commodity groups — a permit issued for cement does not
 * authorise clinker — so the picker lists commodity codes and the API stores
 * them verbatim.
 */
const CustomerSheet = ({ customerId, onClose }: CustomerSheetProps) => {
  const { customer, isLoading } = useCustomer(customerId);
  const { terminals } = useTerminalList({ limit: 100 });
  const { commodities } = useCommodityList({ limit: 100 });
  const { addSiding, removeSiding, isLoading: saving } = useCustomerMutations();

  const [adding, setAdding] = useState(false);
  const [terminalId, setTerminalId] = useState('');
  const [codes, setCodes] = useState<string[]>([]);

  const terminalName = (id: string) =>
    terminals?.find((terminal) => terminal.id === id)?.name ?? id;

  const onAdd = () => {
    if (!customerId || !terminalId || codes.length === 0) return;
    addSiding(
      { id: customerId, data: { terminalId, commodityCodes: codes } },
      {
        onSuccess: () => {
          setAdding(false);
          setTerminalId('');
          setCodes([]);
          successToast({ message: 'Siding added.' });
        },
      }
    );
  };

  return (
    <Sheet
      open={Boolean(customerId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{customer?.name ?? 'Customer'}</SheetTitle>
          <SheetDescription>
            {customer
              ? `${customer.code} · ${CUSTOMER_TIER_LABELS[customer.tier]}`
              : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {isLoading || !customer ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">Credit limit</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {customer.creditLimit === null
                      ? '—'
                      : inr.format(customer.creditLimit)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">GSTIN</p>
                  <p className="mt-0.5 font-mono text-xs">
                    {customer.gstin ?? '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Portal access</p>
                  <p className="mt-0.5 text-sm">
                    {customer.customerOrgId ? (
                      <>
                        Linked to a freight-customer organization — this
                        customer can sign in and file their own indents.
                      </>
                    ) : (
                      <>
                        No login. Indents for this customer are filed by the
                        zone on their behalf.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Sidings ({customer.sidings.length})
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setAdding((current) => !current)}
                  >
                    <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
                    Add siding
                  </Button>
                </div>

                {adding && (
                  <div className="mb-3 space-y-3 rounded-lg border border-border/60 p-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Terminal</p>
                      <select
                        value={terminalId}
                        onChange={(event) => setTerminalId(event.target.value)}
                        className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
                      >
                        <option value="">Select a terminal…</option>
                        {(terminals ?? []).map((terminal) => (
                          <option key={terminal.id} value={terminal.id}>
                            {terminal.code} — {terminal.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Commodities permitted here
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {(commodities ?? []).map((commodity) => (
                          <label
                            key={commodity.code}
                            className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-2 text-xs"
                          >
                            <Checkbox
                              checked={codes.includes(commodity.code)}
                              onCheckedChange={(checked) =>
                                setCodes((current) =>
                                  checked
                                    ? [...current, commodity.code]
                                    : current.filter(
                                        (code) => code !== commodity.code
                                      )
                                )
                              }
                            />
                            {commodity.code}
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={onAdd}
                      disabled={saving || !terminalId || codes.length === 0}
                    >
                      {saving ? 'Adding…' : 'Add siding'}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {customer.sidings.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      No sidings. Without one, this customer has nowhere to
                      load.
                    </p>
                  )}
                  {customer.sidings.map((siding) => (
                    <div
                      key={siding.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {terminalName(siding.terminalId)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {siding.commodityCodes.map((code) => (
                            <Badge
                              key={code}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {code}
                            </Badge>
                          ))}
                          {siding.isDefaultLoading && (
                            <Badge variant="secondary" className="text-[10px]">
                              Default loading
                            </Badge>
                          )}
                          {siding.isDefaultDest && (
                            <Badge variant="secondary" className="text-[10px]">
                              Default destination
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={saving}
                        onClick={() =>
                          customerId &&
                          removeSiding(
                            { id: customerId, sidingId: siding.id },
                            {
                              onSuccess: () =>
                                successToast({ message: 'Siding removed.' }),
                            }
                          )
                        }
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={15}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerSheet;
