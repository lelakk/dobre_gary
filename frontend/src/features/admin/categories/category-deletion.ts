import type { Category, Product } from '@/api/types'

/**
 * What deleting a category does, following the foreign keys in schema.sql:
 * categories.parent_id is ON DELETE SET NULL (subcategories become top-level) and
 * product_categories.category_id is ON DELETE CASCADE (products only lose the assignment).
 */
export function describeCategoryDeletion(
  category: Category,
  categories: Category[],
  products: Product[],
): string {
  const subcategoryCount = categories.filter((c) => c.parentId === category.categoryId).length
  const productCount = products.filter((p) => p.categoryIds.includes(category.categoryId)).length

  return [
    `Kategoria „${category.name}” zostanie usunięta.`,
    subcategoryCount > 0 && `Podkategorie (${subcategoryCount}) staną się kategoriami głównymi.`,
    productCount > 0 &&
      `Przypisane do niej produkty (${productCount}) zostaną w sklepie, tylko bez tej kategorii.`,
    'Tej operacji nie można cofnąć.',
  ]
    .filter(Boolean)
    .join(' ')
}
