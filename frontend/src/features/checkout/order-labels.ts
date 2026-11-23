import type { OrderStatus, PaymentMethod } from '@/api/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Oczekuje na płatność',
  paid: 'Opłacone',
  processing: 'W realizacji',
  shipped: 'Wysłane',
  delivered: 'Dostarczone',
  cancelled: 'Anulowane',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  blik: 'BLIK',
  credit_card: 'Karta płatnicza',
  paypal: 'PayPal',
  bank_transfer: 'Przelew bankowy',
  stripe: 'Stripe',
}
