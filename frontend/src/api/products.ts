import { queryOptions } from '@tanstack/react-query'
import { get } from './http'
import type { Product } from './types'

export const productQueries = {
  all: () =>
    queryOptions({
      queryKey: ['products'],
      queryFn: () => get<Product[]>('/products'),
    }),
}
