import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Tags } from 'lucide-react'
import { categoryQueries } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Category, Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { CATEGORY_FORMS, formatCount } from '@/lib/format'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { CategoriesTable } from './CategoriesTable'
import { buildCategoryRows } from './category-rows'

export function CategoriesAdminPage() {
  const categoriesQuery = useQuery(categoryQueries.all())
  const productsQuery = useQuery(productQueries.all())

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Kategorie"
        summary={categoriesQuery.data && formatCount(categoriesQuery.data.length, CATEGORY_FORMS)}
      />
      <CategoriesContent categoriesQuery={categoriesQuery} products={productsQuery.data ?? []} />
    </section>
  )
}

interface CategoriesContentProps {
  categoriesQuery: UseQueryResult<Category[]>
  products: Product[]
}

function CategoriesContent({ categoriesQuery, products }: CategoriesContentProps) {
  if (categoriesQuery.isPending) {
    return <TableSkeleton label="Ładowanie kategorii" />
  }
  if (categoriesQuery.isError) {
    return (
      <QueryErrorAlert
        title="Nie udało się wczytać kategorii"
        error={categoriesQuery.error}
        onRetry={() => categoriesQuery.refetch()}
      />
    )
  }
  if (categoriesQuery.data.length === 0) {
    return <EmptyState icon={Tags} title="Brak kategorii" className="py-16" />
  }
  return <CategoriesTable rows={buildCategoryRows(categoriesQuery.data, products)} />
}
