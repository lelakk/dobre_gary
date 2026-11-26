import { useQueryClient } from '@tanstack/react-query'
import type { Address } from '@/api/types'
import { deleteAddress, userQueries } from '@/api/users'
import { formatAddress } from '@/lib/format'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { explainConflict } from '../form-errors'

interface DeleteAddressDialogProps {
  address: Address
  onClose: () => void
}

export function DeleteAddressDialog({ address, onClose }: DeleteAddressDialogProps) {
  const queryClient = useQueryClient()

  return (
    <ConfirmDeleteDialog
      title="Usunąć adres?"
      description={
        // orders reference addresses with ON DELETE RESTRICT (shipping and billing address).
        <>
          Adres <strong>{formatAddress(address)}</strong> zostanie usunięty. Adresu użytego w
          zamówieniach nie da się usunąć.
        </>
      }
      onConfirm={async () => {
        await deleteAddress(address.userId, address.addressId)
        await queryClient.invalidateQueries({
          queryKey: userQueries.addresses(address.userId).queryKey,
        })
      }}
      describeError={explainConflict(
        'Tego adresu nie można usunąć, bo jest użyty w zamówieniach, które muszą zostać w historii.',
      )}
      onClose={onClose}
    />
  )
}
