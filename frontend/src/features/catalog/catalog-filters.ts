import type { Category, Product } from '@/api/types'
import { parseId } from '@/lib/parse'
import { collectCategoryTreeIds } from './category-tree'

export const SORT_OPTIONS = ['newest', 'price-asc', 'price-desc', 'name-asc'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export interface CatalogFilters {
  search: string
  categoryId: number | null
  brand: string | null
  inStockOnly: boolean
  sort: SortOption
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  search: '',
  categoryId: null,
  brand: null,
  inStockOnly: false,
  sort: 'newest',
}

/** Names of the URL search params, e.g. /?q=garnek&category=1&brand=Tefal&available=1&sort=price-asc */
const PARAM = {
  search: 'q',
  categoryId: 'category',
  brand: 'brand',
  inStockOnly: 'available',
  sort: 'sort',
} as const

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const sort = params.get(PARAM.sort)
  return {
    search: params.get(PARAM.search) ?? DEFAULT_CATALOG_FILTERS.search,
    categoryId: parseId(params.get(PARAM.categoryId)),
    brand: params.get(PARAM.brand) || null,
    inStockOnly: params.get(PARAM.inStockOnly) === '1',
    sort: isSortOption(sort) ? sort : DEFAULT_CATALOG_FILTERS.sort,
  }
}

/** Serializes only the non-default values, keeping URLs short and shareable. */
export function toSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set(PARAM.search, filters.search)
  if (filters.categoryId !== null) params.set(PARAM.categoryId, String(filters.categoryId))
  if (filters.brand) params.set(PARAM.brand, filters.brand)
  if (filters.inStockOnly) params.set(PARAM.inStockOnly, '1')
  if (filters.sort !== DEFAULT_CATALOG_FILTERS.sort) params.set(PARAM.sort, filters.sort)
  return params
}

/** True when any filter narrows the results (sorting alone does not count). */
export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.categoryId !== null ||
    filters.brand !== null ||
    filters.inStockOnly
  )
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
  categories: Category[],
): Product[] {
  const searchTerm = normalizeForSearch(filters.search.trim())
  const categoryIds =
    filters.categoryId === null ? null : collectCategoryTreeIds(categories, filters.categoryId)

  return products
    .filter(
      (product) =>
        matchesSearch(product, searchTerm) &&
        (categoryIds === null || product.categoryIds.some((id) => categoryIds.has(id))) &&
        (filters.brand === null || product.brand === filters.brand) &&
        (!filters.inStockOnly || product.quantity > 0),
    )
    .toSorted(PRODUCT_COMPARATORS[filters.sort])
}

/** Distinct brands, alphabetically, for the brand filter. */
export function getBrands(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.brand))].toSorted(collator.compare)
}

const collator = new Intl.Collator('pl')
const byName = (a: Product, b: Product) => collator.compare(a.name, b.name)

const PRODUCT_COMPARATORS: Record<SortOption, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.productId - a.productId,
  'price-asc': (a, b) => a.basePrice - b.basePrice || byName(a, b),
  'price-desc': (a, b) => b.basePrice - a.basePrice || byName(a, b),
  'name-asc': byName,
}

export function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
}

function matchesSearch(product: Product, normalizedTerm: string): boolean {
  return [product.name, product.brand, product.sku].some((field) =>
    normalizeForSearch(field).includes(normalizedTerm),
  )
}

/** Case- and diacritic-insensitive form, so "zelivny" finds "Żeliwny" and "lyzka" finds "Łyżka". */
function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .replaceAll('ł', 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
