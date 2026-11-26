import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { PackageX, SearchX } from 'lucide-react'
import { categoryQueries } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { formatCount, PRODUCT_FORMS } from '@/lib/format'
import { filterProducts, getBrands } from './catalog-filters'
import { CatalogToolbar } from './CatalogToolbar'
import { buildCategoryOptions } from '@/lib/category-tree'
import { ProductGrid, ProductGridSkeleton } from './ProductGrid'
import { useCatalogFilters } from './use-catalog-filters'

export function CatalogPage() {
  const productsQuery = useQuery(productQueries.all())
  const categoriesQuery = useQuery(categoryQueries.all())
  const { filters, updateFilters, resetFilters } = useCatalogFilters()

  const products = productsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const visibleProducts = filterProducts(products, filters, categories)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Katalog</h1>
        {productsQuery.isSuccess && (
          <p className="text-sm text-zinc-500">
            {formatCount(visibleProducts.length, PRODUCT_FORMS)}
          </p>
        )}
      </header>

      <CatalogToolbar
        filters={filters}
        categoryOptions={buildCategoryOptions(categories)}
        brands={getBrands(products)}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      <CatalogResults
        productsQuery={productsQuery}
        visibleProducts={visibleProducts}
        onResetFilters={resetFilters}
      />
    </div>
  )
}

interface CatalogResultsProps {
  productsQuery: UseQueryResult<Product[]>
  visibleProducts: Product[]
  onResetFilters: () => void
}

function CatalogResults({ productsQuery, visibleProducts, onResetFilters }: CatalogResultsProps) {
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
  if (visibleProducts.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Brak pasujących produktów"
        description="Zmień kryteria wyszukiwania lub wyczyść filtry."
        action={
          <Button variant="outline" onClick={onResetFilters}>
            Wyczyść filtry
          </Button>
        }
        className="py-24"
      />
    )
  }
  return <ProductGrid products={visibleProducts} />
}
