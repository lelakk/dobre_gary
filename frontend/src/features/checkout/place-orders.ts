import type { Order, Product, QuickOrderRequest } from '@/api/types'
import { getErrorMessage } from '@/lib/errors'
import type { CheckoutDetails } from './checkout-form'

export interface OrderLine {
  product: Product
  quantity: number
}

export type OrderPlacementResult =
  | { status: 'placed'; product: Product; order: Order }
  | { status: 'failed'; product: Product; message: string }

/**
 * Places one order per cart line, one after another.
 *
 * TODO: Submit the whole cart as a single order once the backend has a multi-item order endpoint.
 *  Today the API only exposes POST /api/orders/quick (sp_place_single_product_order), which orders
 *  exactly one product, so a cart with N products becomes N separate orders.
 *
 * A failing line (e.g. rejected by the stock trigger) does not stop the remaining ones; every
 * line gets its own result so the UI can tell what was ordered and what was not.
 */
export async function placeOrders(
  lines: OrderLine[],
  details: CheckoutDetails,
  placeOrder: (request: QuickOrderRequest) => Promise<Order>,
): Promise<OrderPlacementResult[]> {
  const results: OrderPlacementResult[] = []
  for (const { product, quantity } of lines) {
    try {
      const order = await placeOrder({ ...details, productId: product.productId, quantity })
      results.push({ status: 'placed', product, order })
    } catch (error) {
      results.push({ status: 'failed', product, message: getErrorMessage(error) })
    }
  }
  return results
}
