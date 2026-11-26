import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/api/http'
import { getErrorMessage } from '@/lib/errors'

/** Where to show a 409 Conflict, e.g. a duplicate SKU under the SKU field. */
export interface ConflictTarget<T extends FieldValues> {
  field: Path<T>
  message: string
}

/**
 * Shows a failed save on the form: a 409 conflict under the given field, backend validation
 * errors under their fields, and anything else as a form-level error (root.server).
 */
export function showServerError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  conflict?: ConflictTarget<T>,
): void {
  if (error instanceof ApiError && error.status === 409 && conflict) {
    setError(conflict.field, { message: conflict.message })
    return
  }
  const fieldErrors = error instanceof ApiError ? Object.entries(error.fieldErrors) : []
  if (fieldErrors.length > 0) {
    fieldErrors.forEach(([field, message]) => setError(field as Path<T>, { message }))
    return
  }
  setError('root.server', { message: getErrorMessage(error) })
}
