import type { Address, IsoDateTime, Money } from '@/api/types'

const LOCALE = 'pl-PL'

const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'PLN' })
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeStyle: 'short' })
const pluralRules = new Intl.PluralRules(LOCALE)

export function formatPrice(amount: Money): string {
  return priceFormatter.format(amount)
}

/** The backend sends LocalDateTime without a zone, so it is shown exactly as stored. */
export function formatDateTime(value: IsoDateTime): string {
  return dateTimeFormatter.format(new Date(value))
}

/** One-line address, e.g. "Jan Kowalski, ul. Kwiatowa 15, 00-001 Warszawa". */
export function formatAddress(address: Address): string {
  const street = [address.streetLine1, address.streetLine2].filter(Boolean).join(' ')
  return `${address.recipientName}, ${street}, ${address.postalCode} ${address.city}`
}

/** Polish noun forms, e.g. { one: 'produkt', few: 'produkty', many: 'produktów' }. */
export interface PluralForms {
  one: string
  few: string
  many: string
}

export const PRODUCT_FORMS: PluralForms = { one: 'produkt', few: 'produkty', many: 'produktów' }
export const ORDER_FORMS: PluralForms = { one: 'zamówienie', few: 'zamówienia', many: 'zamówień' }
export const CATEGORY_FORMS: PluralForms = { one: 'kategoria', few: 'kategorie', many: 'kategorii' }

/** Formats a count with the grammatically correct Polish noun form: 1 produkt, 3 produkty, 5 produktów. */
export function formatCount(count: number, forms: PluralForms): string {
  const category = pluralRules.select(count)
  const noun = category === 'one' || category === 'few' ? forms[category] : forms.many
  return `${count} ${noun}`
}
