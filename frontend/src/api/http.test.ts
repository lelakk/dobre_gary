import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, get, patch, post, put, remove } from './http'

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

  it('sends PUT bodies as JSON', async () => {
    const fetchMock = mockFetch(jsonResponse({ productId: 3 }))

    const product = await put('/products/3', { name: 'Garnek' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/products/3')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ name: 'Garnek' })
    expect(product).toEqual({ productId: 3 })
  })

  it('sends PATCH bodies as JSON', async () => {
    const fetchMock = mockFetch(jsonResponse({ orderId: 12, orderStatus: 'shipped' }))

    const order = await patch('/orders/12/status', { orderStatus: 'shipped' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/orders/12/status')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ orderStatus: 'shipped' })
    expect(order).toEqual({ orderId: 12, orderStatus: 'shipped' })
  })

  it('resolves DELETE requests answered with 204 No Content', async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }))

    await expect(remove('/products/3')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products/3',
      expect.objectContaining({ method: 'DELETE' }),
    )
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
      serverMessage: 'Błąd: Niewystarczająca ilość dostępnego produktu!',
      fieldErrors: { quantity: 'Quantity must be at least 1' },
    })
  })

  it('has no server message when the error body is not from the backend', async () => {
    // What the Vite dev proxy returns when nothing listens on the backend port.
    mockFetch(new Response('', { status: 502, statusText: 'Bad Gateway' }))

    await expect(get('/products')).rejects.toMatchObject({
      status: 502,
      serverMessage: null,
      message: 'HTTP 502',
    })
  })
})
