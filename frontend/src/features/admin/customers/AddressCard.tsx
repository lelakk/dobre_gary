import type { ReactNode } from 'react'
import type { Address } from '@/api/types'

interface AddressCardProps {
  address: Address
  /** Buttons shown in the card's corner (edit, delete). */
  actions?: ReactNode
}

export function AddressCard({ address, actions }: AddressCardProps) {
  return (
    <article className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4">
      <address className="flex flex-col gap-0.5 text-sm not-italic">
        <span className="font-medium text-zinc-900">{address.recipientName}</span>
        <span>{address.streetLine1}</span>
        {address.streetLine2 && <span>{address.streetLine2}</span>}
        <span>
          {address.postalCode} {address.city}
        </span>
        <span className="text-zinc-500">woj. {address.stateProvince.toLocaleLowerCase('pl')}</span>
      </address>
      {actions}
    </article>
  )
}
