import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { ApiError } from '@/api/http'
import type { User } from '@/api/types'
import { userQueries } from '@/api/users'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { parseId } from '@/lib/parse'
import { CustomerAddresses } from './CustomerAddresses'
import { CustomerFormDialog } from './CustomerFormDialog'

export function CustomerDetailsPage() {
  const userId = parseId(useParams().userId)

  return (
    <section className="flex flex-col gap-6">
      <Link
        to={paths.adminCustomers}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Klienci
      </Link>
      {userId === null ? <CustomerNotFound /> : <CustomerLoader userId={userId} />}
    </section>
  )
}

function CustomerLoader({ userId }: { userId: number }) {
  const customerQuery = useQuery(userQueries.detail(userId))

  if (customerQuery.isPending) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }
  if (customerQuery.isError) {
    const isNotFound = customerQuery.error instanceof ApiError && customerQuery.error.status === 404
    return isNotFound ? (
      <CustomerNotFound />
    ) : (
      <QueryErrorAlert
        title="Nie udało się wczytać klienta"
        error={customerQuery.error}
        onRetry={() => customerQuery.refetch()}
      />
    )
  }
  return <CustomerDetails customer={customerQuery.data} />
}

function CustomerDetails({ customer }: { customer: User }) {
  const [isEditing, setEditing] = useState(false)

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {customer.firstName} {customer.lastName}
          </h2>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
            <div className="flex gap-1.5">
              <dt className="text-zinc-500">E-mail:</dt>
              <dd>{customer.email}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-zinc-500">Telefon:</dt>
              <dd className="tabular-nums">{customer.phone ?? '—'}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-zinc-500">Konto od:</dt>
              <dd>{formatDate(customer.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Pencil />
          Edytuj dane
        </Button>
      </header>

      <CustomerAddresses userId={customer.userId} />

      {isEditing && <CustomerFormDialog customer={customer} onClose={() => setEditing(false)} />}
    </>
  )
}

function CustomerNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Nie znaleziono klienta"
      description="Konto mogło zostać usunięte."
      action={
        <Button asChild variant="outline">
          <Link to={paths.adminCustomers}>Wróć do listy klientów</Link>
        </Button>
      }
      className="py-16"
    />
  )
}
