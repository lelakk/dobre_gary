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

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod)
}

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

/** ProductRequest: body of POST /api/products and PUT /api/products/{id}. */
export interface ProductRequest {
  sku: string
  name: string
  brand: string
  description: string | null
  basePrice: Money
  /** Stock written to the inventory table. */
  quantity: number
  categoryIds: number[]
}

/** CategoryResponse: a node of the category tree (parentId is null for top-level categories). */
export interface Category {
  categoryId: number
  parentId: number | null
  parentName: string | null
  name: string
}

/** CategoryRequest: body of POST /api/categories and PUT /api/categories/{id}. */
export interface CategoryRequest {
  parentId: number | null
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

/** CreateUserRequest: body of POST /api/users (the password is stored as a SHA-256 hash). */
export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string | null
}

/** UpdateUserRequest: body of PUT /api/users/{id} (the password cannot be changed here). */
export interface UpdateUserRequest {
  email: string
  firstName: string
  lastName: string
  phone: string | null
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

/** AddressRequest: body of POST/PUT /api/users/{userId}/addresses. */
export interface AddressRequest {
  recipientName: string
  streetLine1: string
  streetLine2: string | null
  city: string
  stateProvince: string
  postalCode: string
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

/** Analytical reports exposed by ReportController plus the v_product_stock_summary SQL view. */
export const REPORT_IDS = [
  'vip-customers',
  'sales-by-category',
  'premium-products',
  'stock-vs-sales',
  'low-stock',
  'monthly-revenue',
  'multi-shipment-orders',
  'payment-methods',
  'category-tree',
  'stock-summary',
] as const
export type ReportId = (typeof REPORT_IDS)[number]

export function isReportId(value: string): value is ReportId {
  return REPORT_IDS.includes(value as ReportId)
}

export type ReportCellValue = string | number | boolean | null | undefined
export type ReportRow = Record<string, ReportCellValue>
