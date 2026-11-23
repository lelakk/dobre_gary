import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/http'
import { getErrorMessage, SERVER_UNREACHABLE_MESSAGE, UNEXPECTED_ERROR_MESSAGE } from './errors'

describe('getErrorMessage', () => {
  it('shows the message sent by the backend', () => {
    const error = new ApiError(400, 'Błąd: Niewystarczająca ilość dostępnego produktu!')

    expect(getErrorMessage(error)).toBe('Błąd: Niewystarczająca ilość dostępnego produktu!')
  })

  it.each([502, 503, 504])(
    'treats a %i without a backend message as an unreachable backend',
    (status) => {
      expect(getErrorMessage(new ApiError(status, null))).toBe(SERVER_UNREACHABLE_MESSAGE)
    },
  )

  it('treats network failures as an unreachable backend', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(SERVER_UNREACHABLE_MESSAGE)
  })

  it('falls back to a generic message for other errors without a backend message', () => {
    expect(getErrorMessage(new ApiError(500, null))).toBe(UNEXPECTED_ERROR_MESSAGE)
  })
})
