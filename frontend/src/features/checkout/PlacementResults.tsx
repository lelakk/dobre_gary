import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatCount, ORDER_FORMS } from '@/lib/format'
import type { OrderPlacementResult } from './place-orders'

/**
 * Shown when only some cart lines could be ordered (when all succeed the shopper is taken
 * to the confirmation page instead). Failed lines stay in the cart.
 */
export function PlacementResults({ results }: { results: OrderPlacementResult[] }) {
  const placedOrderIds = results.flatMap((result) =>
    result.status === 'placed' ? [result.order.orderId] : [],
  )
  const failures = results.flatMap((result) => (result.status === 'failed' ? [result] : []))

  return (
    <div className="flex flex-col gap-3">
      {placedOrderIds.length > 0 && (
        <Alert>
          <CircleCheck />
          <AlertTitle>Złożono {formatCount(placedOrderIds.length, ORDER_FORMS)}</AlertTitle>
          <AlertDescription>
            <Link to={paths.orderConfirmation(placedOrderIds)}>Zobacz szczegóły</Link>
          </AlertDescription>
        </Alert>
      )}
      {failures.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Nie udało się zamówić części produktów</AlertTitle>
          <AlertDescription>
            <ul className="flex list-disc flex-col gap-1 pl-4">
              {failures.map(({ product, message }) => (
                <li key={product.productId}>
                  {product.name}: {message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
