import { describe, expect, it } from 'vitest'
import { multiplyPrice, sumPrices } from './money'

describe('money', () => {
  it('multiplies prices without floating-point drift', () => {
    expect(multiplyPrice(0.1, 3)).toBe(0.3)
    expect(multiplyPrice(89.5, 3)).toBe(268.5)
  })

  it('sums prices without floating-point drift', () => {
    expect(sumPrices([0.1, 0.2])).toBe(0.3)
    expect(sumPrices([399.99, 65, 19.99])).toBe(484.98)
    expect(sumPrices([])).toBe(0)
  })
})
