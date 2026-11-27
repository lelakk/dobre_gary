import { isOrderStatus, type Order, type OrderItem, type OrderStatus } from '@/api/types'
import { formatCount, type PluralForms } from '@/lib/format'
import { matchesSearchTerm } from '@/lib/search'

export type OrderStatusFilter = OrderStatus | 'all'

const ITEM_LINE_FORMS: PluralForms = { one: 'pozycja', few: 'pozycje', many: 'pozycji' }

export function parseStatusFilter(value: string): OrderStatusFilter {
  return value === 'all' || isOrderStatus(value) ? value : 'all'
}

/** Filters orders by status and a search term matching order id, e-mail, SKU or product name. */
export function filterOrders(
  orders: readonly Order[],
  search: string,
  status: OrderStatusFilter,
): Order[] {
  return orders.filter((order) => {
    if (status !== 'all' && order.orderStatus !== status) {
      return false
    }
    const searchableFields = [
      String(order.orderId),
      `#${order.orderId}`,
      order.customerEmail,
      ...order.items.flatMap((item) => [item.productName, item.productSku]),
    ]
    return matchesSearchTerm(searchableFields, search)
  })
}

/** One-line summary of an order's line items for the admin table. */
export function summarizeOrderItems(items: readonly OrderItem[]): string {
  if (items.length === 0) {
    return '—'
  }
  if (items.length === 1) {
    const [only] = items
    return `${only.productName} × ${only.quantity}`
  }
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  return `${formatCount(items.length, ITEM_LINE_FORMS)} (${totalQuantity} szt.)`
}
