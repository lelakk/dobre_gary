import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { User } from '@/api/types'
import { createUser, updateUser, userQueries } from '@/api/users'
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
import { Spinner } from '@/components/ui/spinner'
import { showServerError } from '../form-errors'
import { FormField, FormServerError } from '../FormField'
import {
  type CustomerFormInput,
  type CustomerFormOutput,
  customerFormSchema,
  EMPTY_CUSTOMER_FORM,
  newCustomerFormSchema,
  toCreateUserRequest,
  toCustomerFormInput,
  toUpdateUserRequest,
} from './customer-form'

const FORM_ID = 'customer-form'

interface CustomerFormDialogProps {
  /** Customer to edit, or null to create a new account. */
  customer: User | null
  onClose: () => void
}

export function CustomerFormDialog({ customer, onClose }: CustomerFormDialogProps) {
  const queryClient = useQueryClient()
  const isNew = customer === null
  const form = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
    resolver: zodResolver(isNew ? newCustomerFormSchema : customerFormSchema),
    defaultValues: isNew ? EMPTY_CUSTOMER_FORM : toCustomerFormInput(customer),
  })
  const { errors } = form.formState

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormOutput) =>
      isNew
        ? createUser(toCreateUserRequest(values))
        : updateUser(customer.userId, toUpdateUserRequest(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueries.all().queryKey })
      onClose()
    },
    onError: (error) =>
      showServerError(form.setError, error, {
        field: 'email',
        message: 'Klient z tym adresem e-mail już istnieje.',
      }),
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Nowy klient' : 'Edytuj klienta'}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Konto będzie od razu dostępne przy składaniu zamówienia.'
              : 'Hasła nie da się tu zmienić.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="customer-first-name" label="Imię" error={errors.firstName?.message}>
              <Input
                id="customer-first-name"
                autoComplete="off"
                {...form.register('firstName')}
                aria-invalid={Boolean(errors.firstName)}
              />
            </FormField>
            <FormField id="customer-last-name" label="Nazwisko" error={errors.lastName?.message}>
              <Input
                id="customer-last-name"
                autoComplete="off"
                {...form.register('lastName')}
                aria-invalid={Boolean(errors.lastName)}
              />
            </FormField>
          </div>

          <FormField id="customer-email" label="E-mail" error={errors.email?.message}>
            <Input
              id="customer-email"
              type="email"
              autoComplete="off"
              {...form.register('email')}
              aria-invalid={Boolean(errors.email)}
            />
          </FormField>

          {isNew && (
            <FormField
              id="customer-password"
              label="Hasło"
              description="Co najmniej 8 znaków."
              error={errors.password?.message}
            >
              <Input
                id="customer-password"
                type="password"
                autoComplete="new-password"
                {...form.register('password')}
                aria-invalid={Boolean(errors.password)}
              />
            </FormField>
          )}

          <FormField
            id="customer-phone"
            label="Telefon (opcjonalnie)"
            error={errors.phone?.message}
          >
            <Input
              id="customer-phone"
              type="tel"
              autoComplete="off"
              {...form.register('phone')}
              aria-invalid={Boolean(errors.phone)}
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
            {isNew ? 'Dodaj klienta' : 'Zapisz zmiany'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
