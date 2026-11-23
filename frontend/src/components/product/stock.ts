/** At or below this many units the storefront shows the exact remaining stock. */
export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock'

export function getStockLevel(quantity: number): StockLevel {
  if (quantity <= 0) {
    return 'out-of-stock'
  }
  return quantity <= LOW_STOCK_THRESHOLD ? 'low-stock' : 'in-stock'
}
