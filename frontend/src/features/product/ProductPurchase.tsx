import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/api/types'
import { QuantityStepper } from '@/components/QuantityStepper'
import { Button } from '@/components/ui/button'
import { useAddToCart } from '@/features/cart/use-cart'

export function ProductPurchase({ product }: { product: Product }) {
  const { quantityInCart, remainingStock, addToCart } = useAddToCart(product)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  if (product.quantity === 0) {
    return (
      <Button size="lg" disabled>
        Produkt niedostępny
      </Button>
    )
  }

  // The stock or the cart may change after the quantity was picked, so keep it within bounds.
  const quantity = Math.min(selectedQuantity, Math.max(remainingStock, 1))
  const canAdd = remainingStock > 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <QuantityStepper
          value={quantity}
          max={remainingStock}
          onChange={setSelectedQuantity}
          label="Ilość"
          disabled={!canAdd}
          className="h-9"
        />
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAdd}
          onClick={() => {
            addToCart(quantity)
            setSelectedQuantity(1)
          }}
        >
          <ShoppingBag />
          Dodaj do koszyka
        </Button>
      </div>
      {quantityInCart > 0 && (
        <p className="text-sm text-zinc-500">
          W koszyku: <span className="tabular-nums">{quantityInCart}</span> szt.
          {!canAdd && ' To cała dostępna ilość.'}
        </p>
      )}
    </div>
  )
}
