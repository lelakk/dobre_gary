import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { OrderConfirmationPage } from '@/features/checkout/OrderConfirmationPage'
import { ProductPage } from '@/features/product/ProductPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'product/:productId', Component: ProductPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'checkout/confirmation', Component: OrderConfirmationPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
