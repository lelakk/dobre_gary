import type { Money } from '@/api/types'

const LOCALE = 'pl-PL'

const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'PLN' })
const pluralRules = new Intl.PluralRules(LOCALE)

export function formatPrice(amount: Money): string {
  return priceFormatter.format(amount)
}

/** Polish noun forms, e.g. { one: 'produkt', few: 'produkty', many: 'produktów' }. */
export interface PluralForms {
  one: string
  few: string
  many: string
}

export const PRODUCT_FORMS: PluralForms = { one: 'produkt', few: 'produkty', many: 'produktów' }

/** Formats a count with the grammatically correct Polish noun form: 1 produkt, 3 produkty, 5 produktów. */
export function formatCount(count: number, forms: PluralForms): string {
  const category = pluralRules.select(count)
  const noun = category === 'one' || category === 'few' ? forms[category] : forms.many
  return `${count} ${noun}`
}
