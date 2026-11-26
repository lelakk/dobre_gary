import { createContext } from 'react'
import type { Product } from '@/api/types'
import type { CartLine } from './cart-reducer'

export interface CartContextValue {
  lines: CartLine[]
  /** Number of units across all lines. */
  totalQuantity: number
  addItem: (product: Product, quantity: number) => void
  setItemQuantity: (product: Product, quantity: number) => void
  removeItem: (productId: number) => void
  /** Opens the cart drawer; stable, so calling it does not re-render the components using it. */
  openCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

/**
 * Whether the cart drawer is open. Kept apart from CartContext, so opening the drawer re-renders
 * only the drawer and not every product card that reads the cart.
 */
export interface CartDrawerContextValue {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

export const CartDrawerContext = createContext<CartDrawerContextValue | null>(null)
