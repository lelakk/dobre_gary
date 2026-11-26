import { describe, expect, it } from 'vitest'
import type { Category } from '@/api/types'
import { categoryFormSchema, getParentOptions } from './category-form'

function category(categoryId: number, name: string, parentId: number | null = null): Category {
  return { categoryId, name, parentId, parentName: null }
}

const categories = [
  category(1, 'Garnki i patelnie'),
  category(2, 'Zestawy garnków', 1),
  category(3, 'Garnki indukcyjne', 2),
  category(4, 'Sztućce'),
]

describe('categoryFormSchema', () => {
  it('trims the name and keeps the parent', () => {
    expect(categoryFormSchema.parse({ name: '  Patelnie ', parentId: 1 })).toEqual({
      name: 'Patelnie',
      parentId: 1,
    })
  })

  it('requires a name', () => {
    const result = categoryFormSchema.safeParse({ name: '   ', parentId: null })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Podaj nazwę kategorii.')
  })
})

describe('getParentOptions', () => {
  const names = (categoryId: number | null) =>
    getParentOptions(categories, categoryId).map((option) => option.name)

  it('offers every category for a new category', () => {
    expect(names(null)).toEqual([
      'Garnki i patelnie',
      'Zestawy garnków',
      'Garnki indukcyjne',
      'Sztućce',
    ])
  })

  it('leaves out the edited category and its descendants', () => {
    expect(names(2)).toEqual(['Garnki i patelnie', 'Sztućce'])
    expect(names(1)).toEqual(['Sztućce'])
  })
})
