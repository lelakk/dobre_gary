import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryQueries, deleteCategory } from '@/api/categories'
import { productQueries } from '@/api/products'
import type { Category } from '@/api/types'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { describeCategoryDeletion } from './category-deletion'

interface DeleteCategoryDialogProps {
  category: Category
  onClose: () => void
}

export function DeleteCategoryDialog({ category, onClose }: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(categoryQueries.all())
  const productsQuery = useQuery(productQueries.all())

  return (
    <ConfirmDeleteDialog
      title="Usunąć kategorię?"
      description={describeCategoryDeletion(
        category,
        categoriesQuery.data ?? [],
        productsQuery.data ?? [],
      )}
      onConfirm={async () => {
        await deleteCategory(category.categoryId)
        // Subcategories change their parent and products lose the category.
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: categoryQueries.all().queryKey }),
          queryClient.invalidateQueries({ queryKey: productQueries.all().queryKey }),
        ])
      }}
      onClose={onClose}
    />
  )
}
