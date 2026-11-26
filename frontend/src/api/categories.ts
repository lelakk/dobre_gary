import { queryOptions } from '@tanstack/react-query'
import { get, post, put, remove } from './http'
import type { Category, CategoryRequest } from './types'

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => get<Category[]>('/categories'),
    }),
}

export function createCategory(request: CategoryRequest): Promise<Category> {
  return post<Category>('/categories', request)
}

export function updateCategory(categoryId: number, request: CategoryRequest): Promise<Category> {
  return put<Category>(`/categories/${categoryId}`, request)
}

/** Subcategories become top-level and products only lose the assignment (see schema.sql). */
export function deleteCategory(categoryId: number): Promise<void> {
  return remove(`/categories/${categoryId}`)
}
