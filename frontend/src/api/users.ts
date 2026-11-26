import { queryOptions, skipToken } from '@tanstack/react-query'
import { get, post, put, remove } from './http'
import type { Address, CreateUserRequest, UpdateUserRequest, User } from './types'

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'],
      queryFn: () => get<User[]>('/users'),
    }),
  detail: (userId: number) =>
    queryOptions({
      queryKey: ['users', userId],
      queryFn: () => get<User>(`/users/${userId}`),
    }),
  /** Addresses of a user; the query stays idle until a user is selected. */
  addresses: (userId: number | null) =>
    queryOptions({
      queryKey: ['users', userId, 'addresses'],
      queryFn: userId === null ? skipToken : () => get<Address[]>(`/users/${userId}/addresses`),
    }),
}

export function createUser(request: CreateUserRequest): Promise<User> {
  return post<User>('/users', request)
}

export function updateUser(userId: number, request: UpdateUserRequest): Promise<User> {
  return put<User>(`/users/${userId}`, request)
}

/** Removes the account and its addresses; the backend refuses (409) when the user has orders. */
export function deleteUser(userId: number): Promise<void> {
  return remove(`/users/${userId}`)
}
