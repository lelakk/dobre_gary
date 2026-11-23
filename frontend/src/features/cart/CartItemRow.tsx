import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { QuantityStepper } from '@/components/QuantityStepper'
import { Button } from '@/components/ui/button'
import { type CartItem, exceedsStock, getLineTotal } from './cart-items'
import { useCart } from './use-cart'

interface CartItemRowProps {
  item: CartItem
  /** Called when the shopper follows a link out of the cart (e.g. to close the drawer). */
  onNavigate: () => void
}

export function CartItemRow({ item, onNavigate }: CartItemRowProps) {
  const { setItemQuantity, removeItem } = useCart()
  const { product, quantity } = item
  const productPath = paths.product(product.productId)

  return (
    <li className="flex gap-4 py-4">
      <Link
        to={productPath}
        onClick={onNavigate}
        className="shrink-0 self-start overflow-hidden rounded-md border border-zinc-200"
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage sku={product.sku} name={product.name} className="size-20" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={productPath}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium hover:underline hover:underline-offset-4"
          >
            {product.name}
          </Link>
          <Price amount={getLineTotal(item)} className="text-sm font-medium" />
        </div>
        <p className="text-xs text-zinc-500">
          <Price amount={product.basePrice} /> / szt.
        </p>
        {exceedsStock(item) && (
          <p className="text-xs text-destructive">
            {product.quantity === 0
              ? 'Produkt jest niedostępny.'
              : `Dostępne tylko ${product.quantity} szt.`}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper
            value={quantity}
            max={product.quantity}
            onChange={(next) => setItemQuantity(product, next)}
            label={`Ilość: ${product.name}`}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeItem(product.productId)}
            aria-label={`Usuń z koszyka: ${product.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  )
}
