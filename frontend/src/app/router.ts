import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { ProductPage } from '@/features/product/ProductPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'product/:productId', Component: ProductPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
