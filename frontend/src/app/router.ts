import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
