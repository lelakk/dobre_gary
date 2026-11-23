import type { CartLine } from './cart-reducer'

const STORAGE_KEY = 'dobre-gary.cart'

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Restores the cart saved in localStorage, dropping anything malformed. */
export function loadCartLines(storage?: CartStorage): CartLine[] {
  try {
    const saved: unknown = JSON.parse((storage ?? localStorage).getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isCartLine) : []
  } catch {
    return []
  }
}

export function saveCartLines(lines: CartLine[], storage?: CartStorage): void {
  try {
    ;(storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Storage is full or blocked (e.g. private mode): the cart simply is not persisted.
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { productId, quantity } = value as Record<string, unknown>
  return isPositiveInteger(productId) && isPositiveInteger(quantity)
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0
}
