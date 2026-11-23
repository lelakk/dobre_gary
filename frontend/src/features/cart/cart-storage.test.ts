import { describe, expect, it } from 'vitest'
import { loadCartLines, saveCartLines } from './cart-storage'

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  }
}

describe('cart storage', () => {
  it('round-trips cart lines', () => {
    const storage = memoryStorage()

    saveCartLines([{ productId: 3, quantity: 2 }], storage)

    expect(loadCartLines(storage)).toEqual([{ productId: 3, quantity: 2 }])
  })

  it('starts empty when nothing is saved or the data is corrupted', () => {
    expect(loadCartLines(memoryStorage())).toEqual([])
    expect(loadCartLines(memoryStorage({ 'dobre-gary.cart': '{not json' }))).toEqual([])
    expect(loadCartLines(memoryStorage({ 'dobre-gary.cart': '{"productId":1}' }))).toEqual([])
  })

  it('drops malformed lines', () => {
    const saved = JSON.stringify([
      { productId: 1, quantity: 2 },
      { productId: '2', quantity: 1 },
      { productId: 3, quantity: 0 },
      { productId: 4, quantity: 1.5 },
      null,
    ])

    expect(loadCartLines(memoryStorage({ 'dobre-gary.cart': saved }))).toEqual([
      { productId: 1, quantity: 2 },
    ])
  })

  it('does not throw when storage is unavailable', () => {
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }

    expect(loadCartLines(blocked)).toEqual([])
    expect(() => saveCartLines([{ productId: 1, quantity: 1 }], blocked)).not.toThrow()
  })
})
