import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Plus, SearchX } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { User } from '@/api/types'
import { userQueries } from '@/api/users'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { CUSTOMER_FORMS, formatCount } from '@/lib/format'
import { matchesSearchTerm } from '@/lib/search'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { RowActions } from '../RowActions'
import { TableSkeleton } from '../TableSkeleton'
import { CustomerFormDialog } from './CustomerFormDialog'
import { CustomersTable } from './CustomersTable'
import { DeleteCustomerDialog } from './DeleteCustomerDialog'

/** The dialog currently open on the page, if any. */
type OpenDialog =
  { kind: 'create' } | { kind: 'edit'; customer: User } | { kind: 'delete'; customer: User } | null

const collator = new Intl.Collator('pl')
const byLastName = (a: User, b: User) =>
  collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName)

export function CustomersAdminPage() {
  const usersQuery = useQuery(userQueries.all())
  const [search, setSearch] = useState('')
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const closeDialog = () => setOpenDialog(null)

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
        action={
          <Button onClick={() => setOpenDialog({ kind: 'create' })}>
            <Plus />
            Dodaj klienta
          </Button>
        }
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Szukaj po imieniu, nazwisku, e-mailu lub telefonie"
        label="Szukaj klientów"
        className="max-w-md"
      />
      <CustomersContent
        usersQuery={usersQuery}
        visibleCustomers={visibleCustomers}
        renderActions={(customer) => (
          <RowActions
            label={`${customer.firstName} ${customer.lastName}`}
            onEdit={() => setOpenDialog({ kind: 'edit', customer })}
            onDelete={() => setOpenDialog({ kind: 'delete', customer })}
          />
        )}
      />

      {openDialog?.kind === 'create' && (
        <CustomerFormDialog customer={null} onClose={closeDialog} />
      )}
      {openDialog?.kind === 'edit' && (
        <CustomerFormDialog customer={openDialog.customer} onClose={closeDialog} />
      )}
      {openDialog?.kind === 'delete' && (
        <DeleteCustomerDialog customer={openDialog.customer} onClose={closeDialog} />
      )}
    </section>
  )
}

interface CustomersContentProps {
  usersQuery: UseQueryResult<User[]>
  visibleCustomers: User[]
  renderActions: (customer: User) => ReactNode
}

function CustomersContent({ usersQuery, visibleCustomers, renderActions }: CustomersContentProps) {
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
  return <CustomersTable customers={visibleCustomers} renderActions={renderActions} />
}
