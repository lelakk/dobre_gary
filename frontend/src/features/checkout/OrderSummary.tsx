import type { Money } from '@/api/types'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type CartItem, getLineTotal } from '@/features/cart/cart-items'
import { useCart } from '@/features/cart/use-cart'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: Money
}

export function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  const { openCart } = useCart()

  return (
    <section className="flex flex-col gap-4" aria-labelledby="order-summary-title">
      <div className="flex items-center justify-between">
        <h2 id="order-summary-title" className="text-base font-medium">
          Podsumowanie
        </h2>
        <Button variant="link" className="h-auto p-0" onClick={openCart}>
          Edytuj koszyk
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.product.productId} className="flex items-center gap-3">
            <div className="shrink-0 overflow-hidden rounded-md border border-zinc-200">
              <ProductImage sku={item.product.sku} name={item.product.name} className="size-14" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.product.name}</p>
              <p className="text-xs text-zinc-500">
                <span className="tabular-nums">{item.quantity}</span> ×{' '}
                <Price amount={item.product.basePrice} />
              </p>
            </div>
            <Price amount={getLineTotal(item)} className="text-sm" />
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex items-center justify-between font-medium">
        <span>Do zapłaty</span>
        <Price amount={subtotal} className="text-lg" />
      </div>
    </section>
  )
}
