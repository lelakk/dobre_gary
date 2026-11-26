import type { ReactNode } from 'react'
import type { Category, Product } from '@/api/types'
import { Price } from '@/components/Price'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { findCategoryNames } from '@/lib/category-tree'
import { cn } from '@/lib/utils'

/** Secondary columns hidden on phones, so the row actions stay on screen. */
const WIDE_SCREEN_ONLY = 'hidden md:table-cell'

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  /** Buttons shown at the end of each row (edit, delete). */
  renderActions: (product: Product) => ReactNode
}

export function ProductsTable({ products, categories, renderActions }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">SKU</TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Marka</TableHead>
            <TableHead className="text-right">Cena</TableHead>
            <TableHead className="text-right">Stan</TableHead>
            <TableHead className={WIDE_SCREEN_ONLY}>Kategorie</TableHead>
            <TableHead>
              <span className="sr-only">Akcje</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const categoryNames = findCategoryNames(categories, product.categoryIds).join(', ')
            return (
              <TableRow key={product.productId}>
                <TableCell className="hidden font-mono text-xs sm:table-cell">
                  {product.sku}
                </TableCell>
                <TableCell className="font-medium whitespace-normal">
                  {product.name}
                  {/* On phones the SKU column is hidden, so the SKU goes under the name. */}
                  <span className="block font-mono text-xs font-normal text-zinc-500 sm:hidden">
                    {product.sku}
                  </span>
                </TableCell>
                <TableCell className={WIDE_SCREEN_ONLY}>{product.brand}</TableCell>
                <TableCell className="text-right">
                  <Price amount={product.basePrice} />
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    product.quantity === 0 && 'text-destructive',
                  )}
                >
                  {product.quantity}
                </TableCell>
                <TableCell
                  className={cn(WIDE_SCREEN_ONLY, 'max-w-56 truncate text-zinc-500')}
                  title={categoryNames}
                >
                  {categoryNames || '—'}
                </TableCell>
                <TableCell className="text-right">{renderActions(product)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
