import { describe, expect, it } from 'vitest'
import type { Order, OrderItem } from '@/api/types'
import { filterOrders, parseStatusFilter, summarizeOrderItems } from './order-filters'

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    orderItemId: 1,
    productId: 10,
    productSku: 'GAR-001',
    productName: 'Garnek żeliwny 5L',
    quantity: 2,
    unitPrice: 199.99,
    ...overrides,
  }
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    orderId: 101,
    userId: 4,
    customerEmail: 'jan.kowalski@example.com',
    shippingAddressId: 10,
    billingAddressId: 10,
    orderStatus: 'pending',
    totalAmount: 399.98,
    createdAt: '2026-11-23T12:00:00',
    items: [makeItem()],
    ...overrides,
  }
}

describe('parseStatusFilter', () => {
  it('accepts "all" and valid order statuses', () => {
    expect(parseStatusFilter('all')).toBe('all')
    expect(parseStatusFilter('shipped')).toBe('shipped')
  })

  it('falls back to "all" for unknown values', () => {
    expect(parseStatusFilter('unknown')).toBe('all')
  })
})

describe('filterOrders', () => {
  const orders = [
    makeOrder({
      orderId: 101,
      customerEmail: 'anna.nowak@example.com',
      orderStatus: 'paid',
      items: [makeItem({ productSku: 'GAR-001', productName: 'Garnek żeliwny 5L' })],
    }),
    makeOrder({
      orderId: 102,
      customerEmail: 'piotr.zielinski@example.com',
      orderStatus: 'shipped',
      items: [makeItem({ productSku: 'PAT-007', productName: 'Patelnia ceramiczna' })],
    }),
  ]

  it('returns all orders when no filters are active', () => {
    expect(filterOrders(orders, '', 'all')).toHaveLength(2)
  })

  it('filters by order status', () => {
    expect(filterOrders(orders, '', 'shipped').map((order) => order.orderId)).toEqual([102])
  })

  it('matches order id with or without hash, customer e-mail, SKU and product name', () => {
    expect(filterOrders(orders, '#102', 'all').map((order) => order.orderId)).toEqual([102])
    expect(filterOrders(orders, '101', 'all').map((order) => order.orderId)).toEqual([101])
    expect(filterOrders(orders, 'nowak', 'all').map((order) => order.orderId)).toEqual([101])
    expect(filterOrders(orders, 'pat-007', 'all').map((order) => order.orderId)).toEqual([102])
    expect(filterOrders(orders, 'zeliwny', 'all').map((order) => order.orderId)).toEqual([101])
  })

  it('combines status and search filters', () => {
    expect(filterOrders(orders, 'nowak', 'shipped')).toEqual([])
    expect(filterOrders(orders, 'nowak', 'paid').map((order) => order.orderId)).toEqual([101])
  })
})

describe('summarizeOrderItems', () => {
  it('handles empty, single and multiple line items', () => {
    expect(summarizeOrderItems([])).toBe('—')
    expect(summarizeOrderItems([makeItem({ productName: 'Garnek 5L', quantity: 2 })])).toBe(
      'Garnek 5L × 2',
    )
    expect(
      summarizeOrderItems([
        makeItem({ orderItemId: 1, quantity: 2 }),
        makeItem({ orderItemId: 2, quantity: 3 }),
      ]),
    ).toBe('2 pozycje (5 szt.)')
    expect(
      summarizeOrderItems(
        Array.from({ length: 5 }, (_, index) => makeItem({ orderItemId: index + 1, quantity: 1 })),
      ),
    ).toBe('5 pozycji (5 szt.)')
  })
})
