import { z } from 'zod'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/api/types'

/** Same rule as the @Pattern on the backend: digits, spaces, brackets, "-" and an optional leading "+". */
const PHONE_PATTERN = /^([+]?[0-9 ()-]+)?$/

const customerFields = {
  email: z
    .string()
    .trim()
    .min(1, 'Podaj adres e-mail.')
    .max(255, 'Adres e-mail może mieć najwyżej 255 znaków.')
    .pipe(z.email('Podaj poprawny adres e-mail.')),
  firstName: z
    .string()
    .trim()
    .min(1, 'Podaj imię.')
    .max(100, 'Imię może mieć najwyżej 100 znaków.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Podaj nazwisko.')
    .max(100, 'Nazwisko może mieć najwyżej 100 znaków.'),
  phone: z
    .string()
    .trim()
    .max(30, 'Telefon może mieć najwyżej 30 znaków.')
    .regex(
      PHONE_PATTERN,
      'Telefon może zawierać tylko cyfry, spacje, nawiasy, „-” i „+” na początku.',
    ),
}

/** Creating an account: mirrors CreateUserRequest, including the password rules. */
export const newCustomerFormSchema = z.object({
  ...customerFields,
  password: z
    .string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków.')
    .max(100, 'Hasło może mieć najwyżej 100 znaków.'),
})

/** Editing an account: mirrors UpdateUserRequest; the password field is not shown nor sent. */
export const customerFormSchema = z.object({ ...customerFields, password: z.string() })

/** Both schemas share the input shape, so one form component serves creating and editing. */
export type CustomerFormInput = z.input<typeof newCustomerFormSchema>
export type CustomerFormOutput = z.output<typeof newCustomerFormSchema>

export const EMPTY_CUSTOMER_FORM: CustomerFormInput = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
}

export function toCustomerFormInput(user: User): CustomerFormInput {
  return {
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
  }
}

export function toCreateUserRequest(values: CustomerFormOutput): CreateUserRequest {
  return { ...toUpdateUserRequest(values), password: values.password }
}

export function toUpdateUserRequest(values: CustomerFormOutput): UpdateUserRequest {
  return {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone === '' ? null : values.phone,
  }
}
