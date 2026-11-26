import { describe, expect, it } from 'vitest'
import {
  type AddressFormInput,
  addressFormSchema,
  EMPTY_ADDRESS_FORM,
  toAddressRequest,
} from './address-form'

const validInput: AddressFormInput = {
  recipientName: 'Jan Kowalski',
  streetLine1: ' ul. Kwiatowa 15 ',
  streetLine2: '  ',
  postalCode: '00-001',
  city: 'Warszawa',
  stateProvince: 'Mazowieckie',
}

describe('addressFormSchema', () => {
  it('reports every missing field in Polish', () => {
    const result = addressFormSchema.safeParse(EMPTY_ADDRESS_FORM)

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Podaj odbiorcę.',
      'Podaj ulicę i numer.',
      'Podaj kod pocztowy w formacie 00-000.',
      'Podaj miejscowość.',
      'Wybierz województwo.',
    ])
  })

  it.each(['00001', '0-0001', '00-01', 'ab-cde'])('rejects the postal code %s', (postalCode) => {
    expect(addressFormSchema.safeParse({ ...validInput, postalCode }).success).toBe(false)
  })
})

describe('toAddressRequest', () => {
  it('trims fields and sends a blank second street line as null', () => {
    expect(toAddressRequest(addressFormSchema.parse(validInput))).toEqual({
      recipientName: 'Jan Kowalski',
      streetLine1: 'ul. Kwiatowa 15',
      streetLine2: null,
      postalCode: '00-001',
      city: 'Warszawa',
      stateProvince: 'Mazowieckie',
    })
  })
})
