import { cn } from '@/lib/utils'
import { getStockLevel, type StockLevel } from './stock'

const DOT_COLORS: Record<StockLevel, string> = {
  'in-stock': 'bg-emerald-500',
  'low-stock': 'bg-amber-500',
  'out-of-stock': 'bg-zinc-300',
}

function describeStock(level: StockLevel, quantity: number): string {
  switch (level) {
    case 'in-stock':
      return 'Dostępny'
    case 'low-stock':
      return `Ostatnie ${quantity} szt.`
    case 'out-of-stock':
      return 'Niedostępny'
  }
}

interface StockStatusProps {
  quantity: number
  className?: string
}

export function StockStatus({ quantity, className }: StockStatusProps) {
  const level = getStockLevel(quantity)
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-zinc-600', className)}>
      <span className={cn('size-1.5 rounded-full', DOT_COLORS[level])} aria-hidden />
      {describeStock(level, quantity)}
    </span>
  )
}
