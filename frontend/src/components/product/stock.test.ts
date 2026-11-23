import { describe, expect, it } from 'vitest'
import { getStockLevel, LOW_STOCK_THRESHOLD } from './stock'

describe('getStockLevel', () => {
  it('treats an empty inventory as out of stock', () => {
    expect(getStockLevel(0)).toBe('out-of-stock')
  })

  it('reports low stock up to and including the threshold', () => {
    expect(getStockLevel(1)).toBe('low-stock')
    expect(getStockLevel(LOW_STOCK_THRESHOLD)).toBe('low-stock')
  })

  it('reports in stock above the threshold', () => {
    expect(getStockLevel(LOW_STOCK_THRESHOLD + 1)).toBe('in-stock')
  })
})
