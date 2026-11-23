import type { Money, Product } from '@/api/types'
import { multiplyPrice, sumPrices } from '@/lib/money'
import type { CartLine } from './cart-reducer'

/** A cart line joined with the current product data. */
export interface CartItem {
  product: Product
  quantity: number
}

/** Joins lines with products, skipping products that no longer exist. */
export function toCartItems(lines: CartLine[], products: Product[]): CartItem[] {
  const productsById = new Map(products.map((product) => [product.productId, product]))
  return lines.flatMap((line) => {
    const product = productsById.get(line.productId)
    return product ? [{ product, quantity: line.quantity }] : []
  })
}

export function getLineTotal(item: CartItem): Money {
  return multiplyPrice(item.product.basePrice, item.quantity)
}

export function getSubtotal(items: CartItem[]): Money {
  return sumPrices(items.map(getLineTotal))
}

/** True when the stock dropped below the quantity in the cart since the product was added. */
export function exceedsStock(item: CartItem): boolean {
  return item.quantity > item.product.quantity
}
