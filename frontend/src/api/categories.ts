import { queryOptions } from '@tanstack/react-query'
import { get, post, put } from './http'
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
