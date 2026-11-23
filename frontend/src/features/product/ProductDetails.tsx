import { useQuery } from '@tanstack/react-query'
import { categoryQueries } from '@/api/categories'
import type { Category, Product } from '@/api/types'
import { Price } from '@/components/Price'
import { ProductImage } from '@/components/product/ProductImage'
import { StockStatus } from '@/components/product/StockStatus'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductPurchase } from './ProductPurchase'

export function ProductDetails({ product }: { product: Product }) {
  return (
    <article className="grid gap-10 md:grid-cols-2 lg:gap-16">
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <ProductImage sku={product.sku} name={product.name} className="aspect-square w-full" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            {product.brand}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{product.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Price amount={product.basePrice} className="text-2xl font-semibold" />
          <StockStatus quantity={product.quantity} className="text-sm" />
        </div>

        <ProductVariants />
        <ProductPurchase product={product} />

        <Separator />

        <ProductDescription description={product.description} />
        <ProductSpecs product={product} />
      </div>
    </article>
  )
}

// TODO: Variant selection (e.g. size or colour). The database schema has no product variants
//  table and ProductResponse exposes none – replace this placeholder once the backend supports them.
function ProductVariants() {
  return (
    <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500">
      Ten produkt występuje w jednym wariancie.
    </p>
  )
}

function ProductDescription({ description }: { description: string | null }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Opis</h2>
      <p className="text-sm leading-relaxed text-zinc-600">
        {description ?? 'Ten produkt nie ma jeszcze opisu.'}
      </p>
    </section>
  )
}

function ProductSpecs({ product }: { product: Product }) {
  const categoriesQuery = useQuery(categoryQueries.all())
  const categoryNames = findCategoryNames(categoriesQuery.data ?? [], product.categoryIds)

  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
      <dt className="text-zinc-500">Kod SKU</dt>
      <dd className="font-mono text-zinc-900">{product.sku}</dd>
      <dt className="text-zinc-500">Marka</dt>
      <dd className="text-zinc-900">{product.brand}</dd>
      {categoryNames.length > 0 && (
        <>
          <dt className="text-zinc-500">Kategorie</dt>
          <dd className="flex flex-wrap gap-1.5">
            {categoryNames.map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </dd>
        </>
      )}
    </dl>
  )
}

function findCategoryNames(categories: Category[], categoryIds: number[]): string[] {
  return categories
    .filter((category) => categoryIds.includes(category.categoryId))
    .map((category) => category.name)
}
