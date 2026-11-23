import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, get, post } from './http'

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), init)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('http client', () => {
  it('prefixes paths with /api and parses JSON responses', async () => {
    const fetchMock = mockFetch(jsonResponse([{ productId: 1 }]))

    const products = await get<{ productId: number }[]>('/products')

    expect(products).toEqual([{ productId: 1 }])
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('sends POST bodies as JSON', async () => {
    const fetchMock = mockFetch(jsonResponse({ orderId: 12 }, { status: 201 }))

    await post('/orders/quick', { productId: 3, quantity: 2 })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual({ productId: 3, quantity: 2 })
  })

  it('throws ApiError with the backend message and field errors', async () => {
    mockFetch(
      jsonResponse(
        {
          status: 400,
          error: 'Bad Request',
          message: 'Błąd: Niewystarczająca ilość dostępnego produktu!',
          fieldErrors: { quantity: 'Quantity must be at least 1' },
        },
        { status: 400 },
      ),
    )

    const error = await post('/orders/quick', {}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Błąd: Niewystarczająca ilość dostępnego produktu!',
      fieldErrors: { quantity: 'Quantity must be at least 1' },
    })
  })

  it('falls back to the status text when the error body is not JSON', async () => {
    mockFetch(new Response('upstream down', { status: 502, statusText: 'Bad Gateway' }))

    await expect(get('/products')).rejects.toMatchObject({ status: 502, message: 'Bad Gateway' })
  })
})
