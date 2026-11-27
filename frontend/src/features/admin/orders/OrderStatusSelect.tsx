import { isOrderStatus, ORDER_STATUSES, type OrderStatus } from '@/api/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { ORDER_STATUS_LABELS } from '@/lib/order-labels'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_DOT_CLASSES } from './order-status-styles'

interface OrderStatusSelectProps {
  orderId: number
  value: OrderStatus
  onChange: (nextStatus: OrderStatus) => void
  isUpdating?: boolean
}

export function OrderStatusSelect({
  orderId,
  value,
  onChange,
  isUpdating = false,
}: OrderStatusSelectProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Select
        value={value}
        disabled={isUpdating}
        onValueChange={(nextValue) => {
          if (isOrderStatus(nextValue) && nextValue !== value) {
            onChange(nextValue)
          }
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Status zamówienia nr ${orderId}`}
          className="w-44 bg-white"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
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
      {isUpdating && (
        <Spinner className="size-3.5 text-zinc-500" aria-label="Zapisywanie statusu" />
      )}
    </div>
  )
}
