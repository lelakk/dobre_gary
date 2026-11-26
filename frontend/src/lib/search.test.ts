import { describe, expect, it } from 'vitest'
import { matchesSearchTerm, normalizeForSearch } from './search'

describe('normalizeForSearch', () => {
  it('lower-cases text and strips Polish diacritics', () => {
    expect(normalizeForSearch('Żeliwny Łyżka ĆMA')).toBe('zeliwny lyzka cma')
  })
})

describe('matchesSearchTerm', () => {
  const fields = ['Garnek żeliwny 4L', 'Chasseur', 'GAR-004']

  it('matches any field ignoring case and diacritics', () => {
    expect(matchesSearchTerm(fields, 'ZELIWNY')).toBe(true)
    expect(matchesSearchTerm(fields, 'chasseur')).toBe(true)
    expect(matchesSearchTerm(fields, 'gar-004')).toBe(true)
    expect(matchesSearchTerm(fields, 'patelnia')).toBe(false)
  })

  it('matches everything for an empty or blank term', () => {
    expect(matchesSearchTerm(fields, '')).toBe(true)
    expect(matchesSearchTerm([null], '  ')).toBe(true)
  })

  it('skips missing fields', () => {
    expect(matchesSearchTerm([null, 'Jan Kowalski'], 'kowalski')).toBe(true)
  })
})
