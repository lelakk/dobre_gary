import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

interface FormFieldProps {
  /** id of the input inside, so the label points to it. */
  id: string
  label: string
  error?: string
  description?: string
  className?: string
  children: ReactNode
}

/** Label, input, optional hint and validation message laid out the same way in every admin form. */
export function FormField({ id, label, error, description, className, children }: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/** Form-level error that does not belong to a single field (e.g. the backend is unreachable). */
export function FormServerError({ message }: { message?: string }) {
  if (!message) {
    return null
  }
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
