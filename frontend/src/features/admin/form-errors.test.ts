import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import { SERVER_UNREACHABLE_MESSAGE } from '@/lib/errors'
import { showServerError } from './form-errors'

interface Form {
  sku: string
  name: string
}

describe('showServerError', () => {
  const conflict = { field: 'sku' as const, message: 'Produkt o tym kodzie SKU już istnieje.' }

  it('shows a conflict under the given field', () => {
    const setError = vi.fn()

    showServerError<Form>(setError, new ApiError(409, 'Product with SKU already exists'), conflict)

    expect(setError).toHaveBeenCalledExactlyOnceWith('sku', { message: conflict.message })
  })

  it('shows backend validation errors under their fields', () => {
    const setError = vi.fn()

    showServerError<Form>(
      setError,
      new ApiError(400, 'Validation failed', { name: 'Product name is required' }),
      conflict,
    )

    expect(setError).toHaveBeenCalledExactlyOnceWith('name', {
      message: 'Product name is required',
    })
  })

  it('shows any other failure as a form-level error', () => {
    const setError = vi.fn()

    showServerError<Form>(setError, new ApiError(502, null), conflict)

    expect(setError).toHaveBeenCalledExactlyOnceWith('root.server', {
      message: SERVER_UNREACHABLE_MESSAGE,
    })
  })
})
