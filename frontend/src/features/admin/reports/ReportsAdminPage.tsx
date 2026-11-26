import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { BarChart3, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { REPORT_ENDPOINTS, reportQueries } from '@/api/reports'
import type { ReportId, ReportRow } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { QueryErrorAlert } from '@/components/QueryErrorAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCount, RESULT_FORMS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AdminSectionHeader } from '../AdminSectionHeader'
import { TableSkeleton } from '../TableSkeleton'
import {
  getReportDefinition,
  REPORT_PARAM,
  type ReportDefinition,
  resolveReportId,
} from './report-definitions'
import { ReportSelector } from './ReportSelector'
import { ReportTable } from './ReportTable'

export function ReportsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const reportId = resolveReportId(searchParams.get(REPORT_PARAM))
  const definition = getReportDefinition(reportId)
  const reportQuery = useQuery(reportQueries.byId(reportId))

  const handleSelectReport = (nextId: ReportId) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(REPORT_PARAM, nextId)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <section className="flex flex-col gap-5">
      <AdminSectionHeader
        title="Raporty"
        summary="9 zapytań analitycznych z queries.sql oraz widok v_product_stock_summary"
      />

      <ReportSelector selectedId={reportId} onSelect={handleSelectReport} />

      <div className="flex flex-col gap-4">
        <ReportHeader definition={definition} reportQuery={reportQuery} />
        <ReportContent definition={definition} reportQuery={reportQuery} />
      </div>
    </section>
  )
}

interface ReportHeaderProps {
  definition: ReportDefinition
  reportQuery: UseQueryResult<ReportRow[]>
}

function ReportHeader({ definition, reportQuery }: ReportHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/70 px-4 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight">{definition.title}</h3>
          <Badge variant="secondary">{definition.source}</Badge>
          <code className="font-mono text-xs text-zinc-500">
            /api{REPORT_ENDPOINTS[definition.id]}
          </code>
        </div>
        <p className="text-sm text-zinc-600">{definition.description}</p>
      </div>

      <div className="flex items-center gap-3">
        {reportQuery.data && (
          <span className="text-sm text-zinc-500 tabular-nums">
            {formatCount(reportQuery.data.length, RESULT_FORMS)}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => reportQuery.refetch()}
          disabled={reportQuery.isFetching}
        >
          <RefreshCw className={cn(reportQuery.isFetching && 'animate-spin')} />
          Odśwież
        </Button>
      </div>
    </div>
  )
}

interface ReportContentProps {
  definition: ReportDefinition
  reportQuery: UseQueryResult<ReportRow[]>
}

function ReportContent({ definition, reportQuery }: ReportContentProps) {
  if (reportQuery.isPending) {
    return <TableSkeleton label={`Ładowanie raportu: ${definition.title}`} />
  }
  if (reportQuery.isError) {
    return (
      <QueryErrorAlert
        title={`Nie udało się wczytać raportu „${definition.title}”`}
        error={reportQuery.error}
        onRetry={() => reportQuery.refetch()}
      />
    )
  }
  if (reportQuery.data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Brak wyników dla tego raportu"
        description="Zapytanie nie zwróciło żadnych rekordów dla obecnego stanu bazy."
        className="py-16"
      />
    )
  }
  return <ReportTable definition={definition} rows={reportQuery.data} />
}
