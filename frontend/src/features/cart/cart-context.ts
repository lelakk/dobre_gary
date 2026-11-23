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
  /** Whether the cart drawer is open. */
  isOpen: boolean
  setOpen: (open: boolean) => void
}

export const CartContext = createContext<CartContextValue | null>(null)
