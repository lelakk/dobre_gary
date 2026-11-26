import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RowActionsProps {
  /** Name of the record, used in the buttons' accessible labels. */
  label: string
  onEdit: () => void
  onDelete: () => void
}

export function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edytuj: ${label}`}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Usuń: ${label}`}
        className="text-zinc-500 hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  )
}
