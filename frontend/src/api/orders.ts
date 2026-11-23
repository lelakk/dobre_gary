import { queryOptions } from '@tanstack/react-query'
import { get, post } from './http'
import type { Order, QuickOrderRequest } from './types'

export const orderQueries = {
  detail: (orderId: number) =>
    queryOptions({
      queryKey: ['orders', orderId],
      queryFn: () => get<Order>(`/orders/${orderId}`),
    }),
}

/**
 * Places a single-product order through the sp_place_single_product_order stored procedure.
 * The database checks and decrements stock, computes the total and creates the payment record.
 */
export function placeQuickOrder(request: QuickOrderRequest): Promise<Order> {
  return post<Order>('/orders/quick', request)
}
