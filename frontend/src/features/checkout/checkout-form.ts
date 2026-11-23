import type { PaymentMethod } from '@/api/types'

/** Raw state of the checkout form; null means "not selected yet". */
export interface CheckoutForm {
  userId: number | null
  shippingAddressId: number | null
  billingSameAsShipping: boolean
  billingAddressId: number | null
  paymentMethod: PaymentMethod | null
}

/** A complete checkout form, ready to be sent with every order. */
export interface CheckoutDetails {
  userId: number
  shippingAddressId: number
  billingAddressId: number
  paymentMethod: PaymentMethod
}

export type CheckoutFormErrors = Partial<
  Record<'userId' | 'shippingAddressId' | 'billingAddressId' | 'paymentMethod', string>
>

export type CheckoutFormResult =
  { ok: true; details: CheckoutDetails } | { ok: false; errors: CheckoutFormErrors }

export const EMPTY_CHECKOUT_FORM: CheckoutForm = {
  userId: null,
  shippingAddressId: null,
  billingSameAsShipping: true,
  billingAddressId: null,
  paymentMethod: null,
}

/** Addresses belong to a user, so choosing another customer clears the selected addresses. */
export function selectCustomer(form: CheckoutForm, userId: number): CheckoutForm {
  return { ...form, userId, shippingAddressId: null, billingAddressId: null }
}

export function parseCheckoutForm(form: CheckoutForm): CheckoutFormResult {
  const { userId, shippingAddressId, paymentMethod } = form
  const billingAddressId = form.billingSameAsShipping ? shippingAddressId : form.billingAddressId

  if (
    userId === null ||
    shippingAddressId === null ||
    billingAddressId === null ||
    paymentMethod === null
  ) {
    return { ok: false, errors: collectErrors(form) }
  }
  return { ok: true, details: { userId, shippingAddressId, billingAddressId, paymentMethod } }
}

function collectErrors(form: CheckoutForm): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}
  if (form.userId === null) {
    errors.userId = 'Wybierz klienta.'
  }
  if (form.shippingAddressId === null) {
    errors.shippingAddressId = 'Wybierz adres dostawy.'
  }
  if (!form.billingSameAsShipping && form.billingAddressId === null) {
    errors.billingAddressId = 'Wybierz adres rozliczeniowy.'
  }
  if (form.paymentMethod === null) {
    errors.paymentMethod = 'Wybierz metodę płatności.'
  }
  return errors
}
