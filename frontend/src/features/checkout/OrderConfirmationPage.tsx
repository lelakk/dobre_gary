import { useQueries } from '@tanstack/react-query'
import { CircleCheck, SearchX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { ORDER_IDS_PARAM, paths } from '@/app/paths'
import { orderQueries } from '@/api/orders'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { parseIdList } from '@/lib/parse'
import { OrderCard } from './OrderCard'

export function OrderConfirmationPage() {
  const [searchParams] = useSearchParams()
  const orderIds = parseIdList(searchParams.get(ORDER_IDS_PARAM))
  const orderResults = useQueries({ queries: orderIds.map((id) => orderQueries.detail(id)) })

  if (orderIds.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Brak zamówień do wyświetlenia"
        action={
          <Button asChild variant="outline">
            <Link to={paths.catalog}>Wróć do katalogu</Link>
          </Button>
        }
        className="py-24"
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="size-10 text-emerald-600" strokeWidth={1.5} aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight">Dziękujemy za zakupy</h1>
        <p className="text-sm text-zinc-500">
          {orderIds.length === 1
            ? 'Zamówienie zostało przyjęte i czeka na płatność.'
            : 'Zamówienia zostały przyjęte i czekają na płatność.'}
        </p>
      </header>

      {orderResults.map((orderQuery, index) => (
        <OrderCard key={orderIds[index]} orderId={orderIds[index]} orderQuery={orderQuery} />
      ))}

      <Button asChild variant="outline" className="self-center">
        <Link to={paths.catalog}>Kontynuuj zakupy</Link>
      </Button>
    </div>
  )
}
