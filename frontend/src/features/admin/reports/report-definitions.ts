import {
  isPaymentMethod,
  isReportId,
  type ReportCellValue,
  type ReportId,
  type ReportRow,
} from '@/api/types'
import { formatInteger, formatPercent, formatPrice } from '@/lib/format'
import { PAYMENT_METHOD_LABELS } from '@/lib/order-labels'

export const REPORT_PARAM = 'report'
export const DEFAULT_REPORT_ID: ReportId = 'vip-customers'

/** Sentinel returned by the category-tree SQL query for top-level categories. */
export const ROOT_CATEGORY_SENTINEL = '--- Kategoria Główna ---'

export type ReportColumnFormat =
  | 'text'
  | 'mono'
  | 'orderId'
  | 'integer'
  | 'money'
  | 'percent'
  | 'paymentMethod'
  | 'alertReason'
  | 'parentCategory'

export interface ReportColumn {
  key: string
  label: string
  format?: ReportColumnFormat
  align?: 'left' | 'right'
  emphasize?: boolean
  hideBelow?: 'sm' | 'md'
}

export interface ReportDefinition {
  id: ReportId
  title: string
  description: string
  /** Origin in the SQL scripts, shown as a subtle badge next to the report title. */
  source: string
  /** Column keys used together to build a stable React key for each row. */
  keyFields: readonly string[]
  columns: readonly ReportColumn[]
}

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
  {
    id: 'vip-customers',
    title: 'Klienci VIP',
    description:
      'Klienci z opłaconymi zamówieniami na łączną kwotę powyżej 500 zł (bez anulowanych).',
    source: 'Zapytanie 1',
    keyFields: ['user_id'],
    columns: [
      { key: 'customer_name', label: 'Klient', emphasize: true },
      { key: 'email', label: 'E-mail', hideBelow: 'md' },
      { key: 'total_orders', label: 'Zamówienia', format: 'integer', align: 'right' },
      { key: 'total_spent', label: 'Wydano', format: 'money', align: 'right', emphasize: true },
      {
        key: 'avg_order_value',
        label: 'Śr. zamówienie',
        format: 'money',
        align: 'right',
        hideBelow: 'sm',
      },
    ],
  },
  {
    id: 'sales-by-category',
    title: 'Sprzedaż wg kategorii',
    description:
      'Liczba zamówień, sprzedanych sztuk i przychód z opłaconych zamówień dla każdej kategorii.',
    source: 'Zapytanie 2',
    keyFields: ['category_name'],
    columns: [
      { key: 'category_name', label: 'Kategoria', emphasize: true },
      { key: 'orders_with_category', label: 'Zamówienia', format: 'integer', align: 'right' },
      { key: 'units_sold', label: 'Sprzedane szt.', format: 'integer', align: 'right' },
      {
        key: 'category_revenue',
        label: 'Przychód',
        format: 'money',
        align: 'right',
        emphasize: true,
      },
    ],
  },
  {
    id: 'premium-products',
    title: 'Produkty premium',
    description: 'Produkty droższe od średniej ceny w sklepie wraz z bieżącym stanem magazynu.',
    source: 'Zapytanie 3',
    keyFields: ['sku'],
    columns: [
      { key: 'sku', label: 'SKU', format: 'mono', hideBelow: 'sm' },
      { key: 'product_name', label: 'Produkt', emphasize: true },
      { key: 'brand', label: 'Marka', hideBelow: 'md' },
      { key: 'base_price', label: 'Cena', format: 'money', align: 'right', emphasize: true },
      {
        key: 'store_avg_price',
        label: 'Śr. w sklepie',
        format: 'money',
        align: 'right',
        hideBelow: 'md',
      },
      { key: 'total_available_stock', label: 'Stan', format: 'integer', align: 'right' },
    ],
  },
  {
    id: 'stock-vs-sales',
    title: 'Magazyn a sprzedaż',
    description: 'Porównanie stanu i wartości zapasów ze zrealizowaną sprzedażą każdego produktu.',
    source: 'Zapytanie 4',
    keyFields: ['product_id'],
    columns: [
      { key: 'product_name', label: 'Produkt', emphasize: true },
      { key: 'units_in_stock', label: 'W magazynie', format: 'integer', align: 'right' },
      {
        key: 'inventory_value_pln',
        label: 'Wartość zapasu',
        format: 'money',
        align: 'right',
        hideBelow: 'md',
      },
      { key: 'units_sold', label: 'Sprzedane szt.', format: 'integer', align: 'right' },
      {
        key: 'sales_value_pln',
        label: 'Wartość sprzedaży',
        format: 'money',
        align: 'right',
        emphasize: true,
      },
    ],
  },
  {
    id: 'low-stock',
    title: 'Niski stan i brak sprzedaży',
    description: 'Produkty ze stanem poniżej 15 szt. lub jeszcze nigdy niezamówione.',
    source: 'Zapytanie 5',
    keyFields: ['product_id'],
    columns: [
      { key: 'sku', label: 'SKU', format: 'mono', hideBelow: 'sm' },
      { key: 'name', label: 'Produkt', emphasize: true },
      { key: 'brand', label: 'Marka', hideBelow: 'md' },
      { key: 'total_stock', label: 'Stan', format: 'integer', align: 'right' },
      { key: 'alert_reason', label: 'Powód alertu', format: 'alertReason' },
    ],
  },
  {
    id: 'monthly-revenue',
    title: 'Przychód miesięczny',
    description:
      'Miesięczna dynamika liczby zamówień, sprzedanych sztuk, przychodu i średniego koszyka.',
    source: 'Zapytanie 6',
    keyFields: ['sale_month'],
    columns: [
      { key: 'sale_month', label: 'Miesiąc', format: 'mono', emphasize: true },
      { key: 'orders_count', label: 'Zamówienia', format: 'integer', align: 'right' },
      {
        key: 'total_items_sold',
        label: 'Sprzedane szt.',
        format: 'integer',
        align: 'right',
        hideBelow: 'sm',
      },
      {
        key: 'monthly_revenue_pln',
        label: 'Przychód',
        format: 'money',
        align: 'right',
        emphasize: true,
      },
      {
        key: 'avg_basket_value',
        label: 'Śr. koszyk',
        format: 'money',
        align: 'right',
        hideBelow: 'md',
      },
    ],
  },
  {
    id: 'multi-shipment-orders',
    title: 'Zamówienia wielopaczkowe',
    description: 'Zamówienia dostarczone w więcej niż jednej przesyłce wraz z przewoźnikami.',
    source: 'Zapytanie 7',
    keyFields: ['order_id'],
    columns: [
      { key: 'order_id', label: 'Zamówienie', format: 'orderId', emphasize: true },
      { key: 'customer', label: 'Klient' },
      { key: 'total_amount', label: 'Kwota', format: 'money', align: 'right' },
      { key: 'packages_sent', label: 'Przesyłki', format: 'integer', align: 'right' },
      { key: 'carriers', label: 'Przewoźnicy', hideBelow: 'sm' },
    ],
  },
  {
    id: 'payment-methods',
    title: 'Metody płatności',
    description: 'Skuteczność realizacji płatności i zebrany przychód w podziale na metodę.',
    source: 'Zapytanie 8',
    keyFields: ['payment_method'],
    columns: [
      {
        key: 'payment_method',
        label: 'Metoda płatności',
        format: 'paymentMethod',
        emphasize: true,
      },
      {
        key: 'total_attempts',
        label: 'Próby',
        format: 'integer',
        align: 'right',
        hideBelow: 'sm',
      },
      {
        key: 'successful_payments',
        label: 'Udane',
        format: 'integer',
        align: 'right',
        hideBelow: 'md',
      },
      {
        key: 'failed_payments',
        label: 'Odrzucone',
        format: 'integer',
        align: 'right',
        hideBelow: 'md',
      },
      {
        key: 'refunded_payments',
        label: 'Zwroty',
        format: 'integer',
        align: 'right',
        hideBelow: 'md',
      },
      { key: 'success_rate_pct', label: 'Skuteczność', format: 'percent', align: 'right' },
      {
        key: 'collected_revenue',
        label: 'Zebrany przychód',
        format: 'money',
        align: 'right',
        emphasize: true,
      },
    ],
  },
  {
    id: 'category-tree',
    title: 'Drzewo kategorii',
    description: 'Hierarchia kategorii (self-join) z liczbą produktów i średnią ceną katalogową.',
    source: 'Zapytanie 9',
    keyFields: ['parent_category', 'category_name'],
    columns: [
      { key: 'parent_category', label: 'Kategoria nadrzędna', format: 'parentCategory' },
      { key: 'category_name', label: 'Kategoria', emphasize: true },
      { key: 'products_count', label: 'Produkty', format: 'integer', align: 'right' },
      { key: 'avg_product_price', label: 'Średnia cena', format: 'money', align: 'right' },
    ],
  },
  {
    id: 'stock-summary',
    title: 'Podsumowanie magazynu',
    description: 'Bieżący stan i wartość katalogowa zapasów z widoku v_product_stock_summary.',
    source: 'Widok SQL',
    keyFields: ['productId'],
    columns: [
      { key: 'sku', label: 'SKU', format: 'mono', hideBelow: 'sm' },
      { key: 'productName', label: 'Produkt', emphasize: true },
      { key: 'brand', label: 'Marka', hideBelow: 'md' },
      { key: 'basePrice', label: 'Cena', format: 'money', align: 'right' },
      { key: 'totalStock', label: 'Stan', format: 'integer', align: 'right' },
      {
        key: 'totalPrice',
        label: 'Wartość zapasu',
        format: 'money',
        align: 'right',
        emphasize: true,
      },
    ],
  },
]

const DEFINITIONS_BY_ID: ReadonlyMap<ReportId, ReportDefinition> = new Map(
  REPORT_DEFINITIONS.map((definition) => [definition.id, definition]),
)

export function resolveReportId(raw: string | null): ReportId {
  return raw !== null && isReportId(raw) ? raw : DEFAULT_REPORT_ID
}

export function getReportDefinition(id: ReportId): ReportDefinition {
  return DEFINITIONS_BY_ID.get(id) ?? REPORT_DEFINITIONS[0]
}

export function parseNumericValue(value: ReportCellValue): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Formats a raw cell value from JdbcTemplate/Jackson into Polish display text. */
export function formatReportCellText(
  value: ReportCellValue,
  format: ReportColumnFormat = 'text',
): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  switch (format) {
    case 'money': {
      const amount = parseNumericValue(value)
      return amount === null ? String(value) : formatPrice(amount)
    }
    case 'integer': {
      const count = parseNumericValue(value)
      return count === null ? String(value) : formatInteger(count)
    }
    case 'percent': {
      const pct = parseNumericValue(value)
      return pct === null ? String(value) : formatPercent(pct)
    }
    case 'orderId':
      return `#${String(value)}`
    case 'paymentMethod': {
      const raw = String(value)
      return isPaymentMethod(raw) ? PAYMENT_METHOD_LABELS[raw] : raw
    }
    case 'parentCategory': {
      const raw = String(value)
      return raw === ROOT_CATEGORY_SENTINEL ? 'Kategoria główna' : raw
    }
    case 'text':
    case 'mono':
    case 'alertReason':
      return String(value)
  }
}

export function getReportRowKey(
  definition: ReportDefinition,
  row: ReportRow,
  index: number,
): string {
  const parts = definition.keyFields.map((field) => row[field]).filter((value) => value != null)
  return parts.length > 0 ? parts.map(String).join('::') : `row-${index}`
}
