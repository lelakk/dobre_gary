import type { Category, Product } from '@/api/types'
import { buildCategoryOptions } from '@/lib/category-tree'

export interface CategoryRow {
  category: Category
  /** 0 for top-level categories, 1 for their subcategories, and so on. */
  depth: number
  /** Products assigned directly to this category (not via subcategories). */
  productCount: number
}

/** Categories in tree order (each subcategory under its parent), with their product counts. */
export function buildCategoryRows(categories: Category[], products: Product[]): CategoryRow[] {
  const categoriesById = new Map(categories.map((category) => [category.categoryId, category]))
  const productCounts = countProductsPerCategory(products)

  return buildCategoryOptions(categories).map(({ categoryId, depth }) => ({
    category: categoriesById.get(categoryId)!,
    depth,
    productCount: productCounts.get(categoryId) ?? 0,
  }))
}

function countProductsPerCategory(products: Product[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const categoryId of products.flatMap((product) => product.categoryIds)) {
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)
  }
  return counts
}
