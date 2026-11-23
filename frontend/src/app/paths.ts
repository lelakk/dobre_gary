/** URL builders for every route, so components never hard-code paths. */
export const paths = {
  catalog: '/',
  product: (productId: number) => `/product/${productId}`,
} as const
