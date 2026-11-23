import { Package } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/** Product photos live in public/products and are named after the product SKU. */
function productImageUrl(sku: string): string {
  return `/products/${encodeURIComponent(sku)}.webp`
}

interface ProductImageProps {
  sku: string
  name: string
  className?: string
}

/** Product photo, falling back to a neutral placeholder when public/products/<SKU>.webp is missing. */
export function ProductImage({ sku, name, className }: ProductImageProps) {
  const src = productImageUrl(sku)
  // Remembering *which* src failed (instead of a boolean) resets the fallback when the SKU changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (failedSrc === src) {
    return <ProductImagePlaceholder sku={sku} className={className} />
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={cn('object-cover', className)}
    />
  )
}

function ProductImagePlaceholder({ sku, className }: { sku: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Brak zdjęcia produktu ${sku}`}
      className={cn(
        '@container flex flex-col items-center justify-center gap-2 bg-zinc-50 text-zinc-400',
        className,
      )}
    >
      <Package className="size-5 @[8rem]:size-8" strokeWidth={1.25} aria-hidden />
      <span className="hidden font-mono text-[11px] tracking-wide @[8rem]:block">{sku}</span>
    </div>
  )
}
