import { describe, expect, it } from 'vitest'
import { parseId, parseIdList } from './parse'

describe('parseId', () => {
  it('parses positive integers', () => {
    expect(parseId('1')).toBe(1)
    expect(parseId('42')).toBe(42)
  })

  it.each([undefined, null, '', '0', '-3', '1.5', '12abc', ' 7', '99999999999999999999'])(
    'rejects %j',
    (value) => {
      expect(parseId(value)).toBeNull()
    },
  )
})

describe('parseIdList', () => {
  it('parses comma-separated ids', () => {
    expect(parseIdList('12,13')).toEqual([12, 13])
    expect(parseIdList(' 12 , 13 ')).toEqual([12, 13])
  })

  it('skips invalid and duplicate ids', () => {
    expect(parseIdList('12,abc,,12,0,14')).toEqual([12, 14])
    expect(parseIdList(null)).toEqual([])
  })
})
