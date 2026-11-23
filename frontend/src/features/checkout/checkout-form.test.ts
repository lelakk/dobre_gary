import { describe, expect, it } from 'vitest'
import {
  type CheckoutForm,
  EMPTY_CHECKOUT_FORM,
  parseCheckoutForm,
  selectCustomer,
} from './checkout-form'

const completeForm: CheckoutForm = {
  userId: 1,
  shippingAddressId: 10,
  billingSameAsShipping: true,
  billingAddressId: null,
  paymentMethod: 'blik',
}

describe('parseCheckoutForm', () => {
  it('uses the shipping address for billing by default', () => {
    expect(parseCheckoutForm(completeForm)).toEqual({
      ok: true,
      details: { userId: 1, shippingAddressId: 10, billingAddressId: 10, paymentMethod: 'blik' },
    })
  })

  it('uses a separate billing address when requested', () => {
    const result = parseCheckoutForm({
      ...completeForm,
      billingSameAsShipping: false,
      billingAddressId: 11,
    })

    expect(result).toMatchObject({ ok: true, details: { billingAddressId: 11 } })
  })

  it('reports every missing field', () => {
    expect(parseCheckoutForm({ ...EMPTY_CHECKOUT_FORM, billingSameAsShipping: false })).toEqual({
      ok: false,
      errors: {
        userId: 'Wybierz klienta.',
        shippingAddressId: 'Wybierz adres dostawy.',
        billingAddressId: 'Wybierz adres rozliczeniowy.',
        paymentMethod: 'Wybierz metodę płatności.',
      },
    })
  })

  it('does not ask for a billing address when it is the same as shipping', () => {
    const result = parseCheckoutForm({ ...completeForm, shippingAddressId: null })

    expect(result).toEqual({ ok: false, errors: { shippingAddressId: 'Wybierz adres dostawy.' } })
  })
})

describe('selectCustomer', () => {
  it('clears addresses that belonged to the previous customer', () => {
    const form = selectCustomer({ ...completeForm, billingAddressId: 11 }, 2)

    expect(form).toMatchObject({ userId: 2, shippingAddressId: null, billingAddressId: null })
    expect(form.paymentMethod).toBe('blik')
  })
})
