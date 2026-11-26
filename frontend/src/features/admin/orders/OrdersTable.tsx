import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import type { Order } from '@/api/types'
import { Price } from '@/components/Price'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { summarizeOrderItems } from './order-filters'

interface OrdersTableProps {
  orders: Order[]
  /** Renders the status cell (static badge or inline status selector). */
  renderStatus: (order: Order) => ReactNode
}

export function OrdersTable({ orders, renderStatus }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nr</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="hidden sm:table-cell">Klient</TableHead>
            <TableHead className="hidden lg:table-cell">Pozycje</TableHead>
            <TableHead className="text-right">Kwota</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const itemsSummary = summarizeOrderItems(order.items)
            return (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium tabular-nums">
                  #{order.orderId}
                  {/* On narrow screens the customer and date columns are hidden, so show them here. */}
                  <span className="block truncate text-xs font-normal text-zinc-500 sm:hidden">
                    {order.customerEmail}
                  </span>
                  <span className="block text-xs font-normal text-zinc-400 md:hidden">
                    {formatDateTime(order.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="hidden text-zinc-500 md:table-cell">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Link
                    to={paths.adminCustomer(order.userId)}
                    className="hover:underline hover:underline-offset-4"
                  >
                    {order.customerEmail}
                  </Link>
                </TableCell>
                <TableCell
                  className="hidden max-w-64 truncate text-zinc-500 lg:table-cell"
                  title={itemsSummary}
                >
                  {itemsSummary}
                </TableCell>
                <TableCell className="text-right">
                  <Price amount={order.totalAmount} />
                </TableCell>
                <TableCell>{renderStatus(order)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
