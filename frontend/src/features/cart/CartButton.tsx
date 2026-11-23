import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCount, PRODUCT_FORMS } from '@/lib/format'
import { useCart } from './use-cart'

export function CartButton() {
  const { totalQuantity, setOpen } = useCart()

  return (
    <Button
      variant="ghost"
      onClick={() => setOpen(true)}
      aria-label={`Koszyk: ${formatCount(totalQuantity, PRODUCT_FORMS)}`}
    >
      <ShoppingBag />
      <span className="hidden sm:inline">Koszyk</span>
      {totalQuantity > 0 && (
        <span className="min-w-5 rounded-full bg-zinc-900 px-1.5 text-xs leading-5 text-white tabular-nums">
          {totalQuantity}
        </span>
      )}
    </Button>
  )
}
