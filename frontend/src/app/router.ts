import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { PageLoadingFallback } from '@/components/PageLoadingFallback'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { NotFoundPage } from './NotFoundPage'

/**
 * A page split into its own chunk. When the first visit goes straight to its URL, the router
 * renders the site layout with PageLoadingFallback inside while the chunk downloads.
 */
function lazyPage(
  loadPage: () => Promise<ComponentType>,
): Pick<RouteObject, 'lazy' | 'HydrateFallback'> {
  return {
    lazy: async () => ({ Component: await loadPage() }),
    HydrateFallback: PageLoadingFallback,
  }
}

// The catalog is the landing page, so it ships with the main bundle; the other pages are
// split into their own chunks and downloaded on first visit.
export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [
      { index: true, Component: CatalogPage },
      {
        path: 'product/:productId',
        ...lazyPage(async () => (await import('@/features/product/ProductPage')).ProductPage),
      },
      {
        path: 'checkout',
        ...lazyPage(async () => (await import('@/features/checkout/CheckoutPage')).CheckoutPage),
      },
      {
        path: 'checkout/confirmation',
        ...lazyPage(
          async () =>
            (await import('@/features/checkout/OrderConfirmationPage')).OrderConfirmationPage,
        ),
      },
      {
        path: 'admin',
        ...lazyPage(async () => (await import('@/features/admin/AdminLayout')).AdminLayout),
        children: [
          {
            index: true,
            ...lazyPage(
              async () => (await import('@/features/admin/AdminLayout')).AdminIndexRedirect,
            ),
          },
          {
            path: 'products',
            ...lazyPage(
              async () =>
                (await import('@/features/admin/products/ProductsAdminPage')).ProductsAdminPage,
            ),
          },
          {
            path: 'categories',
            ...lazyPage(
              async () =>
                (await import('@/features/admin/categories/CategoriesAdminPage'))
                  .CategoriesAdminPage,
            ),
          },
          {
            path: 'customers',
            ...lazyPage(
              async () =>
                (await import('@/features/admin/customers/CustomersAdminPage')).CustomersAdminPage,
            ),
          },
          {
            path: 'customers/:userId',
            ...lazyPage(
              async () =>
                (await import('@/features/admin/customers/CustomerDetailsPage'))
                  .CustomerDetailsPage,
            ),
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
