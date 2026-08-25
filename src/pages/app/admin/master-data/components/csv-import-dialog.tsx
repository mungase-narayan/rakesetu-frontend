import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  Upload04Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/** One parsed row, and whatever is wrong with it. */
interface ParsedRow<T> {
  index: number;
  raw: Record<string, string>;
  value: T | null;
  error: string | null;
}

interface CsvImportDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Header names the file must carry, in the order the sample shows them. */
  headers: string[];
  /** Turns one CSV row into a payload, or returns why it cannot. */
  parseRow: (row: Record<string, string>) => T | string;
  /** Which parsed fields to show in the preview, in order. */
  previewColumns: { header: string; value: (row: T) => string }[];
  onConfirm: (rows: T[]) => void;
  isLoading: boolean;
}

const SAMPLE_LIMIT = 8;

/**
 * Import a CSV: parse, **preview, validate, then commit**.
 *
 * The three steps are the whole design. Typing ninety sections by hand is not a
 * demo, but neither is a one-click import that half-lands — so the file is
 * parsed in the browser, every row is validated before anything is sent, and a
 * file with a bad row is refused **whole** rather than committed up to the
 * point where it broke. A partial import of reference data is worse than none:
 * the network is left in a state nobody chose, and the fix is to work out which
 * rows landed.
 *
 * The API's bulk endpoint takes the array in one request, so the commit is one
 * transaction-shaped call rather than ninety.
 */
const CsvImportDialog = <T,>({
  open,
  onOpenChange,
  title,
  description,
  headers,
  parseRow,
  previewColumns,
  onConfirm,
  isLoading,
}: CsvImportDialogProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const reset = () => {
    setFileName(null);
    setRows([]);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onFile = (file: File) => {
    setFileName(file.name);
    setFileError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      // Header names are trimmed because a file saved from a spreadsheet often
      // carries a trailing space, and "fromCode " matching nothing is a
      // confusing way to be told the file is fine.
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const missing = headers.filter(
          (header) => !(result.meta.fields ?? []).includes(header)
        );
        if (missing.length > 0) {
          setFileError(
            `The file is missing these columns: ${missing.join(', ')}`
          );
          setRows([]);
          return;
        }

        setRows(
          result.data.map((raw, index) => {
            const parsed = parseRow(raw);
            return typeof parsed === 'string'
              ? { index, raw, value: null, error: parsed }
              : { index, raw, value: parsed, error: null };
          })
        );
      },
      error: (error) => {
        setFileError(error.message);
        setRows([]);
      },
    });
  };

  const invalid = rows.filter((row) => row.error !== null);
  const valid = rows.filter((row): row is ParsedRow<T> & { value: T } =>
    Boolean(row.value)
  );
  const canCommit = rows.length > 0 && invalid.length === 0;

  const onSubmit = () => {
    if (!canCommit) return;
    onConfirm(valid.map((row) => row.value));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-border/70 p-4">
            <p className="text-xs text-muted-foreground">
              Expected columns, in any order:
            </p>
            <p className="mt-1 font-mono text-xs text-foreground">
              {headers.join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
            >
              <HugeiconsIcon icon={Upload04Icon} size={15} strokeWidth={2} />
              Choose a CSV file
            </Button>
            {fileName && (
              <span className="truncate text-xs text-muted-foreground">
                {fileName}
              </span>
            )}
          </div>

          {fileError && (
            <Alert variant="destructive">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {rows.length > 0 && (
            <Alert variant={invalid.length > 0 ? 'destructive' : 'default'}>
              <AlertDescription className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={
                    invalid.length > 0 ? Alert01Icon : CheckmarkCircle02Icon
                  }
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  {invalid.length > 0 ? (
                    <>
                      <strong>{invalid.length}</strong> of {rows.length} rows
                      are invalid. Nothing is imported until every row is valid
                      — a half-imported network is harder to fix than a rejected
                      file.
                    </>
                  ) : (
                    <>
                      <strong>{rows.length}</strong> rows parsed and validated.
                    </>
                  )}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {rows.length > 0 && (
            <div className="max-h-64 overflow-auto rounded-xl border border-border/60">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {previewColumns.map((column) => (
                      <TableHead key={column.header}>{column.header}</TableHead>
                    ))}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Invalid rows first: they are what the reader has to act on. */}
                  {[...invalid, ...valid]
                    .slice(0, SAMPLE_LIMIT + invalid.length)
                    .map((row) => (
                      <TableRow
                        key={row.index}
                        className={cn(row.error && 'bg-destructive/5')}
                      >
                        <TableCell className="text-muted-foreground">
                          {row.index + 1}
                        </TableCell>
                        {previewColumns.map((column) => (
                          <TableCell key={column.header}>
                            {row.value
                              ? column.value(row.value)
                              : (row.raw[column.header] ?? '—')}
                          </TableCell>
                        ))}
                        <TableCell
                          className={cn(
                            row.error ? 'text-destructive' : 'text-emerald-600'
                          )}
                        >
                          {row.error ?? 'OK'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {valid.length > SAMPLE_LIMIT && (
                <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                  Showing the first {SAMPLE_LIMIT} valid rows of {valid.length}.
                  All of them are imported.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canCommit || isLoading}
          >
            {isLoading ? 'Importing…' : `Import ${valid.length} rows`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
