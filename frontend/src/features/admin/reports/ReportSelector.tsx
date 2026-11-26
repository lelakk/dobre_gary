import type { ReportId } from '@/api/types'
import { cn } from '@/lib/utils'
import { REPORT_DEFINITIONS } from './report-definitions'

interface ReportSelectorProps {
  selectedId: ReportId
  onSelect: (reportId: ReportId) => void
}

export function ReportSelector({ selectedId, onSelect }: ReportSelectorProps) {
  return (
    <div role="group" aria-label="Wybór raportu" className="flex flex-wrap gap-1.5">
      {REPORT_DEFINITIONS.map((report) => {
        const isSelected = report.id === selectedId
        return (
          <button
            key={report.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(report.id)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
            )}
          >
            {report.title}
          </button>
        )
      })}
    </div>
  )
}
