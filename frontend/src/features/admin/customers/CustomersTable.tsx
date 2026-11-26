import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import type { User } from '@/api/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'

/** Secondary columns hidden on phones, so the important ones fit the screen. */
const WIDE_SCREEN_ONLY = 'hidden md:table-cell'

interface CustomersTableProps {
  customers: User[]
  /** Buttons shown at the end of each row (edit, delete). */
  renderActions: (customer: User) => ReactNode
}

export function CustomersTable({ customers, renderActions }: CustomersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Klient</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>E-mail</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Telefon</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Konto od</TableHead>
            <TableHead>
              <span className="sr-only">Akcje</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.userId}>
              <TableCell className="font-medium whitespace-normal">
                <Link
                  to={paths.adminCustomer(customer.userId)}
                  className="hover:underline hover:underline-offset-4"
                >
                  {customer.firstName} {customer.lastName}
                </Link>
                {/* On phones the e-mail column is hidden, so the address goes under the name. */}
                <span className="block text-xs font-normal text-zinc-500 md:hidden">
                  {customer.email}
                </span>
              </TableCell>
              <TableCell className={WIDE_SCREEN_ONLY}>{customer.email}</TableCell>
              <TableCell className={`${WIDE_SCREEN_ONLY} tabular-nums`}>
                {customer.phone ?? '—'}
              </TableCell>
              <TableCell className={`${WIDE_SCREEN_ONLY} text-zinc-500`}>
                {formatDate(customer.createdAt)}
              </TableCell>
              <TableCell className="text-right">{renderActions(customer)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
