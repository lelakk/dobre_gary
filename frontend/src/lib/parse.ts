/** Parses a database id taken from the URL; returns null for anything that is not a positive integer. */
export function parseId(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

/** Parses a comma-separated list of ids ("12,13"), skipping invalid and duplicate entries. */
export function parseIdList(value: string | null | undefined): number[] {
  const ids = (value ?? '').split(',').map((part) => parseId(part.trim()))
  return [...new Set(ids.filter((id) => id !== null))]
}
