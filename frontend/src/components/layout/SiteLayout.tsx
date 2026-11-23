import { Outlet, ScrollRestoration } from 'react-router'
import { CartSheet } from '@/features/cart/CartSheet'
import { Container } from './Container'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-10">
          <Outlet />
        </Container>
      </main>
      <SiteFooter />
      <CartSheet />
      <ScrollRestoration />
    </div>
  )
}
