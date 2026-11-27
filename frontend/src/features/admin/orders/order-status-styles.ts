import type { OrderStatus } from '@/api/types'

/** Subtle status dot colors shared between the status filter, table cells and details dialog. */
export const ORDER_STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  paid: 'bg-emerald-500',
  processing: 'bg-sky-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-700',
  cancelled: 'bg-red-500',
}
