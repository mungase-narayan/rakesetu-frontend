import { useState } from 'react';
import Papa from 'papaparse';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download04Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { errorToast, successToast } from '@/lib/toast.lib';

/**
 * One column of the exported file: the header text and how to read the value
 * off a row. A function rather than a key path so a formatted cell — an IST
 * timestamp, a joined list of role names — exports the same string the screen
 * shows rather than the raw object behind it.
 */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

interface CsvExportProps<T> {
  rows: T[];
  columns: CsvColumn<T>[];
  /** Base name; the download is stamped with the date. */
  filename: string;
  label?: string;
  disabled?: boolean;
}

/** `audit-log` → `audit-log-2026-08-24.csv`. */
const stampedName = (filename: string): string => {
  const today = new Date().toISOString().slice(0, 10);
  return `${filename.replace(/\.csv$/i, '')}-${today}.csv`;
};

/**
 * Exports the rows currently in hand — deliberately, not the whole result set.
 *
 * The table is server-paginated, so "export" here means "export what you are
 * looking at, filters and all". Silently fetching every page would turn a
 * button click into an unbounded download of a tenant's history; when the whole
 * set is genuinely wanted, the filters are the way to ask for it.
 */
const CsvExport = <T,>({
  rows,
  columns,
  filename,
  label = 'Export CSV',
  disabled,
}: CsvExportProps<T>) => {
  const [working, setWorking] = useState(false);

  const onExport = () => {
    if (!rows.length) return;
    setWorking(true);

    try {
      const csv = Papa.unparse({
        fields: columns.map((c) => c.header),
        data: rows.map((row) =>
          columns.map((c) => {
            const value = c.value(row);
            return value === null || value === undefined ? '' : String(value);
          })
        ),
      });

      // A BOM (U+FEFF), so Excel opens the file as UTF-8 rather than mangling
      // the rupee sign and the em dashes these tables are full of.
      const blob = new Blob([`\ufeff${csv}`], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = stampedName(filename);
      anchor.click();
      URL.revokeObjectURL(url);

      successToast({ message: `Exported ${rows.length} rows.` });
    } catch {
      errorToast({ message: 'Could not build the CSV file.' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={disabled || working || rows.length === 0}
      className="gap-1.5"
    >
      <HugeiconsIcon icon={Download04Icon} size={15} strokeWidth={2} />
      {label}
    </Button>
  );
};

export default CsvExport;
