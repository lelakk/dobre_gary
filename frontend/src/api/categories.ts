import { queryOptions } from '@tanstack/react-query'
import { get } from './http'
import type { Category } from './types'

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => get<Category[]>('/categories'),
    }),
}
