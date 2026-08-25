import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { BoardOption } from '@/types/terminal-board.types';

/**
 * Which terminal the supervisor is standing at.
 *
 * **Why a picker rather than an assignment.** §5.1 says a supervisor at one
 * terminal never sees another's board, and the tenant boundary already enforces
 * the half of that which matters — a supervisor at Central Railway cannot read
 * another zone's terminals at all. Narrowing it further to one *person* would
 * need a user↔terminal table the schema does not have; `customer_sidings` maps
 * customers to terminals, not staff. Inventing that table to make a dropdown
 * disappear would be a schema decision taken by a component, so the choice is
 * explicit and the boundary stays where the server puts it.
 *
 * The occupancy count is on each option because it is the thing that decides
 * which one you want: "Hotgi Cement Siding · 3 on hand" is a reason to pick it.
 */
const TerminalPicker = ({
  options,
  value,
  onChange,
  isLoading,
}: {
  options: BoardOption[] | undefined;
  value: string | null;
  onChange: (id: string) => void;
  isLoading?: boolean;
}) => {
  if (isLoading && !options) {
    return <Skeleton className="h-9 w-full rounded-md sm:w-72" />;
  }

  if (!options || options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No terminals are on this zone&rsquo;s books yet.
      </p>
    );
  }

  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="Choose a terminal" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <span className="font-medium">{option.name}</span>
            <span className="ml-2 text-xs text-muted-foreground tabular-nums">
              {option.stationCode} · {option.onHand}/{option.placementLines} on
              hand
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TerminalPicker;
