import { describe, expect, it } from 'vitest'
import type { Category, Product } from '@/api/types'
import { buildCategoryRows } from './category-rows'

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

describe('buildCategoryRows', () => {
  it('orders categories as a tree and counts products assigned directly to each', () => {
    const categories = [
      category(4, 'Sztućce'),
      category(1, 'Garnki i patelnie'),
      category(2, 'Zestawy garnków', 1),
    ]
    const products = [productIn(1, [2]), productIn(2, [1, 2]), productIn(3, [])]

    const rows = buildCategoryRows(categories, products).map((row) => [
      row.category.name,
      row.depth,
      row.productCount,
    ])

    expect(rows).toEqual([
      ['Garnki i patelnie', 0, 1],
      ['Zestawy garnków', 1, 2],
      ['Sztućce', 0, 0],
    ])
  })
})
