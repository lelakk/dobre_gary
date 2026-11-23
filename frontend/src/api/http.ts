import type { ApiErrorResponse } from './types'

const API_BASE_PATH = '/api'

/** A non-2xx response from the backend, carrying the message produced by GlobalExceptionHandler. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Readonly<Record<string, string>>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    throw await toApiError(response)
  }
  return (await response.json()) as T
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response)
  const message = body?.message || body?.error || response.statusText || `HTTP ${response.status}`
  return new ApiError(response.status, message, body?.fieldErrors ?? {})
}

async function readErrorBody(response: Response): Promise<Partial<ApiErrorResponse> | null> {
  try {
    return (await response.json()) as Partial<ApiErrorResponse>
  } catch {
    return null
  }
}
