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

export function CustomersTable({ customers }: { customers: User[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Klient</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>E-mail</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Telefon</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Konto od</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.userId}>
              <TableCell className="font-medium whitespace-normal">
                {customer.firstName} {customer.lastName}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
