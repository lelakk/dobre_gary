/** Search param carrying the ids of the orders shown on the confirmation page. */
export const ORDER_IDS_PARAM = 'orders'

/** URL builders for every route, so components never hard-code paths. */
export const paths = {
  catalog: '/',
  product: (productId: number) => `/product/${productId}`,
  checkout: '/checkout',
  /** e.g. /checkout/confirmation?orders=12,13 */
  orderConfirmation: (orderIds: number[]) =>
    `/checkout/confirmation?${ORDER_IDS_PARAM}=${orderIds.join(',')}`,
  admin: '/admin',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminCustomers: '/admin/customers',
} as const
