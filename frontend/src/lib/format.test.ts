import { describe, expect, it } from 'vitest'
import { formatCount, formatPrice, PRODUCT_FORMS } from './format'

/** Intl uses (narrow) non-breaking spaces; normalize them so expectations stay readable. */
function normalizeSpaces(text: string) {
  return text.replace(/\s/g, ' ')
}

describe('formatPrice', () => {
  it('formats amounts in PLN using Polish conventions', () => {
    expect(normalizeSpaces(formatPrice(399.99))).toBe('399,99 zł')
    expect(normalizeSpaces(formatPrice(89.5))).toBe('89,50 zł')
    expect(normalizeSpaces(formatPrice(12345))).toBe('12 345,00 zł')
  })
})

describe('formatCount', () => {
  it.each([
    [0, '0 produktów'],
    [1, '1 produkt'],
    [2, '2 produkty'],
    [4, '4 produkty'],
    [5, '5 produktów'],
    [12, '12 produktów'],
    [22, '22 produkty'],
    [25, '25 produktów'],
  ])('formats %i as "%s"', (count, expected) => {
    expect(formatCount(count, PRODUCT_FORMS)).toBe(expected)
  })
})
