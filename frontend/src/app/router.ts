import { createBrowserRouter, redirect } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { NotFoundPage } from './NotFoundPage'
import { paths } from './paths'

// The catalog is the landing page, so it ships with the main bundle; the other pages are
// split into their own chunks and downloaded on first visit.
export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [
      { index: true, Component: CatalogPage },
      {
        path: 'product/:productId',
        lazy: async () => ({
          Component: (await import('@/features/product/ProductPage')).ProductPage,
        }),
      },
      {
        path: 'checkout',
        lazy: async () => ({
          Component: (await import('@/features/checkout/CheckoutPage')).CheckoutPage,
        }),
      },
      {
        path: 'checkout/confirmation',
        lazy: async () => ({
          Component: (await import('@/features/checkout/OrderConfirmationPage'))
            .OrderConfirmationPage,
        }),
      },
      {
        path: 'admin',
        lazy: async () => ({
          Component: (await import('@/features/admin/AdminLayout')).AdminLayout,
        }),
        children: [
          { index: true, loader: () => redirect(paths.adminProducts) },
          {
            path: 'products',
            lazy: async () => ({
              Component: (await import('@/features/admin/products/ProductsAdminPage'))
                .ProductsAdminPage,
            }),
          },
          {
            path: 'categories',
            lazy: async () => ({
              Component: (await import('@/features/admin/categories/CategoriesAdminPage'))
                .CategoriesAdminPage,
            }),
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
