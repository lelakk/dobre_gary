/**
 * Types mirroring the backend DTOs (records in pl.dobregary.dto).
 * Keep them in sync with the Java side when the API changes.
 */

/** BigDecimal amount in PLN, serialized by Jackson as a JSON number. */
export type Money = number

/** LocalDateTime serialized as ISO-8601 without a time zone, e.g. "2026-11-23T22:04:43". */
export type IsoDateTime = string

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['blik', 'credit_card', 'paypal', 'bank_transfer', 'stripe'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/** ProductResponse: a product together with its current stock from the inventory table. */
export interface Product {
  productId: number
  sku: string
  name: string
  brand: string
  description: string | null
  basePrice: Money
  quantity: number
  categoryIds: number[]
  createdAt: IsoDateTime
}

/** CategoryResponse: a node of the category tree (parentId is null for top-level categories). */
export interface Category {
  categoryId: number
  parentId: number | null
  parentName: string | null
  name: string
}

/** UserResponse: a customer account. */
export interface User {
  userId: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  createdAt: IsoDateTime
}

/** AddressResponse: an address owned by a user. */
export interface Address {
  addressId: number
  userId: number
  recipientName: string
  streetLine1: string
  streetLine2: string | null
  city: string
  stateProvince: string
  postalCode: string
  createdAt: IsoDateTime
}

/** OrderItemResponse */
export interface OrderItem {
  orderItemId: number
  productId: number
  productSku: string
  productName: string
  quantity: number
  unitPrice: Money
}

/** OrderResponse */
export interface Order {
  orderId: number
  userId: number
  customerEmail: string
  shippingAddressId: number
  billingAddressId: number
  orderStatus: OrderStatus
  totalAmount: Money
  createdAt: IsoDateTime
  items: OrderItem[]
}

/** QuickOrderRequest: input of the sp_place_single_product_order stored procedure. */
export interface QuickOrderRequest {
  userId: number
  shippingAddressId: number
  billingAddressId: number
  productId: number
  quantity: number
  paymentMethod: PaymentMethod
}

/** ApiError: error body produced by GlobalExceptionHandler. */
export interface ApiErrorResponse {
  timestamp: IsoDateTime
  status: number
  error: string
  message: string
  fieldErrors: Record<string, string>
}
