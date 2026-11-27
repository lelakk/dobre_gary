import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { Eye, SearchX, TriangleAlert } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { orderQueries, updateOrderStatus } from '@/api/orders'
import { reportQueries } from '@/api/reports'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorMessage } from '@/lib/errors'
import { formatCount, ORDER_FORMS } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/order-labels'
import { cn } from '@/lib/utils'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { filterOrders, type OrderStatusFilter, parseStatusFilter } from './order-filters'
import { ORDER_STATUS_DOT_CLASSES } from './order-status-styles'
import { OrderDetailsDialog } from './OrderDetailsDialog'
import { OrdersTable } from './OrdersTable'
import { OrderStatusSelect } from './OrderStatusSelect'

interface StatusError {
  orderId: number
  message: string
}

export function OrdersAdminPage() {
  const queryClient = useQueryClient()
  const ordersQuery = useQuery(orderQueries.all())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [updatingOrderIds, setUpdatingOrderIds] = useState<ReadonlySet<number>>(() => new Set())
  const [statusError, setStatusError] = useState<StatusError | null>(null)

  const statusMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }: { orderId: number; orderStatus: OrderStatus }) =>
      updateOrderStatus(orderId, { orderStatus }),
    onMutate: ({ orderId }) => {
      setStatusError(null)
      setUpdatingOrderIds((current) => new Set(current).add(orderId))
    },
    onSuccess: async (updatedOrder) => {
      queryClient.setQueryData<Order[]>(orderQueries.all().queryKey, (current) =>
        current?.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order)),
      )
      queryClient.setQueryData<Order>(
        orderQueries.detail(updatedOrder.orderId).queryKey,
        updatedOrder,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueries.all().queryKey }),
        queryClient.invalidateQueries({
          queryKey: orderQueries.detail(updatedOrder.orderId).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: reportQueries.allKey }),
      ])
    },
    onError: (error, { orderId }) => {
      setStatusError({ orderId, message: getErrorMessage(error) })
    },
    onSettled: (_data, _error, { orderId }) => {
      setUpdatingOrderIds((current) => {
        const next = new Set(current)
        next.delete(orderId)
        return next
      })
    },
  })

  const visibleOrders = filterOrders(ordersQuery.data ?? [], search, statusFilter)
  const selectedOrder =
    selectedOrderId === null
      ? null
      : (ordersQuery.data?.find((order) => order.orderId === selectedOrderId) ?? null)

  const handleStatusChange = (orderId: number, orderStatus: OrderStatus) => {
    statusMutation.mutate({ orderId, orderStatus })
  }

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

      {statusError && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Nie udało się zmienić statusu zamówienia #{statusError.orderId}</AlertTitle>
          <AlertDescription>{statusError.message}</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => setStatusError(null)}>
              Zamknij
            </Button>
          </AlertAction>
        </Alert>
      )}

      <OrdersContent
        ordersQuery={ordersQuery}
        visibleOrders={visibleOrders}
        renderStatus={(order) => (
          <OrderStatusSelect
            orderId={order.orderId}
            value={order.orderStatus}
            isUpdating={updatingOrderIds.has(order.orderId)}
            onChange={(nextStatus) => handleStatusChange(order.orderId, nextStatus)}
          />
        )}
        renderActions={(order) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedOrderId(order.orderId)}
            aria-label={`Szczegóły zamówienia nr ${order.orderId}`}
          >
            <Eye />
          </Button>
        )}
      />

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          isUpdatingStatus={updatingOrderIds.has(selectedOrder.orderId)}
          statusError={statusError?.orderId === selectedOrder.orderId ? statusError.message : null}
          onStatusChange={(nextStatus) => handleStatusChange(selectedOrder.orderId, nextStatus)}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </section>
  )
}

interface OrdersContentProps {
  ordersQuery: UseQueryResult<Order[]>
  visibleOrders: Order[]
  renderStatus: (order: Order) => ReactNode
  renderActions: (order: Order) => ReactNode
}

function OrdersContent({
  ordersQuery,
  visibleOrders,
  renderStatus,
  renderActions,
}: OrdersContentProps) {
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
    <OrdersTable orders={visibleOrders} renderStatus={renderStatus} renderActions={renderActions} />
  )
}
