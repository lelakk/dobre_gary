import { describe, expect, it } from 'vitest'
import { REPORT_ENDPOINTS } from '@/api/reports'
import { REPORT_IDS } from '@/api/types'
import {
  DEFAULT_REPORT_ID,
  formatReportCellText,
  getReportDefinition,
  getReportRowKey,
  parseNumericValue,
  REPORT_DEFINITIONS,
  resolveReportId,
  ROOT_CATEGORY_SENTINEL,
} from './report-definitions'

function normalizeSpaces(text: string) {
  return text.replace(/\s/g, ' ')
}

describe('REPORT_DEFINITIONS', () => {
  it('defines every report exposed by the API', () => {
    const definedIds = REPORT_DEFINITIONS.map((definition) => definition.id)
    expect(definedIds).toEqual([...REPORT_IDS])
    for (const id of REPORT_IDS) {
      expect(REPORT_ENDPOINTS[id]).toBeTruthy()
      expect(getReportDefinition(id).columns.length).toBeGreaterThan(0)
    }
  })
})

describe('resolveReportId', () => {
  it('returns the requested id when it is known', () => {
    expect(resolveReportId('monthly-revenue')).toBe('monthly-revenue')
    expect(resolveReportId('stock-summary')).toBe('stock-summary')
  })

  it('falls back to the default report for missing or unknown values', () => {
    expect(resolveReportId(null)).toBe(DEFAULT_REPORT_ID)
    expect(resolveReportId('non-existent')).toBe(DEFAULT_REPORT_ID)
  })
})

describe('parseNumericValue', () => {
  it('parses numbers and numeric strings, rejecting empty or non-finite values', () => {
    expect(parseNumericValue(42.5)).toBe(42.5)
    expect(parseNumericValue('199.99')).toBe(199.99)
    expect(parseNumericValue('')).toBeNull()
    expect(parseNumericValue('abc')).toBeNull()
    expect(parseNumericValue(Number.NaN)).toBeNull()
    expect(parseNumericValue(null)).toBeNull()
  })
})

describe('formatReportCellText', () => {
  it('renders null, undefined and empty strings as an em dash', () => {
    expect(formatReportCellText(null, 'money')).toBe('—')
    expect(formatReportCellText(undefined, 'integer')).toBe('—')
    expect(formatReportCellText('', 'text')).toBe('—')
  })

  it('formats money, integer and percent values', () => {
    expect(normalizeSpaces(formatReportCellText(12490.5, 'money'))).toBe('12 490,50 zł')
    expect(normalizeSpaces(formatReportCellText('89.90', 'money'))).toBe('89,90 zł')
    expect(normalizeSpaces(formatReportCellText(15000, 'integer'))).toBe('15 000')
    expect(formatReportCellText(85.7, 'percent')).toBe('85,7%')
  })

  it('formats order ids, payment methods and root category sentinel', () => {
    expect(formatReportCellText(14, 'orderId')).toBe('#14')
    expect(formatReportCellText('blik', 'paymentMethod')).toBe('BLIK')
    expect(formatReportCellText('bank_transfer', 'paymentMethod')).toBe('Przelew bankowy')
    expect(formatReportCellText('cash', 'paymentMethod')).toBe('cash')
    expect(formatReportCellText(ROOT_CATEGORY_SENTINEL, 'parentCategory')).toBe('Kategoria główna')
    expect(formatReportCellText('Garnki', 'parentCategory')).toBe('Garnki')
  })
})

describe('getReportRowKey', () => {
  it('builds keys from single or composite fields and falls back to the row index', () => {
    const vip = getReportDefinition('vip-customers')
    const tree = getReportDefinition('category-tree')

    expect(getReportRowKey(vip, { user_id: 7 }, 0)).toBe('7')
    expect(getReportRowKey(tree, { parent_category: 'Garnki', category_name: 'Żeliwne' }, 1)).toBe(
      'Garnki::Żeliwne',
    )
    expect(getReportRowKey(vip, {}, 3)).toBe('row-3')
  })
})
