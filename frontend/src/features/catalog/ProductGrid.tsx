import type { Product } from '@/api/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from './ProductCard'

const GRID_CLASSES = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4'
const SKELETON_CARD_COUNT = 8

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className={GRID_CLASSES}>
      {products.map((product) => (
        <li key={product.productId}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton() {
  return (
    <ul className={GRID_CLASSES} aria-busy aria-label="Ładowanie produktów">
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-1/4" />
        </li>
      ))}
    </ul>
  )
}
