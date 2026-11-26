import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@/api/types'
import { deleteUser, userQueries } from '@/api/users'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { explainConflict } from '../form-errors'

interface DeleteCustomerDialogProps {
  customer: User
  onClose: () => void
}

export function DeleteCustomerDialog({ customer, onClose }: DeleteCustomerDialogProps) {
  const queryClient = useQueryClient()

  return (
    <ConfirmDeleteDialog
      title="Usunąć klienta?"
      description={
        // addresses.user_id is ON DELETE CASCADE, orders.user_id is ON DELETE RESTRICT.
        <>
          Konto <strong>{`${customer.firstName} ${customer.lastName}`}</strong> ({customer.email})
          zostanie usunięte razem z zapisanymi adresami. Klienta, który złożył zamówienia, nie da
          się usunąć.
        </>
      }
      onConfirm={async () => {
        await deleteUser(customer.userId)
        await queryClient.invalidateQueries({ queryKey: userQueries.all().queryKey })
      }}
      describeError={explainConflict(
        'Tego klienta nie można usunąć, bo ma złożone zamówienia, które muszą zostać w historii.',
      )}
      onClose={onClose}
    />
  )
}
