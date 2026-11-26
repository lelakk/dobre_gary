import { useMutation } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from '@/lib/errors'

interface ConfirmDeleteDialogProps {
  title: string
  description: ReactNode
  /** Performs the deletion; the dialog closes once it succeeds. */
  onConfirm: () => Promise<unknown>
  onClose: () => void
  /** Turns a failed deletion into a message, e.g. a 409 when the record is still in use. */
  describeError?: (error: unknown) => string
}

/** Asks before deleting and keeps the dialog open with the reason when the deletion fails. */
export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  onClose,
  describeError = getErrorMessage,
}: ConfirmDeleteDialogProps) {
  const deleteMutation = useMutation({ mutationFn: onConfirm, onSuccess: onClose })

  return (
    <AlertDialog open onOpenChange={(open) => !open && !deleteMutation.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {deleteMutation.isError && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{describeError(deleteMutation.error)}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Anuluj</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Spinner />}
            Usuń
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
