import type { UseQueryResult } from '@tanstack/react-query'
import type { Order } from '@/api/types'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { multiplyPrice } from '@/lib/money'
import { ORDER_STATUS_LABELS } from './order-labels'

interface OrderCardProps {
  orderId: number
  orderQuery: UseQueryResult<Order>
}

export function OrderCard({ orderId, orderQuery }: OrderCardProps) {
  if (orderQuery.isPending) {
    return <Skeleton className="h-48 w-full rounded-xl" />
  }
  if (orderQuery.isError) {
    return (
      <QueryErrorAlert
        title={`Nie udało się wczytać zamówienia nr ${orderId}`}
        error={orderQuery.error}
        onRetry={() => orderQuery.refetch()}
      />
    )
  }
  return <OrderDetails order={orderQuery.data} />
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">
            Zamówienie nr <span className="tabular-nums">{order.orderId}</span>
          </h2>
          <p className="text-sm text-zinc-500">
            {formatDateTime(order.createdAt)} · {order.customerEmail}
          </p>
        </div>
        <Badge variant="secondary">{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
      </header>

      <Separator />

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li key={item.orderItemId} className="flex items-center gap-3">
            <div className="shrink-0 overflow-hidden rounded-md border border-zinc-200">
              <ProductImage sku={item.productSku} name={item.productName} className="size-12" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.productName}</p>
              <p className="text-xs text-zinc-500">
                <span className="tabular-nums">{item.quantity}</span> ×{' '}
                <Price amount={item.unitPrice} />
              </p>
            </div>
            <Price amount={multiplyPrice(item.unitPrice, item.quantity)} className="text-sm" />
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex items-center justify-between font-medium">
        <span>Razem</span>
        <Price amount={order.totalAmount} />
      </div>
    </section>
  )
}
