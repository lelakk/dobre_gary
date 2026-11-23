import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MIN_QUANTITY = 1

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (value: number) => void
  /** Accessible name of the control, e.g. "Ilość: Garnek żeliwny 4L". */
  label: string
  disabled?: boolean
  className?: string
}

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  disabled = false,
  className,
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex h-8 items-center rounded-lg border border-zinc-200', className)}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= MIN_QUANTITY}
        aria-label="Zmniejsz ilość"
      >
        <Minus />
      </Button>
      <output className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Zwiększ ilość"
      >
        <Plus />
      </Button>
    </div>
  )
}
