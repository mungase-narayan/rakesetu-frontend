import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Download04Icon,
  File01Icon,
  Upload04Icon,
} from '@hugeicons/core-free-icons';

import { useDocumentList, useDocumentMutations } from '@/api/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ConfirmDialog,
  DataTable,
  IstTime,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { errorToast, successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { CORPUS_DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/constants';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  DOCUMENT_TYPES,
  type DocumentRow,
  type DocumentType,
} from '@/types/master-data.types';

import RecordDialog from '../master-data/components/record-dialog';
import {
  SelectField,
  SwitchField,
  TextField,
} from '../master-data/components/form-fields';
import { optionsFrom } from '../master-data/components/form-options';
import {
  documentUploadSchema,
  type DocumentUploadFormValues,
} from '../master-data/schema';

const helper = columnHelper<DocumentRow>();

const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EMPTY: DocumentUploadFormValues = {
  title: '',
  type: 'rate_circular',
  number: '',
  issuedOn: '',
  effectiveFrom: '',
  isCorpus: true,
};

/**
 * Documents.
 *
 * Two things on this screen are worth understanding.
 *
 * **The corpus flag** decides whether Phase 12 chunks and embeds a file. It
 * defaults from the document type — a rate circular is corpus material, a
 * waiver photo is not — but stays editable, because a circular filed as evidence
 * in a dispute is a real case.
 *
 * **The download link is minted per click** and never stored. A presigned URL is
 * a fifteen-minute bearer token for the object; caching one would hand somebody
 * a link that outlives the authorisation that produced it.
 */
const DocumentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<DocumentType | ''>('');
  const [corpusOnly, setCorpusOnly] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { documents, pagination, isLoading } = useDocumentList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    type: type || undefined,
    isCorpus: corpusOnly ? true : undefined,
  });

  const {
    uploadDocument,
    deleteDocument,
    requestDownloadUrl,
    isUploading,
    isLoading: mutating,
  } = useDocumentMutations();

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: EMPTY,
  });

  // `useWatch` rather than `form.watch()`: the latter returns a fresh function
  // on every render, which defeats memoization for everything downstream of it.
  const watchedType = useWatch({ control: form.control, name: 'type' });

  // The default follows the type, but only until somebody touches the switch —
  // after that their choice stands, because they know something the type does not.
  useEffect(() => {
    if (!form.formState.dirtyFields.isCorpus) {
      form.setValue('isCorpus', CORPUS_DOCUMENT_TYPES.includes(watchedType));
    }
  }, [watchedType, form]);

  /**
   * Clearing the form is an event, not a synchronisation.
   *
   * Doing it in an effect keyed on `uploadOpen` would queue a second render
   * every time the dialog opens; doing it here happens once, in the handler
   * that already knows the dialog is opening.
   */
  const openUpload = () => {
    form.reset(EMPTY);
    setFile(null);
    setUploadOpen(true);
  };

  const onDownload = async (document: DocumentRow) => {
    try {
      const response = await requestDownloadUrl({ id: document.id });
      // Opened rather than stored. The URL is live for fifteen minutes and the
      // row never holds it.
      window.open(response.data.data.url, '_blank', 'noopener');
    } catch {
      errorToast({ message: 'Could not generate a download link.' });
    }
  };

  const columns = [
    helper.accessor('title', {
      header: 'Title',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="truncate text-sm font-medium">{row.original.title}</p>
          {row.original.number && (
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.number}
            </p>
          )}
        </div>
      ),
      meta: { className: 'w-72' },
    }),
    helper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <Badge variant="outline">{DOCUMENT_TYPE_LABELS[info.getValue()]}</Badge>
      ),
      meta: { className: 'w-48' },
    }),
    helper.accessor('isCorpus', {
      header: 'Corpus',
      cell: (info) =>
        info.getValue() ? (
          <Badge variant="secondary">In corpus</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Transactional</span>
        ),
      meta: { className: 'w-32' },
    }),
    helper.accessor('sizeBytes', {
      header: 'Size',
      cell: (info) => (
        <span className="text-xs">{humanSize(info.getValue())}</span>
      ),
      meta: { className: 'w-24' },
    }),
    helper.accessor('createdAt', {
      header: 'Uploaded',
      cell: (info) => <IstTime value={info.getValue()} />,
      meta: { className: 'w-40' },
    }),
    helper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            title="Download (link is valid for 15 minutes)"
            onClick={(event) => {
              event.stopPropagation();
              void onDownload(row.original);
            }}
          >
            <HugeiconsIcon icon={Download04Icon} size={15} strokeWidth={2} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Delete"
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(row.original);
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} size={15} strokeWidth={2} />
          </Button>
        </div>
      ),
      meta: { className: 'w-24', headerClassName: 'text-right' },
    }),
  ];

  const onUpload = (values: DocumentUploadFormValues) => {
    if (!file) {
      errorToast({ message: 'Choose a file first.' });
      return;
    }
    uploadDocument(
      {
        data: {
          file,
          type: values.type,
          title: values.title,
          number: values.number || undefined,
          issuedOn: values.issuedOn || undefined,
          effectiveFrom: values.effectiveFrom || undefined,
          isCorpus: values.isCorpus,
        },
      },
      {
        onSuccess: () => {
          setUploadOpen(false);
          successToast({ message: `Uploaded “${values.title}”.` });
        },
      }
    );
  };

  const rows = documents ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Circulars, tariffs and evidence. Stored privately; every download link is minted on request and expires in fifteen minutes."
        breadcrumb={[
          { label: 'Admin', to: ROUTES.admin.dashboard },
          { label: 'Documents' },
        ]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => openUpload()}>
            <HugeiconsIcon icon={Upload04Icon} size={15} strokeWidth={2} />
            Upload
          </Button>
        }
      />

      <Alert>
        <AlertDescription>
          <strong>In corpus</strong> means the freight copilot will read this
          document once retrieval is built. Transactional files — forwarding
          notes, waiver evidence — are stored here too and deliberately stay out
          of it.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search title or number…"
          className="h-9 w-64"
        />
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as DocumentType | '');
            setPage(1);
          }}
          className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="">Any type</option>
          {DOCUMENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {DOCUMENT_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant={corpusOnly ? 'default' : 'outline'}
          onClick={() => {
            setCorpusOnly((current) => !current);
            setPage(1);
          }}
        >
          Corpus only
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          icon={File01Icon}
          title="No documents"
          description="Upload a rate circular to give the charge explainer something to cite."
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              label="documents"
            />
          )}
        </>
      )}

      <RecordDialog
        open={uploadOpen}
        onOpenChange={(open) => (open ? openUpload() : setUploadOpen(false))}
        title="Upload a document"
        description="Up to 50 MB. The file is stored privately and identified by its content hash, so the same file cannot be uploaded twice."
        form={form}
        onSubmit={onUpload}
        isLoading={isUploading}
        submitLabel="Upload"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-border/70 p-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <HugeiconsIcon icon={Upload04Icon} size={15} strokeWidth={2} />
                Choose a file
              </Button>
              <span className="truncate text-xs text-muted-foreground">
                {file
                  ? `${file.name} · ${humanSize(file.size)}`
                  : 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="title"
              label="Title"
              placeholder="Rate Circular 14 of 2026"
              disabled={isUploading}
              className="sm:col-span-2"
            />
            <SelectField
              control={form.control}
              name="type"
              label="Type"
              options={optionsFrom(DOCUMENT_TYPE_LABELS)}
              disabled={isUploading}
            />
            <TextField
              control={form.control}
              name="number"
              label="Number"
              placeholder="RC-14/2026"
              disabled={isUploading}
            />
            <TextField
              control={form.control}
              name="issuedOn"
              label="Issued on"
              placeholder="2026-07-01"
              disabled={isUploading}
            />
            <TextField
              control={form.control}
              name="effectiveFrom"
              label="Effective from"
              placeholder="2026-07-01"
              disabled={isUploading}
            />
          </div>

          <SwitchField
            control={form.control}
            name="isCorpus"
            label="Include in the retrieval corpus"
            description="On for policy documents; off for transactional evidence."
            disabled={isUploading}
          />
        </div>
      </RecordDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        description="The row is hidden from every screen. The stored file is retained, because a document that priced an old invoice must stay fetchable when that invoice is disputed."
        confirmLabel="Delete"
        destructive
        loading={mutating}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteDocument(
            { id: pendingDelete.id },
            {
              onSuccess: () => {
                setPendingDelete(null);
                successToast({ message: 'Document deleted.' });
              },
            }
          );
        }}
      />
    </div>
  );
};

export default DocumentsPage;
