import { describe, expect, it } from 'vitest'
import type { Category } from '@/api/types'
import { buildCategoryOptions, collectCategoryTreeIds, findCategoryNames } from './category-tree'

function category(categoryId: number, name: string, parentId: number | null = null): Category {
  return { categoryId, name, parentId, parentName: null }
}

const categories: Category[] = [
  category(4, 'Sztućce'),
  category(1, 'Garnki i patelnie'),
  category(3, 'Patelnie teflonowe', 1),
  category(2, 'Zestawy garnków', 1),
  category(5, 'Komplety sztućców', 4),
  category(6, 'Patelnie 28 cm', 3),
]

describe('buildCategoryOptions', () => {
  it('lists top-level categories alphabetically, each followed by its subtree', () => {
    expect(buildCategoryOptions(categories)).toEqual([
      { categoryId: 1, name: 'Garnki i patelnie', depth: 0 },
      { categoryId: 3, name: 'Patelnie teflonowe', depth: 1 },
      { categoryId: 6, name: 'Patelnie 28 cm', depth: 2 },
      { categoryId: 2, name: 'Zestawy garnków', depth: 1 },
      { categoryId: 4, name: 'Sztućce', depth: 0 },
      { categoryId: 5, name: 'Komplety sztućców', depth: 1 },
    ])
  })
})

describe('collectCategoryTreeIds', () => {
  it('includes the category and all of its descendants', () => {
    expect(collectCategoryTreeIds(categories, 1)).toEqual(new Set([1, 2, 3, 6]))
  })

  it('returns just the category when it has no children or is unknown', () => {
    expect(collectCategoryTreeIds(categories, 5)).toEqual(new Set([5]))
    expect(collectCategoryTreeIds([], 42)).toEqual(new Set([42]))
  })
})

describe('findCategoryNames', () => {
  it('returns the names of the given categories and ignores unknown ids', () => {
    expect(findCategoryNames(categories, [5, 1, 99])).toEqual([
      'Garnki i patelnie',
      'Komplety sztućców',
    ])
  })
})
