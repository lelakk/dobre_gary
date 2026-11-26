import { queryOptions } from '@tanstack/react-query'
import { get, post, put, remove } from './http'
import type { Product, ProductRequest } from './types'

export const productQueries = {
  all: () =>
    queryOptions({
      queryKey: ['products'],
      queryFn: () => get<Product[]>('/products'),
    }),
  detail: (productId: number) =>
    queryOptions({
      queryKey: ['products', productId],
      queryFn: () => get<Product>(`/products/${productId}`),
    }),
}

/** Creates the product together with its inventory record. */
export function createProduct(request: ProductRequest): Promise<Product> {
  return post<Product>('/products', request)
}

export function updateProduct(productId: number, request: ProductRequest): Promise<Product> {
  return put<Product>(`/products/${productId}`, request)
}

export function deleteProduct(productId: number): Promise<void> {
  return remove(`/products/${productId}`)
}
