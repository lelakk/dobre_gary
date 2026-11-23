import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { PackageX } from 'lucide-react'
import { productQueries } from '@/api/products'
import type { Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { formatCount } from '@/lib/format'
import { ProductGrid, ProductGridSkeleton } from './ProductGrid'

const PRODUCT_FORMS = { one: 'produkt', few: 'produkty', many: 'produktów' }

export function CatalogPage() {
  const productsQuery = useQuery(productQueries.all())

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Katalog</h1>
        {productsQuery.data && (
          <p className="text-sm text-zinc-500">
            {formatCount(productsQuery.data.length, PRODUCT_FORMS)}
          </p>
        )}
      </header>
      <CatalogResults productsQuery={productsQuery} />
    </div>
  )
}

function CatalogResults({ productsQuery }: { productsQuery: UseQueryResult<Product[]> }) {
  if (productsQuery.isPending) {
    return <ProductGridSkeleton />
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
  if (productsQuery.data.length === 0) {
    return <EmptyState icon={PackageX} title="Brak produktów w sklepie" className="py-24" />
  }
  return <ProductGrid products={productsQuery.data} />
}
