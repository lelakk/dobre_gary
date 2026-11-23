import { describe, expect, it } from 'vitest'
import { parseId } from './parse'

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
