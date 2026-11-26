import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { userQueries } from '@/api/users'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Skeleton } from '@/components/ui/skeleton'
import { AddressCard } from './AddressCard'

export function CustomerAddresses({ userId }: { userId: number }) {
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
          <AddressCard address={address} />
        </li>
      ))}
    </ul>
  )
}
