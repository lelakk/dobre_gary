import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { categoryQueries } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Category, Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { SearchInput } from '@/components/SearchInput'
import { formatCount, PRODUCT_FORMS } from '@/lib/format'
import { matchesSearchTerm } from '@/lib/search'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { ProductsTable } from './ProductsTable'

const bySku = (a: Product, b: Product) => a.sku.localeCompare(b.sku)

export function ProductsAdminPage() {
  const productsQuery = useQuery(productQueries.all())
  const categoriesQuery = useQuery(categoryQueries.all())
  const [search, setSearch] = useState('')

  const visibleProducts = (productsQuery.data ?? [])
    .filter((product) => matchesSearchTerm([product.sku, product.name, product.brand], search))
    .toSorted(bySku)

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Produkty"
        summary={productsQuery.data && formatCount(productsQuery.data.length, PRODUCT_FORMS)}
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
      />
    </section>
  )
}

interface ProductsContentProps {
  productsQuery: UseQueryResult<Product[]>
  visibleProducts: Product[]
  categories: Category[]
}

function ProductsContent({ productsQuery, visibleProducts, categories }: ProductsContentProps) {
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
  return <ProductsTable products={visibleProducts} categories={categories} />
}
