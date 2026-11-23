import { type ReactNode, useEffect, useReducer, useState } from 'react'
import { CartContext, type CartContextValue } from './cart-context'
import { cartReducer } from './cart-reducer'
import { loadCartLines, saveCartLines } from './cart-storage'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, () => loadCartLines())
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    saveCartLines(lines)
  }, [lines])

  const cart: CartContextValue = {
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
    isOpen,
    setOpen,
  }

  return <CartContext value={cart}>{children}</CartContext>
}
