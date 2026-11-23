import { queryOptions, skipToken } from '@tanstack/react-query'
import { get } from './http'
import type { Address, User } from './types'

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'],
      queryFn: () => get<User[]>('/users'),
    }),
  /** Addresses of a user; the query stays idle until a user is selected. */
  addresses: (userId: number | null) =>
    queryOptions({
      queryKey: ['users', userId, 'addresses'],
      queryFn: userId === null ? skipToken : () => get<Address[]>(`/users/${userId}/addresses`),
    }),
}
