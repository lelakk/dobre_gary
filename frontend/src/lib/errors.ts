import { ApiError } from '@/api/http'

const CONNECTION_ERROR_MESSAGE = 'Nie udało się połączyć z serwerem. Spróbuj ponownie za chwilę.'

/** Message to show the user: the backend's own message when available, a generic one otherwise. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : CONNECTION_ERROR_MESSAGE
}
