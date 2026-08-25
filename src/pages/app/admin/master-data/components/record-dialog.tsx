import type { ReactNode } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecordDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  isLoading: boolean;
  submitLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The create/edit shell every master-data form sits in.
 *
 * Holds the dialog chrome and the submit wiring; the caller supplies the
 * fields. The one behaviour worth naming is that the submit button is disabled
 * while the mutation is in flight — these forms write reference data that
 * several later phases read, and a double-submitted station is a duplicate-key
 * error the user has no way to interpret.
 */
const RecordDialog = <T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
  children,
  className = 'sm:max-w-lg',
}: RecordDialogProps<T>) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={className}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[60vh] space-y-4 overflow-y-auto px-0.5"
        >
          {children}
        </form>
      </Form>

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
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? 'Saving…' : submitLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RecordDialog;
