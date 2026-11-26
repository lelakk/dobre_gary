import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_ROWS = 6

export function TableSkeleton({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
      aria-busy
      aria-label={label}
    >
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  )
}
