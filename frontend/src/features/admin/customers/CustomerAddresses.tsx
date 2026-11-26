import { useQuery } from '@tanstack/react-query'
import { MapPin, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Address } from '@/api/types'
import { userQueries } from '@/api/users'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddressCard } from './AddressCard'
import { AddressFormDialog } from './AddressFormDialog'

/** The dialog currently open in the section, if any. */
type OpenDialog = { kind: 'create' } | { kind: 'edit'; address: Address } | null

export function CustomerAddresses({ userId }: { userId: number }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const closeDialog = () => setOpenDialog(null)

  return (
    <section className="flex flex-col gap-3" aria-labelledby="customer-addresses-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="customer-addresses-title" className="font-medium">
          Adresy
        </h3>
        <Button variant="outline" onClick={() => setOpenDialog({ kind: 'create' })}>
          <Plus />
          Dodaj adres
        </Button>
      </div>

      <AddressList userId={userId} onEdit={(address) => setOpenDialog({ kind: 'edit', address })} />

      {openDialog?.kind === 'create' && (
        <AddressFormDialog userId={userId} address={null} onClose={closeDialog} />
      )}
      {openDialog?.kind === 'edit' && (
        <AddressFormDialog userId={userId} address={openDialog.address} onClose={closeDialog} />
      )}
    </section>
  )
}

interface AddressListProps {
  userId: number
  onEdit: (address: Address) => void
}

function AddressList({ userId, onEdit }: AddressListProps) {
  const addressesQuery = useQuery(userQueries.addresses(userId))

  if (addressesQuery.isPending) {
    return <Skeleton className="h-32 w-full rounded-lg" />
  }
  if (addressesQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać adresów"
        error={addressesQuery.error}
        onRetry={() => addressesQuery.refetch()}
      />
    )
  }
  if (addressesQuery.data.length === 0) {
    return <EmptyState icon={MapPin} title="Brak zapisanych adresów" className="py-12" />
  }
  return (
    <ul aria-label="Adresy klienta" className="grid gap-3 sm:grid-cols-2">
      {addressesQuery.data.map((address) => (
        <li key={address.addressId}>
          <AddressCard
            address={address}
            actions={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(address)}
                aria-label={`Edytuj: ${address.streetLine1}`}
              >
                <Pencil />
              </Button>
            }
          />
        </li>
      ))}
    </ul>
  )
}
