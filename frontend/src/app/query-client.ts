import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/http'

const STALE_TIME_MS = 30_000
const MAX_RETRIES = 2

/** Retries network and server failures, but not client errors (e.g. 404) that a retry cannot fix. */
function shouldRetry(failureCount: number, error: Error): boolean {
  const isClientError = error instanceof ApiError && error.status < 500
  return !isClientError && failureCount < MAX_RETRIES
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: shouldRetry,
    },
  },
})
