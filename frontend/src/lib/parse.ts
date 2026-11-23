/** Parses a database id taken from the URL; returns null for anything that is not a positive integer. */
export function parseId(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
