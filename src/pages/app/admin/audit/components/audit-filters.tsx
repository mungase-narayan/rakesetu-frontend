import { HugeiconsIcon } from '@hugeicons/react';
import { FilterRemoveIcon } from '@hugeicons/core-free-icons';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants';

const ALL = '__all__';

interface AuditFiltersProps {
  entityType: string;
  action: string;
  entityId: string;
  correlationId: string;
  fromDate: string;
  toDate: string;
  hasFilters: boolean;
  onEntityTypeChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityIdChange: (value: string) => void;
  onCorrelationChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClearFilters: () => void;
}

const AuditFilters = ({
  entityType,
  action,
  entityId,
  correlationId,
  fromDate,
  toDate,
  hasFilters,
  onEntityTypeChange,
  onActionChange,
  onEntityIdChange,
  onCorrelationChange,
  onFromChange,
  onToChange,
  onClearFilters,
}: AuditFiltersProps) => (
  <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-3">
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Entity type</Label>
      <Select
        value={entityType || ALL}
        onValueChange={(value) =>
          onEntityTypeChange(value === ALL ? '' : value)
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All entities</SelectItem>
          {AUDIT_ENTITY_TYPES.map((value) => (
            <SelectItem key={value} value={value} className="font-mono text-xs">
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Action</Label>
      <Select
        value={action || ALL}
        onValueChange={(value) => onActionChange(value === ALL ? '' : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All actions</SelectItem>
          {AUDIT_ACTIONS.map((value) => (
            <SelectItem key={value} value={value} className="font-mono text-xs">
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label
        htmlFor="audit-correlation"
        className="text-xs text-muted-foreground"
      >
        Correlation id
      </Label>
      <Input
        id="audit-correlation"
        value={correlationId}
        onChange={(event) => onCorrelationChange(event.target.value)}
        placeholder="One request's whole trail"
        className="font-mono text-xs"
      />
    </div>

    <div className="space-y-1.5">
      <Label
        htmlFor="audit-entity-id"
        className="text-xs text-muted-foreground"
      >
        Entity id
      </Label>
      <Input
        id="audit-entity-id"
        value={entityId}
        onChange={(event) => onEntityIdChange(event.target.value)}
        placeholder="UUID of the row that changed"
        className="font-mono text-xs"
      />
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="audit-from" className="text-xs text-muted-foreground">
        From (IST)
      </Label>
      <Input
        id="audit-from"
        type="date"
        value={fromDate}
        onChange={(event) => onFromChange(event.target.value)}
      />
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="audit-to" className="text-xs text-muted-foreground">
        To (IST)
      </Label>
      <div className="flex gap-2">
        <Input
          id="audit-to"
          type="date"
          value={toDate}
          onChange={(event) => onToChange(event.target.value)}
        />
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearFilters}
            aria-label="Clear filters"
            className="shrink-0 text-muted-foreground"
          >
            <HugeiconsIcon icon={FilterRemoveIcon} size={16} strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default AuditFilters;
