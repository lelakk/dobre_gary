import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    Component: SiteLayout,
    children: [{ path: '*', Component: NotFoundPage }],
  },
])
