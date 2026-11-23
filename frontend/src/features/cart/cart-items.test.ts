import { describe, expect, it } from 'vitest'
import type { Product } from '@/api/types'
import { exceedsStock, getLineTotal, getSubtotal, toCartItems } from './cart-items'

function product(productId: number, basePrice: number, quantity = 10): Product {
  return {
    productId,
    sku: `SKU-${productId}`,
    name: `Produkt ${productId}`,
    brand: 'Tefal',
    description: null,
    basePrice,
    quantity,
    categoryIds: [],
    createdAt: '2026-01-01T10:00:00',
  }
}

describe('cart items', () => {
  const products = [product(1, 89.5), product(2, 0.1, 1)]

  it('joins lines with product data and skips products that no longer exist', () => {
    const items = toCartItems(
      [
        { productId: 2, quantity: 1 },
        { productId: 99, quantity: 1 },
        { productId: 1, quantity: 3 },
      ],
      products,
    )

    expect(items.map((item) => [item.product.productId, item.quantity])).toEqual([
      [2, 1],
      [1, 3],
    ])
  })

  it('calculates line totals and the subtotal', () => {
    const items = toCartItems(
      [
        { productId: 1, quantity: 3 },
        { productId: 2, quantity: 3 },
      ],
      products,
    )

    expect(items.map(getLineTotal)).toEqual([268.5, 0.3])
    expect(getSubtotal(items)).toBe(268.8)
  })

  it('flags lines that exceed the current stock', () => {
    const [ok, tooMany] = toCartItems(
      [
        { productId: 1, quantity: 10 },
        { productId: 2, quantity: 2 },
      ],
      products,
    )

    expect(exceedsStock(ok)).toBe(false)
    expect(exceedsStock(tooMany)).toBe(true)
  })
})
