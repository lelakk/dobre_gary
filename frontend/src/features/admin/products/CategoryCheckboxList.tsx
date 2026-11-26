import { Checkbox } from '@/components/ui/checkbox'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import type { CategoryOption } from '@/lib/category-tree'

interface CategoryCheckboxListProps {
  options: CategoryOption[]
  value: number[]
  onChange: (categoryIds: number[]) => void
}

/** Multi-select of categories, indented to show the category tree. */
export function CategoryCheckboxList({ options, value, onChange }: CategoryCheckboxListProps) {
  const toggle = (categoryId: number, checked: boolean) =>
    onChange(checked ? [...value, categoryId] : value.filter((id) => id !== categoryId))

  return (
    <FieldSet>
      <FieldLegend variant="label">Kategorie</FieldLegend>
      <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 p-1">
        {options.map(({ categoryId, name, depth }) => (
          <label
            key={categoryId}
            className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-sm hover:bg-zinc-50"
            // Indents subcategories under their parent.
            style={{ paddingInlineStart: `${0.5 + depth * 1.25}rem` }}
          >
            <Checkbox
              checked={value.includes(categoryId)}
              onCheckedChange={(checked) => toggle(categoryId, checked === true)}
            />
            {name}
          </label>
        ))}
      </div>
    </FieldSet>
  )
}
