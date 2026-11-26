import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { orderQueries } from '@/api/orders'
import { ORDER_STATUSES, type Order } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCount, ORDER_FORMS } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/order-labels'
import { cn } from '@/lib/utils'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { filterOrders, type OrderStatusFilter, parseStatusFilter } from './order-filters'
import { ORDER_STATUS_DOT_CLASSES } from './order-status-styles'
import { OrdersTable } from './OrdersTable'

export function OrdersAdminPage() {
  const ordersQuery = useQuery(orderQueries.all())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')

  const visibleOrders = filterOrders(ordersQuery.data ?? [], search, statusFilter)

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Zamówienia"
        summary={ordersQuery.data && formatCount(ordersQuery.data.length, ORDER_FORMS)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Szukaj po numerze, e-mailu, SKU lub produkcie"
          label="Szukaj zamówień"
          className="max-w-md flex-1"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(parseStatusFilter(value))}
        >
          <SelectTrigger aria-label="Filtruj według statusu" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <span
                  className={cn('size-2 rounded-full', ORDER_STATUS_DOT_CLASSES[status])}
                  aria-hidden
                />
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OrdersContent ordersQuery={ordersQuery} visibleOrders={visibleOrders} />
    </section>
  )
}

interface OrdersContentProps {
  ordersQuery: UseQueryResult<Order[]>
  visibleOrders: Order[]
}

function OrdersContent({ ordersQuery, visibleOrders }: OrdersContentProps) {
  if (ordersQuery.isPending) {
    return <TableSkeleton label="Ładowanie zamówień" />
  }
  if (ordersQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać zamówień"
        error={ordersQuery.error}
        onRetry={() => ordersQuery.refetch()}
      />
    )
  }
  if (visibleOrders.length === 0) {
    return <EmptyState icon={SearchX} title="Brak zamówień" className="py-16" />
  }
  return (
    <OrdersTable
      orders={visibleOrders}
      renderStatus={(order) => (
        <Badge variant="secondary">
          <span
            className={cn('size-1.5 rounded-full', ORDER_STATUS_DOT_CLASSES[order.orderStatus])}
            aria-hidden
          />
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </Badge>
      )}
    />
  )
}
