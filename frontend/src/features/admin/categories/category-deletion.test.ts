import { describe, expect, it } from 'vitest'
import type { Category, Product } from '@/api/types'
import { describeCategoryDeletion } from './category-deletion'

function category(categoryId: number, name: string, parentId: number | null = null): Category {
  return { categoryId, name, parentId, parentName: null }
}

function productIn(productId: number, categoryIds: number[]): Product {
  return {
    productId,
    sku: `SKU-${productId}`,
    name: `Produkt ${productId}`,
    brand: 'Tefal',
    description: null,
    basePrice: 10,
    quantity: 1,
    categoryIds,
    createdAt: '2026-01-01T10:00:00',
  }
}

const categories = [
  category(1, 'Garnki i patelnie'),
  category(2, 'Zestawy garnków', 1),
  category(3, 'Patelnie', 1),
  category(4, 'Sztućce'),
]

describe('describeCategoryDeletion', () => {
  it('mentions subcategories and products that are affected', () => {
    const products = [productIn(1, [1]), productIn(2, [1, 4]), productIn(3, [2])]

    expect(describeCategoryDeletion(categories[0], categories, products)).toBe(
      'Kategoria „Garnki i patelnie” zostanie usunięta. ' +
        'Podkategorie (2) staną się kategoriami głównymi. ' +
        'Przypisane do niej produkty (2) zostaną w sklepie, tylko bez tej kategorii. ' +
        'Tej operacji nie można cofnąć.',
    )
  })

  it('keeps it short for an unused leaf category', () => {
    expect(describeCategoryDeletion(categories[3], categories, [])).toBe(
      'Kategoria „Sztućce” zostanie usunięta. Tej operacji nie można cofnąć.',
    )
  })
})
