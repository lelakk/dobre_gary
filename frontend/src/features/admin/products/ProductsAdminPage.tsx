import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Pencil, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { categoryQueries } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Category, Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { formatCount, PRODUCT_FORMS } from '@/lib/format'
import { matchesSearchTerm } from '@/lib/search'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductsTable } from './ProductsTable'

/** The dialog currently open on the page, if any. */
type OpenDialog = { kind: 'create' } | { kind: 'edit'; product: Product } | null

const bySku = (a: Product, b: Product) => a.sku.localeCompare(b.sku)

export function ProductsAdminPage() {
  const productsQuery = useQuery(productQueries.all())
  const categoriesQuery = useQuery(categoryQueries.all())
  const [search, setSearch] = useState('')
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const closeDialog = () => setOpenDialog(null)

  const visibleProducts = (productsQuery.data ?? [])
    .filter((product) => matchesSearchTerm([product.sku, product.name, product.brand], search))
    .toSorted(bySku)

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Produkty"
        summary={productsQuery.data && formatCount(productsQuery.data.length, PRODUCT_FORMS)}
        action={
          <Button onClick={() => setOpenDialog({ kind: 'create' })}>
            <Plus />
            Dodaj produkt
          </Button>
        }
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Szukaj po SKU, nazwie lub marce"
        label="Szukaj produktów"
        className="max-w-md"
      />
      <ProductsContent
        productsQuery={productsQuery}
        visibleProducts={visibleProducts}
        categories={categoriesQuery.data ?? []}
        renderActions={(product) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpenDialog({ kind: 'edit', product })}
            aria-label={`Edytuj: ${product.name}`}
          >
            <Pencil />
          </Button>
        )}
      />

      {openDialog?.kind === 'create' && <ProductFormDialog product={null} onClose={closeDialog} />}
      {openDialog?.kind === 'edit' && (
        <ProductFormDialog product={openDialog.product} onClose={closeDialog} />
      )}
    </section>
  )
}

interface ProductsContentProps {
  productsQuery: UseQueryResult<Product[]>
  visibleProducts: Product[]
  categories: Category[]
  renderActions: (product: Product) => React.ReactNode
}

function ProductsContent({
  productsQuery,
  visibleProducts,
  categories,
  renderActions,
}: ProductsContentProps) {
  if (productsQuery.isPending) {
    return <TableSkeleton label="Ładowanie produktów" />
  }
  if (productsQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać produktów"
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
      />
    )
  }
  if (visibleProducts.length === 0) {
    return <EmptyState icon={SearchX} title="Brak produktów" className="py-16" />
  }
  return (
    <ProductsTable
      products={visibleProducts}
      categories={categories}
      renderActions={renderActions}
    />
  )
}
