import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { productQueries } from '@/api/products'
import type { Product } from '@/api/types'
import { CartContext, type CartContextValue } from './cart-context'
import { getSubtotal, toCartItems } from './cart-items'
import { findQuantity } from './cart-reducer'

export function useCart(): CartContextValue {
  const cart = use(CartContext)
  if (!cart) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return cart
}

/** Cart lines joined with the current product data (prices, stock) from the API. */
export function useCartItems() {
  const { lines } = useCart()
  const productsQuery = useQuery(productQueries.all())
  const items = toCartItems(lines, productsQuery.data ?? [])
  return { lines, items, subtotal: getSubtotal(items), productsQuery }
}

/** How many more units of a product fit in the cart, and an action that adds them. */
export function useAddToCart(product: Product) {
  const { lines, addItem, setOpen } = useCart()
  const quantityInCart = findQuantity(lines, product.productId)

  return {
    quantityInCart,
    remainingStock: Math.max(product.quantity - quantityInCart, 0),
    /** Adds the product and opens the cart drawer, so the shopper sees what happened. */
    addToCart: (quantity = 1) => {
      addItem(product, quantity)
      setOpen(true)
    },
  }
}
