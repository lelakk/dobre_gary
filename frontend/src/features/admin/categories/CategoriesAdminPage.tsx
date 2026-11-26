import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Pencil, Plus, Tags } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { categoryQueries } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Category, Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { CATEGORY_FORMS, formatCount } from '@/lib/format'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import { CategoriesTable } from './CategoriesTable'
import { CategoryFormDialog } from './CategoryFormDialog'
import { buildCategoryRows } from './category-rows'

/** The dialog currently open on the page, if any. */
type OpenDialog = { kind: 'create' } | { kind: 'edit'; category: Category } | null

export function CategoriesAdminPage() {
  const categoriesQuery = useQuery(categoryQueries.all())
  const productsQuery = useQuery(productQueries.all())
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const closeDialog = () => setOpenDialog(null)

  return (
    <section className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Kategorie"
        summary={categoriesQuery.data && formatCount(categoriesQuery.data.length, CATEGORY_FORMS)}
        action={
          <Button onClick={() => setOpenDialog({ kind: 'create' })}>
            <Plus />
            Dodaj kategorię
          </Button>
        }
      />
      <CategoriesContent
        categoriesQuery={categoriesQuery}
        products={productsQuery.data ?? []}
        renderActions={(category) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpenDialog({ kind: 'edit', category })}
            aria-label={`Edytuj: ${category.name}`}
          >
            <Pencil />
          </Button>
        )}
      />

      {openDialog?.kind === 'create' && (
        <CategoryFormDialog category={null} onClose={closeDialog} />
      )}
      {openDialog?.kind === 'edit' && (
        <CategoryFormDialog category={openDialog.category} onClose={closeDialog} />
      )}
    </section>
  )
}

interface CategoriesContentProps {
  categoriesQuery: UseQueryResult<Category[]>
  products: Product[]
  renderActions: (category: Category) => ReactNode
}

function CategoriesContent({ categoriesQuery, products, renderActions }: CategoriesContentProps) {
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
  return (
    <CategoriesTable
      rows={buildCategoryRows(categoriesQuery.data, products)}
      renderActions={renderActions}
    />
  )
}
