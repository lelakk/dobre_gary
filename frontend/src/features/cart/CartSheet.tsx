import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { EmptyState } from '@/components/EmptyState'
import { Price } from '@/components/Price'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCount, PRODUCT_FORMS } from '@/lib/format'
import { CartItemRow } from './CartItemRow'
import { useCart, useCartDrawer, useCartItems } from './use-cart'

export function CartSheet() {
  const { isOpen, setOpen } = useCartDrawer()
  const { totalQuantity } = useCart()
  const close = () => setOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-zinc-200">
          <SheetTitle>Koszyk</SheetTitle>
          <SheetDescription>{formatCount(totalQuantity, PRODUCT_FORMS)}</SheetDescription>
        </SheetHeader>
        <CartContents onNavigate={close} />
      </SheetContent>
    </Sheet>
  )
}

function CartContents({ onNavigate }: { onNavigate: () => void }) {
  const { lines, items, subtotal, productsQuery } = useCartItems()

  if (lines.length === 0) {
    return <EmptyCart onNavigate={onNavigate} />
  }
  if (productsQuery.isPending) {
    return <CartItemsSkeleton count={lines.length} />
  }
  if (productsQuery.isError) {
    return (
      <div className="p-4">
        <QueryErrorAlert
          title="Nie udało się wczytać koszyka"
          error={productsQuery.error}
          onRetry={() => productsQuery.refetch()}
        />
      </div>
    )
  }
  if (items.length === 0) {
    return <EmptyCart onNavigate={onNavigate} />
  }

  return (
    <>
      <ul className="flex-1 divide-y divide-zinc-200 overflow-y-auto px-4">
        {items.map((item) => (
          <CartItemRow key={item.product.productId} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
      <SheetFooter className="border-t border-zinc-200">
        <div className="flex items-center justify-between text-base font-medium">
          <span>Suma</span>
          <Price amount={subtotal} />
        </div>
        <Button asChild size="lg">
          <Link to={paths.checkout} onClick={onNavigate}>
            Przejdź do kasy
          </Link>
        </Button>
      </SheetFooter>
    </>
  )
}

function EmptyCart({ onNavigate }: { onNavigate: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Twój koszyk jest pusty"
      description="Dodaj produkty z katalogu, a pojawią się tutaj."
      action={
        <Button asChild variant="outline">
          <Link to={paths.catalog} onClick={onNavigate}>
            Przeglądaj katalog
          </Link>
        </Button>
      }
    />
  )
}

function CartItemsSkeleton({ count }: { count: number }) {
  return (
    <ul className="flex-1 divide-y divide-zinc-200 px-4" aria-busy aria-label="Ładowanie koszyka">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex gap-4 py-4">
          <Skeleton className="size-20 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}
