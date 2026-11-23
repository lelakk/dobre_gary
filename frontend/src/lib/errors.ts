import { ApiError } from '@/api/http'

/** Statuses returned by the proxy in front of the backend when the backend cannot be reached. */
const GATEWAY_ERROR_STATUSES = new Set([502, 503, 504])

export const SERVER_UNREACHABLE_MESSAGE = import.meta.env.DEV
  ? 'Brak połączenia z backendem. Uruchom aplikację Spring Boot i spróbuj ponownie.'
  : 'Nie udało się połączyć z serwerem. Spróbuj ponownie za chwilę.'

export const UNEXPECTED_ERROR_MESSAGE = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę.'

/** Message to show the user: the backend's own message when it sent one, a generic one otherwise. */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    // fetch() rejects without an HTTP response only when the network request itself failed.
    return SERVER_UNREACHABLE_MESSAGE
  }
  if (error.serverMessage) {
    return error.serverMessage
  }
  return GATEWAY_ERROR_STATUSES.has(error.status)
    ? SERVER_UNREACHABLE_MESSAGE
    : UNEXPECTED_ERROR_MESSAGE
}
