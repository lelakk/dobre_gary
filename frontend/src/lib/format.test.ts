import { describe, expect, it } from 'vitest'
import type { Address } from '@/api/types'
import {
  formatAddress,
  formatCount,
  formatDate,
  formatDateTime,
  formatInteger,
  formatPercent,
  formatPrice,
  ORDER_FORMS,
  PRODUCT_FORMS,
  RESULT_FORMS,
} from './format'

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

describe('formatInteger', () => {
  it('formats whole numbers with Polish grouping', () => {
    expect(normalizeSpaces(formatInteger(0))).toBe('0')
    expect(normalizeSpaces(formatInteger(12500))).toBe('12 500')
  })
})

describe('formatPercent', () => {
  it('formats percentages on a 0-100 scale with up to one decimal place', () => {
    expect(formatPercent(100)).toBe('100%')
    expect(formatPercent(85.7)).toBe('85,7%')
    expect(formatPercent(0)).toBe('0%')
  })
})

describe('formatDateTime', () => {
  it('formats the stored date and time in Polish', () => {
    expect(normalizeSpaces(formatDateTime('2026-11-23T22:06:49'))).toBe('23 listopada 2026 22:06')
  })
})

describe('formatDate', () => {
  it('formats the stored date without the time', () => {
    expect(normalizeSpaces(formatDate('2026-11-23T22:06:49'))).toBe('23 lis 2026')
  })
})

describe('formatAddress', () => {
  const address: Address = {
    addressId: 1,
    userId: 1,
    recipientName: 'Jan Kowalski',
    streetLine1: 'ul. Kwiatowa 15',
    streetLine2: null,
    city: 'Warszawa',
    stateProvince: 'Mazowieckie',
    postalCode: '00-001',
    createdAt: '2026-01-01T10:00:00',
  }

  it('joins the address into one line', () => {
    expect(formatAddress(address)).toBe('Jan Kowalski, ul. Kwiatowa 15, 00-001 Warszawa')
  })

  it('includes the second street line when present', () => {
    expect(formatAddress({ ...address, streetLine2: 'm. 4' })).toBe(
      'Jan Kowalski, ul. Kwiatowa 15 m. 4, 00-001 Warszawa',
    )
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

  it('works for other nouns', () => {
    expect(formatCount(3, ORDER_FORMS)).toBe('3 zamówienia')
    expect(formatCount(1, RESULT_FORMS)).toBe('1 wynik')
    expect(formatCount(5, RESULT_FORMS)).toBe('5 wyników')
  })
})
