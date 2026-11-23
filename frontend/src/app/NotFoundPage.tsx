import { SearchX } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { paths } from './paths'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Nie znaleziono strony"
      description="Strona, której szukasz, nie istnieje lub została przeniesiona."
      action={
        <Button asChild variant="outline">
          <Link to={paths.catalog}>Wróć do katalogu</Link>
        </Button>
      }
      className="py-24"
    />
  )
}
