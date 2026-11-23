import { CookingPot } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
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
      </Container>
    </header>
  )
}
