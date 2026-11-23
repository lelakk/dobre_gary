import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import type { Order, Product, QuickOrderRequest } from '@/api/types'
import type { CheckoutDetails } from './checkout-form'
import { placeOrders } from './place-orders'

function product(productId: number): Product {
  return {
    productId,
    sku: `SKU-${productId}`,
    name: `Produkt ${productId}`,
    brand: 'Tefal',
    description: null,
    basePrice: 100,
    quantity: 10,
    categoryIds: [],
    createdAt: '2026-01-01T10:00:00',
  }
}

function orderFor(request: QuickOrderRequest, orderId: number): Order {
  return {
    orderId,
    userId: request.userId,
    customerEmail: 'jan.kowalski@example.com',
    shippingAddressId: request.shippingAddressId,
    billingAddressId: request.billingAddressId,
    orderStatus: 'pending',
    totalAmount: 100 * request.quantity,
    createdAt: '2026-01-01T10:00:00',
    items: [],
  }
}

const details: CheckoutDetails = {
  userId: 1,
  shippingAddressId: 10,
  billingAddressId: 10,
  paymentMethod: 'blik',
}

describe('placeOrders', () => {
  it('places one order per line with the checkout details', async () => {
    const placeOrder = vi.fn(async (request: QuickOrderRequest) =>
      orderFor(request, 100 + request.productId),
    )

    const results = await placeOrders(
      [
        { product: product(1), quantity: 2 },
        { product: product(2), quantity: 1 },
      ],
      details,
      placeOrder,
    )

    expect(placeOrder.mock.calls.map(([request]) => request)).toEqual([
      { ...details, productId: 1, quantity: 2 },
      { ...details, productId: 2, quantity: 1 },
    ])
    expect(results.map((result) => result.status)).toEqual(['placed', 'placed'])
  })

  it('keeps going after a failed line and reports its error message', async () => {
    const placeOrder = vi.fn(async (request: QuickOrderRequest) => {
      if (request.productId === 1) {
        throw new ApiError(400, 'Błąd: Niewystarczająca ilość dostępnego produktu!')
      }
      return orderFor(request, 200)
    })

    const results = await placeOrders(
      [
        { product: product(1), quantity: 999 },
        { product: product(2), quantity: 1 },
      ],
      details,
      placeOrder,
    )

    expect(results).toEqual([
      {
        status: 'failed',
        product: product(1),
        message: 'Błąd: Niewystarczająca ilość dostępnego produktu!',
      },
      { status: 'placed', product: product(2), order: expect.objectContaining({ orderId: 200 }) },
    ])
  })
})
