import { describe, expect, it } from 'vitest'
import type { Product } from '@/api/types'
import {
  type ProductFormInput,
  productFormSchema,
  toProductFormInput,
  toProductRequest,
} from './product-form'

const validInput: ProductFormInput = {
  sku: ' GAR-006 ',
  name: '  Garnek stalowy 3L ',
  brand: 'Gerlach',
  description: '',
  basePrice: 129.99,
  quantity: 12,
  categoryIds: [2],
}

function errorsOf(input: ProductFormInput) {
  const result = productFormSchema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]))
}

describe('productFormSchema', () => {
  it('accepts a valid product and trims text fields', () => {
    const result = productFormSchema.parse(validInput)

    expect(result).toMatchObject({ sku: 'GAR-006', name: 'Garnek stalowy 3L', basePrice: 129.99 })
  })

  it('rejects missing and malformed fields with Polish messages', () => {
    expect(
      errorsOf({
        ...validInput,
        sku: 'gar 006',
        name: '  ',
        brand: '',
        basePrice: 0,
        quantity: -1,
      }),
    ).toEqual({
      sku: 'Kod SKU może zawierać tylko litery, cyfry, „-” i „_” i musi zaczynać się od litery lub cyfry.',
      name: 'Podaj nazwę produktu.',
      brand: 'Podaj markę.',
      basePrice: 'Cena musi być większa od zera.',
      quantity: 'Stan magazynowy nie może być ujemny.',
    })
  })

  it('rejects empty number inputs (NaN) and fractional values', () => {
    expect(errorsOf({ ...validInput, basePrice: Number.NaN, quantity: Number.NaN })).toEqual({
      basePrice: 'Podaj cenę.',
      quantity: 'Podaj stan magazynowy.',
    })
    expect(errorsOf({ ...validInput, basePrice: 10.999, quantity: 1.5 })).toEqual({
      basePrice: 'Cena może mieć najwyżej dwa miejsca po przecinku.',
      quantity: 'Stan magazynowy musi być liczbą całkowitą.',
    })
  })
})

describe('form mapping', () => {
  const product: Product = {
    productId: 1,
    sku: 'GAR-001',
    name: 'Zestaw garnków',
    brand: 'Gerlach',
    description: null,
    basePrice: 399.99,
    quantity: 13,
    categoryIds: [2],
    createdAt: '2026-01-01T10:00:00',
  }

  it('turns a product into form values and back into a request', () => {
    const input = toProductFormInput(product)

    expect(input.description).toBe('')
    expect(toProductRequest(productFormSchema.parse(input))).toEqual({
      sku: 'GAR-001',
      name: 'Zestaw garnków',
      brand: 'Gerlach',
      description: null,
      basePrice: 399.99,
      quantity: 13,
      categoryIds: [2],
    })
  })
})
