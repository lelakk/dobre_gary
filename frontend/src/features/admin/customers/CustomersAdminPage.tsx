import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import type { User } from '@/api/types'
import { userQueries } from '@/api/users'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { CUSTOMER_FORMS, formatCount } from '@/lib/format'
import { matchesSearchTerm } from '@/lib/search'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { CustomersTable } from './CustomersTable'

const collator = new Intl.Collator('pl')
const byLastName = (a: User, b: User) =>
  collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName)

export function CustomersAdminPage() {
  const usersQuery = useQuery(userQueries.all())
  const [search, setSearch] = useState('')

  const visibleCustomers = (usersQuery.data ?? [])
    .filter((user) =>
      matchesSearchTerm([`${user.firstName} ${user.lastName}`, user.email, user.phone], search),
    )
    .toSorted(byLastName)

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Klienci"
        summary={usersQuery.data && formatCount(usersQuery.data.length, CUSTOMER_FORMS)}
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Szukaj po imieniu, nazwisku, e-mailu lub telefonie"
        label="Szukaj klientów"
        className="max-w-md"
      />
      <CustomersContent usersQuery={usersQuery} visibleCustomers={visibleCustomers} />
    </section>
  )
}

interface CustomersContentProps {
  usersQuery: UseQueryResult<User[]>
  visibleCustomers: User[]
}

function CustomersContent({ usersQuery, visibleCustomers }: CustomersContentProps) {
  if (usersQuery.isPending) {
    return <TableSkeleton label="Ładowanie klientów" />
  }
  if (usersQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać klientów"
        error={usersQuery.error}
        onRetry={() => usersQuery.refetch()}
      />
    )
  }
  if (visibleCustomers.length === 0) {
    return <EmptyState icon={SearchX} title="Brak klientów" className="py-16" />
  }
  return <CustomersTable customers={visibleCustomers} />
}
