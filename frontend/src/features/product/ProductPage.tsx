import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { ApiError } from '@/api/http'
import { productQueries } from '@/api/products'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { parseId } from '@/lib/parse'
import { ProductDetails } from './ProductDetails'

export function ProductPage() {
  const productId = parseId(useParams().productId)

  return (
    <div className="flex flex-col gap-8">
      <Link
        to={paths.catalog}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Katalog
      </Link>
      {productId === null ? <ProductNotFound /> : <ProductLoader productId={productId} />}
    </div>
  )
}

function ProductLoader({ productId }: { productId: number }) {
  const productQuery = useQuery(productQueries.detail(productId))

  if (productQuery.isPending) {
    return <ProductDetailsSkeleton />
  }
  if (productQuery.isError) {
    const isNotFound = productQuery.error instanceof ApiError && productQuery.error.status === 404
    return isNotFound ? (
      <ProductNotFound />
    ) : (
      <QueryErrorAlert
        title="Nie udało się wczytać produktu"
        error={productQuery.error}
        onRetry={() => productQuery.refetch()}
      />
    )
  }
  return <ProductDetails product={productQuery.data} />
}

function ProductNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Nie znaleziono produktu"
      description="Produkt mógł zostać usunięty z oferty."
      action={
        <Button asChild variant="outline">
          <Link to={paths.catalog}>Wróć do katalogu</Link>
        </Button>
      }
      className="py-24"
    />
  )
}

function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-16" aria-busy aria-label="Ładowanie produktu">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
