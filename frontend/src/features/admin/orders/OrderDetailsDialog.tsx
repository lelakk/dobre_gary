import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import type { Address, Order, OrderStatus } from '@/api/types'
import { userQueries } from '@/api/users'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatAddress, formatDateTime } from '@/lib/format'
import { multiplyPrice } from '@/lib/money'
import { OrderStatusSelect } from './OrderStatusSelect'

interface OrderDetailsDialogProps {
  order: Order
  isUpdatingStatus: boolean
  statusError: string | null
  onStatusChange: (nextStatus: OrderStatus) => void
  onClose: () => void
}

function resolveAddressText(addresses: Address[] | undefined, addressId: number): string {
  const match = addresses?.find((address) => address.addressId === addressId)
  return match ? formatAddress(match) : `Adres #${addressId}`
}

export function OrderDetailsDialog({
  order,
  isUpdatingStatus,
  statusError,
  onStatusChange,
  onClose,
}: OrderDetailsDialogProps) {
  const addressesQuery = useQuery(userQueries.addresses(order.userId))
  const sameAddress = order.shippingAddressId === order.billingAddressId

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Zamówienie nr <span className="tabular-nums">#{order.orderId}</span>
          </DialogTitle>
          <DialogDescription>
            {formatDateTime(order.createdAt)} ·{' '}
            <Link
              to={paths.adminCustomer(order.userId)}
              onClick={onClose}
              className="text-zinc-900 underline underline-offset-4"
            >
              {order.customerEmail}
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-700">Status zamówienia</span>
              <OrderStatusSelect
                orderId={order.orderId}
                value={order.orderStatus}
                isUpdating={isUpdatingStatus}
                onChange={onStatusChange}
              />
            </div>
            {statusError && (
              <p role="alert" className="text-xs text-destructive">
                {statusError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Pozycje</h3>
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.orderItemId} className="flex items-center gap-3">
                  <div className="shrink-0 overflow-hidden rounded-md border border-zinc-200">
                    <ProductImage
                      sku={item.productSku}
                      name={item.productName}
                      className="size-11"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-zinc-500">
                      <span className="font-mono">{item.productSku}</span> ·{' '}
                      <span className="tabular-nums">{item.quantity}</span> ×{' '}
                      <Price amount={item.unitPrice} />
                    </p>
                  </div>
                  <Price
                    amount={multiplyPrice(item.unitPrice, item.quantity)}
                    className="text-sm"
                  />
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-medium">
            <span>Razem</span>
            <Price amount={order.totalAmount} />
          </div>

          <Separator />

          <dl className="flex flex-col gap-2 text-sm">
            {sameAddress ? (
              <div>
                <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Adres dostawy i rozliczeniowy
                </dt>
                <dd className="mt-0.5 text-zinc-700">
                  {resolveAddressText(addressesQuery.data, order.shippingAddressId)}
                </dd>
              </div>
            ) : (
              <>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Adres dostawy
                  </dt>
                  <dd className="mt-0.5 text-zinc-700">
                    {resolveAddressText(addressesQuery.data, order.shippingAddressId)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Adres rozliczeniowy
                  </dt>
                  <dd className="mt-0.5 text-zinc-700">
                    {resolveAddressText(addressesQuery.data, order.billingAddressId)}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zamknij</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
