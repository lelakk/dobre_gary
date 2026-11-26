import { Spinner } from '@/components/ui/spinner'

/** Shown in place of a lazily loaded page while its code downloads on the first visit. */
export function PageLoadingFallback() {
  return (
    <div className="flex justify-center py-24 text-zinc-400" role="status">
      <Spinner className="size-6" />
      <span className="sr-only">Ładowanie strony</span>
    </div>
  )
}
