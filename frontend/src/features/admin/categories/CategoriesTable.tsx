import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CategoryRow } from './category-rows'

export function CategoriesTable({ rows }: { rows: CategoryRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead className="hidden sm:table-cell">Kategoria nadrzędna</TableHead>
            <TableHead className="text-right">Produkty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ category, depth, productCount }) => (
            <TableRow key={category.categoryId}>
              <TableCell
                className="font-medium whitespace-normal"
                // Indents subcategories under their parent.
                style={{ paddingInlineStart: `${0.5 + depth * 1.5}rem` }}
              >
                {depth > 0 && (
                  <span className="mr-1.5 text-zinc-300" aria-hidden>
                    └
                  </span>
                )}
                {category.name}
              </TableCell>
              <TableCell className="hidden text-zinc-500 sm:table-cell">
                {category.parentName ?? '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">{productCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
