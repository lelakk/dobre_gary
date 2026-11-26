import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import type { Product, ProductRequest } from '@/api/types'

/** Mirrors the constraints of ProductRequest on the backend, with messages in Polish. */
export const productFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, 'Podaj kod SKU.')
    .max(64, 'Kod SKU może mieć najwyżej 64 znaki.')
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
      'Kod SKU może zawierać tylko litery, cyfry, „-” i „_” i musi zaczynać się od litery lub cyfry.',
    ),
  name: z
    .string()
    .trim()
    .min(1, 'Podaj nazwę produktu.')
    .max(200, 'Nazwa może mieć najwyżej 200 znaków.'),
  brand: z.string().trim().min(1, 'Podaj markę.').max(100, 'Marka może mieć najwyżej 100 znaków.'),
  description: z.string().trim(),
  basePrice: z
    .number({ error: 'Podaj cenę.' })
    .min(0.01, 'Cena musi być większa od zera.')
    .max(99_999_999.99, 'Cena jest za wysoka.')
    .refine(hasAtMostTwoDecimals, 'Cena może mieć najwyżej dwa miejsca po przecinku.'),
  quantity: z
    .number({ error: 'Podaj stan magazynowy.' })
    .int('Stan magazynowy musi być liczbą całkowitą.')
    .min(0, 'Stan magazynowy nie może być ujemny.'),
  categoryIds: z.array(z.number()),
})

/** What the inputs hold (before trimming and validation). */
export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormOutput = z.output<typeof productFormSchema>

/** Price and stock start empty, so the user has to type them in. */
export const EMPTY_PRODUCT_FORM: DefaultValues<ProductFormInput> = {
  sku: '',
  name: '',
  brand: '',
  description: '',
  categoryIds: [],
}

export function toProductFormInput(product: Product): ProductFormInput {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    description: product.description ?? '',
    basePrice: product.basePrice,
    quantity: product.quantity,
    categoryIds: product.categoryIds,
  }
}

export function toProductRequest(values: ProductFormOutput): ProductRequest {
  return { ...values, description: values.description === '' ? null : values.description }
}

function hasAtMostTwoDecimals(value: number): boolean {
  const grosze = value * 100
  return Math.abs(grosze - Math.round(grosze)) < 1e-6
}
