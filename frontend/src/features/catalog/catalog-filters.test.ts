import { describe, expect, it } from 'vitest'
import type { Category, Product } from '@/api/types'
import {
  type CatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  filterProducts,
  getBrands,
  hasActiveFilters,
  parseCatalogFilters,
  toSearchParams,
} from './catalog-filters'

function product(overrides: Partial<Product> & Pick<Product, 'productId' | 'name'>): Product {
  return {
    sku: `SKU-${overrides.productId}`,
    brand: 'Tefal',
    description: null,
    basePrice: 100,
    quantity: 10,
    categoryIds: [],
    createdAt: '2026-01-01T10:00:00',
    ...overrides,
  }
}

const categories: Category[] = [
  { categoryId: 1, parentId: null, parentName: null, name: 'Garnki i patelnie' },
  { categoryId: 2, parentId: 1, parentName: 'Garnki i patelnie', name: 'Zestawy garnków' },
  { categoryId: 4, parentId: null, parentName: null, name: 'Sztućce' },
]

const products: Product[] = [
  product({
    productId: 1,
    name: 'Garnek żeliwny 4L',
    brand: 'Chasseur',
    basePrice: 450,
    categoryIds: [2],
  }),
  product({
    productId: 2,
    name: 'Patelnia teflonowa 24cm',
    basePrice: 120,
    categoryIds: [1],
    quantity: 0,
  }),
  product({
    productId: 3,
    name: 'Łyżka wazowa',
    brand: 'Gerlach',
    basePrice: 35,
    categoryIds: [4],
  }),
]

function filter(changes: Partial<CatalogFilters>) {
  return filterProducts(products, { ...DEFAULT_CATALOG_FILTERS, ...changes }, categories).map(
    (p) => p.productId,
  )
}

describe('filterProducts', () => {
  it('searches name, brand and SKU ignoring case and Polish diacritics', () => {
    expect(filter({ search: 'ZELIWNY' })).toEqual([1])
    expect(filter({ search: 'lyzka' })).toEqual([3])
    expect(filter({ search: 'chasseur' })).toEqual([1])
    expect(filter({ search: 'sku-2' })).toEqual([2])
  })

  it('includes products from subcategories when filtering by a parent category', () => {
    expect(filter({ categoryId: 1, sort: 'name-asc' })).toEqual([1, 2])
    expect(filter({ categoryId: 2 })).toEqual([1])
  })

  it('filters by brand and availability', () => {
    expect(filter({ brand: 'Tefal' })).toEqual([2])
    expect(filter({ inStockOnly: true, sort: 'name-asc' })).toEqual([1, 3])
  })

  it('sorts by price and by name', () => {
    expect(filter({ sort: 'price-asc' })).toEqual([3, 2, 1])
    expect(filter({ sort: 'price-desc' })).toEqual([1, 2, 3])
    expect(filter({ sort: 'name-asc' })).toEqual([1, 3, 2])
  })

  it('sorts newest first, falling back to the highest id for equal dates', () => {
    expect(filter({ sort: 'newest' })).toEqual([3, 2, 1])
  })
})

describe('URL search params', () => {
  it('round-trips filters through the query string', () => {
    const filters: CatalogFilters = {
      search: 'garnek',
      categoryId: 2,
      brand: 'Tefal',
      inStockOnly: true,
      sort: 'price-asc',
    }

    const params = toSearchParams(filters)

    expect(params.toString()).toBe('q=garnek&category=2&brand=Tefal&available=1&sort=price-asc')
    expect(parseCatalogFilters(params)).toEqual(filters)
  })

  it('omits defaults and ignores invalid values', () => {
    expect(toSearchParams(DEFAULT_CATALOG_FILTERS).toString()).toBe('')
    expect(parseCatalogFilters(new URLSearchParams('category=abc&sort=cheapest'))).toEqual(
      DEFAULT_CATALOG_FILTERS,
    )
  })
})

describe('hasActiveFilters', () => {
  it('ignores sorting and whitespace-only searches', () => {
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_FILTERS, sort: 'price-desc' })).toBe(false)
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_FILTERS, search: '   ' })).toBe(false)
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_FILTERS, brand: 'Tefal' })).toBe(true)
  })
})

describe('getBrands', () => {
  it('returns distinct brands in alphabetical order', () => {
    expect(getBrands(products)).toEqual(['Chasseur', 'Gerlach', 'Tefal'])
  })
})
