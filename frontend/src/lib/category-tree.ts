import type { Category } from '@/api/types'

const collator = new Intl.Collator('pl')

export interface CategoryOption {
  categoryId: number
  name: string
  /** 0 for top-level categories, 1 for their subcategories, and so on. */
  depth: number
}

/** Flattens the category tree depth-first, so every subcategory follows its parent. */
export function buildCategoryOptions(categories: Category[]): CategoryOption[] {
  const childrenByParentId = groupByParentId(categories)

  const visit = (parentId: number | null, depth: number): CategoryOption[] =>
    (childrenByParentId.get(parentId) ?? []).flatMap((category) => [
      { categoryId: category.categoryId, name: category.name, depth },
      ...visit(category.categoryId, depth + 1),
    ])

  return visit(null, 0)
}

/** Ids of the given category and all of its descendants. */
export function collectCategoryTreeIds(categories: Category[], rootId: number): Set<number> {
  const childrenByParentId = groupByParentId(categories)
  const ids = new Set<number>()
  const pending = [rootId]

  while (pending.length > 0) {
    const categoryId = pending.pop()!
    if (ids.has(categoryId)) {
      continue
    }
    ids.add(categoryId)
    for (const child of childrenByParentId.get(categoryId) ?? []) {
      pending.push(child.categoryId)
    }
  }
  return ids
}

/** Names of the given categories, in the order of the category list. */
export function findCategoryNames(categories: Category[], categoryIds: number[]): string[] {
  return categories
    .filter((category) => categoryIds.includes(category.categoryId))
    .map((category) => category.name)
}

function groupByParentId(categories: Category[]): Map<number | null, Category[]> {
  const groups = new Map<number | null, Category[]>()
  for (const category of categories.toSorted((a, b) => collator.compare(a.name, b.name))) {
    const siblings = groups.get(category.parentId) ?? []
    siblings.push(category)
    groups.set(category.parentId, siblings)
  }
  return groups
}
