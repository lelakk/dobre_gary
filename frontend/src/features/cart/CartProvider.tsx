import { type ReactNode, useEffect, useMemo, useReducer, useState } from 'react'
import {
  CartContext,
  type CartContextValue,
  CartDrawerContext,
  type CartDrawerContextValue,
} from './cart-context'
import { cartReducer } from './cart-reducer'
import { loadCartLines, saveCartLines } from './cart-storage'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, () => loadCartLines())
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    saveCartLines(lines)
  }, [lines])

  // dispatch and setOpen never change, so the value changes only when the lines do.
  const cart = useMemo<CartContextValue>(
    () => ({
      lines,
      totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
      addItem: (product, quantity) =>
        dispatch({
          type: 'add',
          productId: product.productId,
          quantity,
          maxQuantity: product.quantity,
        }),
      setItemQuantity: (product, quantity) =>
        dispatch({
          type: 'set-quantity',
          productId: product.productId,
          quantity,
          maxQuantity: product.quantity,
        }),
      removeItem: (productId) => dispatch({ type: 'remove', productId }),
      openCart: () => setOpen(true),
    }),
    [lines],
  )
  const drawer = useMemo<CartDrawerContextValue>(() => ({ isOpen, setOpen }), [isOpen])

  return (
    <CartContext value={cart}>
      <CartDrawerContext value={drawer}>{children}</CartDrawerContext>
    </CartContext>
  )
}
