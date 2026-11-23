import type { Money } from '@/api/types'

const GROSZE_PER_ZLOTY = 100

/** Arithmetic is done in whole grosze, so e.g. 0.1 + 0.2 gives exactly 0.3 (not 0.30000000000000004). */
function toGrosze(amount: Money): number {
  return Math.round(amount * GROSZE_PER_ZLOTY)
}

export function multiplyPrice(unitPrice: Money, quantity: number): Money {
  return (toGrosze(unitPrice) * quantity) / GROSZE_PER_ZLOTY
}

export function sumPrices(amounts: Money[]): Money {
  return amounts.reduce((total, amount) => total + toGrosze(amount), 0) / GROSZE_PER_ZLOTY
}
