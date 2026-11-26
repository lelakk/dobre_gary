import { describe, expect, it } from 'vitest'
import {
  type CustomerFormInput,
  customerFormSchema,
  newCustomerFormSchema,
  toCreateUserRequest,
  toUpdateUserRequest,
} from './customer-form'

const validInput: CustomerFormInput = {
  email: ' anna.nowak@example.com ',
  password: 'tajneHaslo123',
  firstName: 'Anna',
  lastName: ' Nowak ',
  phone: '',
}

function errorsOf(schema: typeof newCustomerFormSchema, input: CustomerFormInput) {
  const result = schema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]))
}

describe('newCustomerFormSchema', () => {
  it('accepts a valid account and trims text fields', () => {
    expect(newCustomerFormSchema.parse(validInput)).toMatchObject({
      email: 'anna.nowak@example.com',
      lastName: 'Nowak',
    })
  })

  it('rejects invalid fields with Polish messages', () => {
    expect(
      errorsOf(newCustomerFormSchema, {
        email: 'anna.example.com',
        password: 'krotkie',
        firstName: ' ',
        lastName: '',
        phone: '600-abc',
      }),
    ).toEqual({
      email: 'Podaj poprawny adres e-mail.',
      password: 'Hasło musi mieć co najmniej 8 znaków.',
      firstName: 'Podaj imię.',
      lastName: 'Podaj nazwisko.',
      phone: 'Telefon może zawierać tylko cyfry, spacje, nawiasy, „-” i „+” na początku.',
    })
  })

  it('accepts phone numbers in the formats allowed by the backend', () => {
    for (const phone of ['', '+48 600 100 200', '(22) 123-45-67']) {
      expect(newCustomerFormSchema.safeParse({ ...validInput, phone }).success).toBe(true)
    }
  })
})

describe('customerFormSchema', () => {
  it('does not require a password when editing', () => {
    expect(customerFormSchema.safeParse({ ...validInput, password: '' }).success).toBe(true)
  })
})

describe('request mapping', () => {
  const values = newCustomerFormSchema.parse({ ...validInput, phone: '+48 600 100 200' })

  it('sends the password only when creating an account', () => {
    expect(toCreateUserRequest(values)).toEqual({
      email: 'anna.nowak@example.com',
      password: 'tajneHaslo123',
      firstName: 'Anna',
      lastName: 'Nowak',
      phone: '+48 600 100 200',
    })
    expect(toUpdateUserRequest(values)).not.toHaveProperty('password')
  })

  it('sends an empty phone as null', () => {
    expect(toUpdateUserRequest({ ...values, phone: '' }).phone).toBeNull()
  })
})
