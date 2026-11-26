import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type CatalogFilters,
  hasActiveFilters,
  isSortOption,
  SORT_OPTIONS,
  type SortOption,
} from './catalog-filters'
import type { CategoryOption } from '@/lib/category-tree'

/** Radix Select items cannot have an empty value, so "no filter" gets an explicit one. */
const ALL = 'all'

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Najnowsze',
  'price-asc': 'Cena: od najniższej',
  'price-desc': 'Cena: od najwyższej',
  'name-asc': 'Nazwa: A–Z',
}

interface CatalogToolbarProps {
  filters: CatalogFilters
  categoryOptions: CategoryOption[]
  brands: string[]
  onChange: (changes: Partial<CatalogFilters>) => void
  onReset: () => void
}

export function CatalogToolbar({
  filters,
  categoryOptions,
  brands,
  onChange,
  onReset,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={filters.search}
        onChange={(search) => onChange({ search })}
        placeholder="Szukaj po nazwie, marce lub kodzie SKU"
        label="Szukaj produktów"
      />
      <div className="flex flex-wrap items-center gap-2">
        <CategoryFilter
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(categoryId) => onChange({ categoryId })}
        />
        <BrandFilter
          brands={brands}
          value={filters.brand}
          onChange={(brand) => onChange({ brand })}
        />
        <InStockFilter
          checked={filters.inStockOnly}
          onChange={(inStockOnly) => onChange({ inStockOnly })}
        />
        {hasActiveFilters(filters) && (
          <Button variant="ghost" onClick={onReset}>
            Wyczyść filtry
          </Button>
        )}
        <SortSelect value={filters.sort} onChange={(sort) => onChange({ sort })} />
      </div>
    </div>
  )
}

interface ControlProps<T> {
  value: T
  onChange: (value: T) => void
}

function CategoryFilter({
  options,
  value,
  onChange,
}: ControlProps<number | null> & { options: CategoryOption[] }) {
  return (
    <Select
      value={value === null ? ALL : String(value)}
      onValueChange={(selected) => onChange(selected === ALL ? null : Number(selected))}
    >
      <SelectTrigger aria-label="Kategoria">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>Wszystkie kategorie</SelectItem>
        {options.map(({ categoryId, name, depth }) => (
          <SelectItem
            key={categoryId}
            value={String(categoryId)}
            // Indents subcategories under their parent.
            style={{ paddingInlineStart: `${0.625 + depth}rem` }}
          >
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function BrandFilter({
  brands,
  value,
  onChange,
}: ControlProps<string | null> & { brands: string[] }) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(selected) => onChange(selected === ALL ? null : selected)}
    >
      <SelectTrigger aria-label="Marka">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>Wszystkie marki</SelectItem>
        {brands.map((brand) => (
          <SelectItem key={brand} value={brand}>
            {brand}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function InStockFilter({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Label className="h-8 cursor-pointer rounded-lg border border-zinc-200 px-2.5 font-normal">
      <Checkbox checked={checked} onCheckedChange={(state) => onChange(state === true)} />
      Tylko dostępne
    </Label>
  )
}

function SortSelect({ value, onChange }: ControlProps<SortOption>) {
  return (
    <Select
      value={value}
      onValueChange={(selected) => {
        if (isSortOption(selected)) onChange(selected)
      }}
    >
      <SelectTrigger aria-label="Sortowanie" className="sm:ml-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
