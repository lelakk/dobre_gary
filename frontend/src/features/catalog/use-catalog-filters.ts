import { useSearchParams } from 'react-router'
import {
  type CatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  parseCatalogFilters,
  toSearchParams,
} from './catalog-filters'

/** Catalog filters stored in the URL, so filtered views survive reloads and can be shared. */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseCatalogFilters(searchParams)

  // `replace` keeps every keystroke and filter tweak out of the browser history.
  const applyFilters = (next: CatalogFilters) =>
    setSearchParams(toSearchParams(next), { replace: true })

  return {
    filters,
    updateFilters: (changes: Partial<CatalogFilters>) => applyFilters({ ...filters, ...changes }),
    resetFilters: () => applyFilters({ ...DEFAULT_CATALOG_FILTERS, sort: filters.sort }),
  }
}
