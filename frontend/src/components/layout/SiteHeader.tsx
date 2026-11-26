import { CookingPot, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/features/cart/CartButton'
import { Container } from './Container'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          to={paths.catalog}
          className="flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <CookingPot className="size-5" aria-hidden />
          Dobre Gary
        </Link>
        <nav aria-label="Nawigacja główna" className="flex items-center gap-1">
          <Button asChild variant="ghost">
            <Link to={paths.admin} aria-label="Panel administracyjny">
              <LayoutDashboard />
              <span className="hidden sm:inline">Panel</span>
            </Link>
          </Button>
          <CartButton />
        </nav>
      </Container>
    </header>
  )
}
