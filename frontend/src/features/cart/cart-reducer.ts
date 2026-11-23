/** What the cart stores: product ids and quantities. Product data always comes fresh from the API. */
export interface CartLine {
  productId: number
  quantity: number
}

/**
 * maxQuantity is the product's current stock: the cart never holds more units than the inventory
 * has (the database trigger would reject such an order anyway).
 */
export type CartAction =
  | { type: 'add'; productId: number; quantity: number; maxQuantity: number }
  | { type: 'set-quantity'; productId: number; quantity: number; maxQuantity: number }
  | { type: 'remove'; productId: number }

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const currentQuantity = findQuantity(lines, action.productId)
      const quantity = Math.min(currentQuantity + action.quantity, action.maxQuantity)
      if (quantity <= currentQuantity) {
        return lines
      }
      return currentQuantity === 0
        ? [...lines, { productId: action.productId, quantity }]
        : replaceQuantity(lines, action.productId, quantity)
    }
    case 'set-quantity': {
      const quantity = Math.min(Math.max(action.quantity, 1), action.maxQuantity)
      if (quantity < 1 || findQuantity(lines, action.productId) === 0) {
        return lines
      }
      return replaceQuantity(lines, action.productId, quantity)
    }
    case 'remove':
      return lines.filter((line) => line.productId !== action.productId)
  }
}

export function findQuantity(lines: CartLine[], productId: number): number {
  return lines.find((line) => line.productId === productId)?.quantity ?? 0
}

function replaceQuantity(lines: CartLine[], productId: number, quantity: number): CartLine[] {
  return lines.map((line) => (line.productId === productId ? { ...line, quantity } : line))
}
