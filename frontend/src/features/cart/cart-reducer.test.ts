import { describe, expect, it } from 'vitest'
import { type CartLine, cartReducer } from './cart-reducer'

const garnek: CartLine = { productId: 1, quantity: 2 }

describe('cartReducer', () => {
  describe('add', () => {
    it('adds a new line', () => {
      const lines = cartReducer([], { type: 'add', productId: 1, quantity: 2, maxQuantity: 10 })

      expect(lines).toEqual([{ productId: 1, quantity: 2 }])
    })

    it('increases the quantity of an existing line', () => {
      const lines = cartReducer([garnek], {
        type: 'add',
        productId: 1,
        quantity: 3,
        maxQuantity: 10,
      })

      expect(lines).toEqual([{ productId: 1, quantity: 5 }])
    })

    it('never exceeds the available stock', () => {
      const lines = cartReducer([garnek], {
        type: 'add',
        productId: 1,
        quantity: 5,
        maxQuantity: 4,
      })

      expect(lines).toEqual([{ productId: 1, quantity: 4 }])
    })

    it('ignores products that are out of stock or already maxed out', () => {
      const initial = [garnek]

      expect(cartReducer(initial, { type: 'add', productId: 1, quantity: 1, maxQuantity: 2 })).toBe(
        initial,
      )
      expect(cartReducer([], { type: 'add', productId: 7, quantity: 1, maxQuantity: 0 })).toEqual(
        [],
      )
    })
  })

  describe('set-quantity', () => {
    it('clamps the quantity between 1 and the available stock', () => {
      const action = { type: 'set-quantity', productId: 1, maxQuantity: 5 } as const

      expect(cartReducer([garnek], { ...action, quantity: 3 })).toEqual([
        { productId: 1, quantity: 3 },
      ])
      expect(cartReducer([garnek], { ...action, quantity: 0 })).toEqual([
        { productId: 1, quantity: 1 },
      ])
      expect(cartReducer([garnek], { ...action, quantity: 99 })).toEqual([
        { productId: 1, quantity: 5 },
      ])
    })

    it('does not add products that are not in the cart', () => {
      const lines = cartReducer([], {
        type: 'set-quantity',
        productId: 1,
        quantity: 2,
        maxQuantity: 5,
      })

      expect(lines).toEqual([])
    })
  })

  it('removes a line', () => {
    const other: CartLine = { productId: 2, quantity: 1 }

    expect(cartReducer([garnek, other], { type: 'remove', productId: 1 })).toEqual([other])
  })
})
