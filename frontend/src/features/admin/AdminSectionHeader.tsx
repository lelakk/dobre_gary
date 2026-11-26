import type { ReactNode } from 'react'

interface AdminSectionHeaderProps {
  title: string
  /** e.g. "50 produktów"; hidden while the data is loading. */
  summary?: string
  /** Primary action of the section, e.g. an "add" button. */
  action?: ReactNode
}

export function AdminSectionHeader({ title, summary, action }: AdminSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {summary && <p className="text-sm text-zinc-500">{summary}</p>}
      </div>
      {action}
    </div>
  )
}
