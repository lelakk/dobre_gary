import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { categoryQueries, createCategory, updateCategory } from '@/api/categories'
import type { Category, CategoryRequest } from '@/api/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { showServerError } from '../form-errors'
import { FormField, FormServerError } from '../FormField'
import {
  type CategoryFormInput,
  type CategoryFormOutput,
  categoryFormSchema,
  EMPTY_CATEGORY_FORM,
  getParentOptions,
  toCategoryFormInput,
} from './category-form'

const FORM_ID = 'category-form'
/** Radix Select items cannot have an empty value, so "no parent" gets an explicit one. */
const NO_PARENT = 'none'

interface CategoryFormDialogProps {
  /** Category to edit, or null to create a new one. */
  category: Category | null
  onClose: () => void
}

export function CategoryFormDialog({ category, onClose }: CategoryFormDialogProps) {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(categoryQueries.all())
  const parentOptions = getParentOptions(categoriesQuery.data ?? [], category?.categoryId ?? null)
  const form = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category ? toCategoryFormInput(category) : EMPTY_CATEGORY_FORM,
  })
  const { errors } = form.formState

  const saveMutation = useMutation({
    mutationFn: (request: CategoryRequest) =>
      category ? updateCategory(category.categoryId, request) : createCategory(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueries.all().queryKey })
      onClose()
    },
    onError: (error) => showServerError(form.setError, error),
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edytuj kategorię' : 'Nowa kategoria'}</DialogTitle>
          <DialogDescription>
            Kategoria bez nadrzędnej jest kategorią główną w filtrze katalogu.
          </DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <FormField id="category-name" label="Nazwa" error={errors.name?.message}>
            <Input
              id="category-name"
              {...form.register('name')}
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>

          <FormField id="category-parent" label="Kategoria nadrzędna">
            <Controller
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Select
                  value={field.value === null ? NO_PARENT : String(field.value)}
                  onValueChange={(value) =>
                    field.onChange(value === NO_PARENT ? null : Number(value))
                  }
                >
                  <SelectTrigger id="category-parent" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value={NO_PARENT}>Brak (kategoria główna)</SelectItem>
                    {parentOptions.map(({ categoryId, name, depth }) => (
                      <SelectItem
                        key={categoryId}
                        value={String(categoryId)}
                        // Indents subcategories under their parent.
                        style={{ paddingInlineStart: `${0.625 + depth}rem` }}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormServerError message={errors.root?.server?.message} />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Spinner />}
            {category ? 'Zapisz zmiany' : 'Dodaj kategorię'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
