import { queryOptions } from '@tanstack/react-query'
import { get } from './http'
import type { ReportId, ReportRow } from './types'

/** Backend paths for the 9 analytical SQL queries and the v_product_stock_summary view. */
export const REPORT_ENDPOINTS: Record<ReportId, string> = {
  'vip-customers': '/reports/vip-customers',
  'sales-by-category': '/reports/sales-by-category',
  'premium-products': '/reports/premium-products',
  'stock-vs-sales': '/reports/stock-vs-sales',
  'low-stock': '/reports/low-stock',
  'monthly-revenue': '/reports/monthly-revenue',
  'multi-shipment-orders': '/reports/multi-shipment-orders',
  'payment-methods': '/reports/payment-methods',
  'category-tree': '/reports/category-tree',
  'stock-summary': '/products/stock-summary',
}

export const reportQueries = {
  allKey: ['reports'] as const,
  byId: (reportId: ReportId) =>
    queryOptions({
      queryKey: ['reports', reportId] as const,
      queryFn: () => get<ReportRow[]>(REPORT_ENDPOINTS[reportId]),
    }),
}
