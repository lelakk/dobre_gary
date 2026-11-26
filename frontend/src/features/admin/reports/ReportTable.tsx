import type { ReportCellValue, ReportRow } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  formatReportCellText,
  getReportRowKey,
  type ReportColumn,
  type ReportDefinition,
  ROOT_CATEGORY_SENTINEL,
} from './report-definitions'

const RESPONSIVE_VISIBILITY: Record<NonNullable<ReportColumn['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
}

interface ReportTableProps {
  definition: ReportDefinition
  rows: ReportRow[]
}

export function ReportTable({ definition, rows }: ReportTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            {definition.columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.align === 'right' && 'text-right',
                  column.hideBelow && RESPONSIVE_VISIBILITY[column.hideBelow],
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={getReportRowKey(definition, row, index)}>
              {definition.columns.map((column) => {
                const rawValue = row[column.key]
                return (
                  <TableCell
                    key={column.key}
                    className={cn(
                      column.align === 'right' && 'text-right tabular-nums',
                      column.format === 'mono' && 'font-mono text-xs',
                      column.format === 'orderId' && 'tabular-nums',
                      column.emphasize && 'font-medium whitespace-normal',
                      column.format === 'parentCategory' &&
                        rawValue === ROOT_CATEGORY_SENTINEL &&
                        'text-zinc-500',
                      column.hideBelow && RESPONSIVE_VISIBILITY[column.hideBelow],
                    )}
                  >
                    <ReportCell value={rawValue} column={column} />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ReportCell({ value, column }: { value: ReportCellValue; column: ReportColumn }) {
  const formatted = formatReportCellText(value, column.format)

  if (column.format === 'alertReason' && typeof value === 'string' && value !== '') {
    const variant = value === 'Niski stan magazynowy' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{formatted}</Badge>
  }

  return formatted
}
