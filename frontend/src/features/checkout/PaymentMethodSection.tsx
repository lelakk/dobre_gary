import { isPaymentMethod, PAYMENT_METHODS, type PaymentMethod } from '@/api/types'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PAYMENT_METHOD_LABELS } from '@/lib/order-labels'

interface PaymentMethodSectionProps {
  value: PaymentMethod | null
  onChange: (paymentMethod: PaymentMethod) => void
  error?: string
}

export function PaymentMethodSection({ value, onChange, error }: PaymentMethodSectionProps) {
  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend>Metoda płatności</FieldLegend>
      <RadioGroup
        value={value ?? ''}
        onValueChange={(selected) => {
          if (isPaymentMethod(selected)) onChange(selected)
        }}
        className="grid-cols-2 sm:grid-cols-3"
        aria-invalid={Boolean(error)}
      >
        {PAYMENT_METHODS.map((method) => (
          <FieldLabel key={method} htmlFor={`payment-${method}`}>
            <Field orientation="horizontal">
              <RadioGroupItem value={method} id={`payment-${method}`} />
              <FieldTitle>{PAYMENT_METHOD_LABELS[method]}</FieldTitle>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      <FieldError>{error}</FieldError>
    </FieldSet>
  )
}
