/** Case- and diacritic-insensitive form of a text, so "zeliwny" finds "Żeliwny" and "lyzka" finds "Łyżka". */
export function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .replaceAll('ł', 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Whether any of the fields contains the term, ignoring case and Polish diacritics. */
export function matchesSearchTerm(fields: (string | null)[], term: string): boolean {
  const normalizedTerm = normalizeForSearch(term.trim())
  if (normalizedTerm === '') {
    return true
  }
  return fields.some(
    (field) => field !== null && normalizeForSearch(field).includes(normalizedTerm),
  )
}
