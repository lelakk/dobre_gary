import { z } from 'zod'
import type { Category } from '@/api/types'
import {
  buildCategoryOptions,
  type CategoryOption,
  collectCategoryTreeIds,
} from '@/lib/category-tree'

/** Mirrors the constraints of CategoryRequest on the backend, with messages in Polish. */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Podaj nazwę kategorii.')
    .max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  /** null makes it a top-level category. */
  parentId: z.number().nullable(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormOutput = z.output<typeof categoryFormSchema>

export const EMPTY_CATEGORY_FORM: CategoryFormInput = { name: '', parentId: null }

export function toCategoryFormInput(category: Category): CategoryFormInput {
  return { name: category.name, parentId: category.parentId }
}

/**
 * Categories that can become the parent: all of them except the edited category and its
 * descendants, which would create a cycle in the tree.
 */
export function getParentOptions(
  categories: Category[],
  editedCategoryId: number | null,
): CategoryOption[] {
  const excludedIds =
    editedCategoryId === null
      ? new Set<number>()
      : collectCategoryTreeIds(categories, editedCategoryId)
  return buildCategoryOptions(categories).filter((option) => !excludedIds.has(option.categoryId))
}
