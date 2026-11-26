import { z } from 'zod'
import type { Address, AddressRequest } from '@/api/types'

/** Polish voivodeships, spelled as in mock_data.sql (state_province). */
export const VOIVODESHIPS = [
  'Dolnośląskie',
  'Kujawsko-Pomorskie',
  'Lubelskie',
  'Lubuskie',
  'Łódzkie',
  'Małopolskie',
  'Mazowieckie',
  'Opolskie',
  'Podkarpackie',
  'Podlaskie',
  'Pomorskie',
  'Śląskie',
  'Świętokrzyskie',
  'Warmińsko-Mazurskie',
  'Wielkopolskie',
  'Zachodniopomorskie',
] as const

/** Mirrors the constraints of AddressRequest (and the CHECKs on the addresses table). */
export const addressFormSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, 'Podaj odbiorcę.')
    .max(150, 'Odbiorca może mieć najwyżej 150 znaków.'),
  streetLine1: z
    .string()
    .trim()
    .min(1, 'Podaj ulicę i numer.')
    .max(255, 'Adres może mieć najwyżej 255 znaków.'),
  streetLine2: z.string().trim().max(255, 'Adres może mieć najwyżej 255 znaków.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{2}-[0-9]{3}$/, 'Podaj kod pocztowy w formacie 00-000.'),
  city: z
    .string()
    .trim()
    .min(1, 'Podaj miejscowość.')
    .max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  stateProvince: z.string().min(1, 'Wybierz województwo.'),
})

export type AddressFormInput = z.input<typeof addressFormSchema>
export type AddressFormOutput = z.output<typeof addressFormSchema>

export const EMPTY_ADDRESS_FORM: AddressFormInput = {
  recipientName: '',
  streetLine1: '',
  streetLine2: '',
  postalCode: '',
  city: '',
  stateProvince: '',
}

export function toAddressFormInput(address: Address): AddressFormInput {
  return {
    recipientName: address.recipientName,
    streetLine1: address.streetLine1,
    streetLine2: address.streetLine2 ?? '',
    postalCode: address.postalCode,
    city: address.city,
    stateProvince: address.stateProvince,
  }
}

/** The database rejects a blank second street line, so an empty one is sent as null. */
export function toAddressRequest(values: AddressFormOutput): AddressRequest {
  return { ...values, streetLine2: values.streetLine2 === '' ? null : values.streetLine2 }
}
