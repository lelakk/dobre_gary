import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import type { Address, AddressRequest } from '@/api/types'
import { createAddress, updateAddress, userQueries } from '@/api/users'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { showServerError } from '../form-errors'
import { FormField, FormServerError } from '../FormField'
import {
  type AddressFormInput,
  type AddressFormOutput,
  addressFormSchema,
  EMPTY_ADDRESS_FORM,
  toAddressFormInput,
  toAddressRequest,
  VOIVODESHIPS,
} from './address-form'

const FORM_ID = 'address-form'

interface AddressFormDialogProps {
  userId: number
  /** Address to edit, or null to add a new one. */
  address: Address | null
  onClose: () => void
}

export function AddressFormDialog({ userId, address, onClose }: AddressFormDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<AddressFormInput, unknown, AddressFormOutput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address ? toAddressFormInput(address) : EMPTY_ADDRESS_FORM,
  })
  const { errors } = form.formState

  const saveMutation = useMutation({
    mutationFn: (request: AddressRequest) =>
      address ? updateAddress(userId, address.addressId, request) : createAddress(userId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueries.addresses(userId).queryKey })
      onClose()
    },
    onError: (error) => showServerError(form.setError, error),
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? 'Edytuj adres' : 'Nowy adres'}</DialogTitle>
          <DialogDescription>Adres będzie dostępny przy składaniu zamówienia.</DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(toAddressRequest(values)))}
          className="flex flex-col gap-4"
        >
          <FormField id="address-recipient" label="Odbiorca" error={errors.recipientName?.message}>
            <Input
              id="address-recipient"
              {...form.register('recipientName')}
              aria-invalid={Boolean(errors.recipientName)}
            />
          </FormField>
          <FormField id="address-street1" label="Ulica i numer" error={errors.streetLine1?.message}>
            <Input
              id="address-street1"
              {...form.register('streetLine1')}
              aria-invalid={Boolean(errors.streetLine1)}
            />
          </FormField>
          <FormField
            id="address-street2"
            label="Lokal, piętro itp. (opcjonalnie)"
            error={errors.streetLine2?.message}
          >
            <Input
              id="address-street2"
              {...form.register('streetLine2')}
              aria-invalid={Boolean(errors.streetLine2)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <FormField
              id="address-postal-code"
              label="Kod pocztowy"
              error={errors.postalCode?.message}
            >
              <Input
                id="address-postal-code"
                inputMode="numeric"
                placeholder="00-000"
                {...form.register('postalCode')}
                aria-invalid={Boolean(errors.postalCode)}
              />
            </FormField>
            <FormField id="address-city" label="Miejscowość" error={errors.city?.message}>
              <Input
                id="address-city"
                {...form.register('city')}
                aria-invalid={Boolean(errors.city)}
              />
            </FormField>
          </div>

          <FormField id="address-state" label="Województwo" error={errors.stateProvince?.message}>
            <Controller
              control={form.control}
              name="stateProvince"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="address-state"
                    className="w-full"
                    aria-invalid={Boolean(errors.stateProvince)}
                  >
                    <SelectValue placeholder="Wybierz województwo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {VOIVODESHIPS.map((voivodeship) => (
                      <SelectItem key={voivodeship} value={voivodeship}>
                        {voivodeship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormServerError message={errors.root?.server?.message} />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Spinner />}
            {address ? 'Zapisz zmiany' : 'Dodaj adres'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
