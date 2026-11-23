import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import type { Product } from '@/api/types'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { StockStatus } from '@/components/product/StockStatus'
import { Button } from '@/components/ui/button'
import { useAddToCart } from '@/features/cart/use-cart'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex h-full flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-zinc-200 transition-colors group-hover:border-zinc-300">
        <ProductImage sku={product.sku} name={product.name} className="aspect-square w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{product.brand}</p>
        <h3 className="text-sm leading-snug font-medium text-zinc-900">
          {/* The ::after overlay stretches the link over the whole card. */}
          <Link
            to={paths.product(product.productId)}
            className="group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price amount={product.basePrice} className="text-sm font-semibold text-zinc-900" />
          <QuickAddButton product={product} />
        </div>
        <StockStatus quantity={product.quantity} />
      </div>
    </article>
  )
}

function QuickAddButton({ product }: { product: Product }) {
  const { remainingStock, addToCart } = useAddToCart(product)

  return (
    <Button
      variant="outline"
      size="icon-sm"
      // Lifted above the card's stretched link so the click adds to cart instead of navigating.
      className="relative z-10"
      disabled={remainingStock === 0}
      onClick={() => addToCart()}
      aria-label={`Dodaj do koszyka: ${product.name}`}
    >
      <Plus />
    </Button>
  )
}
