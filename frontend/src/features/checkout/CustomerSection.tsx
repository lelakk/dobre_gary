import { useQuery } from '@tanstack/react-query'
import type { Address } from '@/api/types'
import { userQueries } from '@/api/users'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatAddress } from '@/lib/format'
import type { CheckoutForm, CheckoutFormErrors } from './checkout-form'

interface CustomerSectionProps {
  form: CheckoutForm
  errors: CheckoutFormErrors
  onCustomerChange: (userId: number) => void
  onChange: (changes: Partial<CheckoutForm>) => void
}

export function CustomerSection({
  form,
  errors,
  onCustomerChange,
  onChange,
}: CustomerSectionProps) {
  const usersQuery = useQuery(userQueries.all())
  const addressesQuery = useQuery(userQueries.addresses(form.userId))
  const addresses = addressesQuery.data ?? []
  const hasNoAddresses = addressesQuery.isSuccess && addresses.length === 0

  return (
    <FieldSet>
      <FieldLegend>Klient i adres</FieldLegend>
      <FieldGroup>
        {/* TODO: Use the signed-in customer instead of a picker once the backend supports
            authentication – there is no login endpoint yet, so the order is placed for a chosen account. */}
        <Field data-invalid={Boolean(errors.userId)}>
          <FieldLabel htmlFor="checkout-customer">Klient</FieldLabel>
          <Select
            value={form.userId === null ? '' : String(form.userId)}
            onValueChange={(value) => onCustomerChange(Number(value))}
            disabled={!usersQuery.isSuccess}
          >
            <SelectTrigger
              id="checkout-customer"
              className="w-full"
              aria-invalid={Boolean(errors.userId)}
            >
              <SelectValue
                placeholder={
                  usersQuery.isError ? 'Nie udało się wczytać klientów' : 'Wybierz klienta'
                }
              />
            </SelectTrigger>
            <SelectContent position="popper">
              {usersQuery.data?.map((user) => (
                <SelectItem key={user.userId} value={String(user.userId)}>
                  {user.firstName} {user.lastName} · {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Sklep nie ma jeszcze logowania, dlatego wybierz konto klienta z bazy.
          </FieldDescription>
          <FieldError>{errors.userId}</FieldError>
        </Field>

        <AddressField
          id="checkout-shipping-address"
          label="Adres dostawy"
          addresses={addresses}
          value={form.shippingAddressId}
          onChange={(shippingAddressId) => onChange({ shippingAddressId })}
          disabled={form.userId === null || !addressesQuery.isSuccess}
          error={
            hasNoAddresses ? 'Ten klient nie ma zapisanych adresów.' : errors.shippingAddressId
          }
        />

        <Field orientation="horizontal">
          <Checkbox
            id="checkout-billing-same"
            checked={form.billingSameAsShipping}
            onCheckedChange={(checked) => onChange({ billingSameAsShipping: checked === true })}
          />
          <FieldLabel htmlFor="checkout-billing-same" className="font-normal">
            Adres rozliczeniowy taki sam jak adres dostawy
          </FieldLabel>
        </Field>

        {!form.billingSameAsShipping && (
          <AddressField
            id="checkout-billing-address"
            label="Adres rozliczeniowy"
            addresses={addresses}
            value={form.billingAddressId}
            onChange={(billingAddressId) => onChange({ billingAddressId })}
            disabled={form.userId === null || !addressesQuery.isSuccess}
            error={errors.billingAddressId}
          />
        )}
      </FieldGroup>
    </FieldSet>
  )
}

interface AddressFieldProps {
  id: string
  label: string
  addresses: Address[]
  value: number | null
  onChange: (addressId: number) => void
  disabled: boolean
  error?: string
}

function AddressField({
  id,
  label,
  addresses,
  value,
  onChange,
  disabled,
  error,
}: AddressFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        value={value === null ? '' : String(value)}
        onValueChange={(selected) => onChange(Number(selected))}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder="Wybierz adres" />
        </SelectTrigger>
        <SelectContent position="popper">
          {addresses.map((address) => (
            <SelectItem key={address.addressId} value={String(address.addressId)}>
              {formatAddress(address)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
