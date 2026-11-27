import { queryOptions } from '@tanstack/react-query'
import { get, patch, post } from './http'
import type { Order, QuickOrderRequest, UpdateOrderStatusRequest } from './types'

export const orderQueries = {
  all: () =>
    queryOptions({
      queryKey: ['orders'],
      queryFn: () => get<Order[]>('/orders'),
    }),
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

export function updateOrderStatus(
  orderId: number,
  request: UpdateOrderStatusRequest,
): Promise<Order> {
  return patch<Order>(`/orders/${orderId}/status`, request)
}
