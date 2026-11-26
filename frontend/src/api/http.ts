import type { ApiErrorResponse } from './types'

const API_BASE_PATH = '/api'

/** A non-2xx response from the backend (or from the dev proxy in front of it). */
export class ApiError extends Error {
  readonly status: number
  /**
   * Message produced by GlobalExceptionHandler, meant for the user. Null when the response had no
   * such body, e.g. the 502 the Vite proxy returns when the backend is not running.
   */
  readonly serverMessage: string | null
  readonly fieldErrors: Readonly<Record<string, string>>

  constructor(
    status: number,
    serverMessage: string | null,
    fieldErrors: Record<string, string> = {},
  ) {
    super(serverMessage ?? `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.serverMessage = serverMessage
    this.fieldErrors = fieldErrors
  }
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

/** DELETE request; the backend answers 204 No Content. */
export function remove(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' })
}

const NO_CONTENT = 204

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    throw await toApiError(response)
  }
  return response.status === NO_CONTENT ? (undefined as T) : ((await response.json()) as T)
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response)
  return new ApiError(response.status, body?.message || null, body?.fieldErrors ?? {})
}

async function readErrorBody(response: Response): Promise<Partial<ApiErrorResponse> | null> {
  try {
    return (await response.json()) as Partial<ApiErrorResponse>
  } catch {
    return null
  }
}
