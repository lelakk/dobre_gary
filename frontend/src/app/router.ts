import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { NotFoundPage } from './NotFoundPage'

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
      { path: '*', Component: NotFoundPage },
    ],
  },
])
