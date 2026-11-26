import { useQueryClient } from '@tanstack/react-query'
import { deleteProduct, productQueries } from '@/api/products'
import type { Product } from '@/api/types'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'

interface DeleteProductDialogProps {
  product: Product
  onClose: () => void
}

export function DeleteProductDialog({ product, onClose }: DeleteProductDialogProps) {
  const queryClient = useQueryClient()

  return (
    <ConfirmDeleteDialog
      title="Usunąć produkt?"
      description={
        // order_items.product_id is ON DELETE CASCADE in schema.sql; update this warning if the
        // rule changes (e.g. to RESTRICT, which would make the backend reject the deletion).
        <>
          Produkt <strong>{product.name}</strong> ({product.sku}) zostanie usunięty razem ze stanem
          magazynowym i zniknie z pozycji złożonych wcześniej zamówień. Tej operacji nie można
          cofnąć.
        </>
      }
      onConfirm={async () => {
        await deleteProduct(product.productId)
        await queryClient.invalidateQueries({ queryKey: productQueries.all().queryKey })
      }}
      onClose={onClose}
    />
  )
}
