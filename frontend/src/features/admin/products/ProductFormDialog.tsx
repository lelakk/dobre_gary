import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { categoryQueries } from '@/api/categories'
import { createProduct, productQueries, updateProduct } from '@/api/products'
import type { Product, ProductRequest } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { buildCategoryOptions } from '@/lib/category-tree'
import { showServerError } from '../form-errors'
import { FormField, FormServerError } from '../FormField'
import { CategoryCheckboxList } from './CategoryCheckboxList'
import {
  EMPTY_PRODUCT_FORM,
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
  toProductFormInput,
  toProductRequest,
} from './product-form'

const FORM_ID = 'product-form'

interface ProductFormDialogProps {
  /** Product to edit, or null to create a new one. */
  product: Product | null
  onClose: () => void
}

export function ProductFormDialog({ product, onClose }: ProductFormDialogProps) {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(categoryQueries.all())
  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toProductFormInput(product) : EMPTY_PRODUCT_FORM,
  })
  const { errors } = form.formState

  const saveMutation = useMutation({
    mutationFn: (request: ProductRequest) =>
      product ? updateProduct(product.productId, request) : createProduct(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueries.all().queryKey })
      onClose()
    },
    onError: (error) =>
      showServerError(form.setError, error, {
        field: 'sku',
        message: 'Produkt o tym kodzie SKU już istnieje.',
      }),
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Edytuj produkt' : 'Nowy produkt'}</DialogTitle>
          <DialogDescription>
            {product
              ? `Zmiany od razu będą widoczne w katalogu.`
              : 'Produkt pojawi się w katalogu z podanym stanem magazynowym.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(toProductRequest(values)))}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="product-sku" label="Kod SKU" error={errors.sku?.message}>
              <Input
                id="product-sku"
                {...form.register('sku')}
                aria-invalid={Boolean(errors.sku)}
              />
            </FormField>
            <FormField id="product-brand" label="Marka" error={errors.brand?.message}>
              <Input
                id="product-brand"
                {...form.register('brand')}
                aria-invalid={Boolean(errors.brand)}
              />
            </FormField>
          </div>

          <FormField id="product-name" label="Nazwa" error={errors.name?.message}>
            <Input
              id="product-name"
              {...form.register('name')}
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>

          <FormField id="product-description" label="Opis (opcjonalnie)">
            <Textarea id="product-description" rows={3} {...form.register('description')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="product-price" label="Cena (zł)" error={errors.basePrice?.message}>
              <Input
                id="product-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...form.register('basePrice', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.basePrice)}
              />
            </FormField>
            <FormField
              id="product-quantity"
              label="Stan magazynowy (szt.)"
              error={errors.quantity?.message}
            >
              <Input
                id="product-quantity"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                {...form.register('quantity', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.quantity)}
              />
            </FormField>
          </div>

          <Controller
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <CategoryCheckboxList
                options={buildCategoryOptions(categoriesQuery.data ?? [])}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <FormServerError message={errors.root?.server?.message} />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Spinner />}
            {product ? 'Zapisz zmiany' : 'Dodaj produkt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
