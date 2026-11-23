import type { ComponentProps } from 'react'
import type { Money } from '@/api/types'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PriceProps extends ComponentProps<'span'> {
  amount: Money
}

/** Price in PLN rendered with tabular figures, so amounts line up in lists and summaries. */
export function Price({ amount, className, ...props }: PriceProps) {
  return (
    <span className={cn('tabular-nums', className)} {...props}>
      {formatPrice(amount)}
    </span>
  )
}
