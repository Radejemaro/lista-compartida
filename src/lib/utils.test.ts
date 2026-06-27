import { describe, it, expect } from 'vitest'
import { cn, peerColor, generateId, parseQuantity } from './utils'

describe('cn', () => {
  it('joins classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string for all falsy', () => {
    expect(cn(false, undefined, null)).toBe('')
  })
})

describe('peerColor', () => {
  it('returns a consistent color for the same peerId', () => {
    const color = peerColor('abc123')
    expect(peerColor('abc123')).toBe(color)
  })

  it('returns different colors for different peerIds', () => {
    const colors = new Set(Array.from({ length: 20 }, (_, i) => peerColor(`user-${i}`)))
    expect(colors.size).toBeGreaterThan(1)
  })

  it('returns a hex color', () => {
    expect(peerColor('test')).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('returns unique values', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    expect(new Set(ids).size).toBe(100)
  })
})

describe('parseQuantity', () => {
  it('parses "5 lechugas" → { name: "lechugas", quantity: 5 }', () => {
    expect(parseQuantity('5 lechugas')).toEqual({ name: 'lechugas', quantity: 5 })
  })

  it('parses "3 huevos" → { name: "huevos", quantity: 3 }', () => {
    expect(parseQuantity('3 huevos')).toEqual({ name: 'huevos', quantity: 3 })
  })

  it('defaults quantity=1 for names without a leading number', () => {
    expect(parseQuantity('lechuga')).toEqual({ name: 'lechuga', quantity: 1 })
  })

  it('defaults quantity=1 for "0 items"', () => {
    expect(parseQuantity('0 items')).toEqual({ name: 'items', quantity: 1 })
  })

  it('handles multi-digit numbers', () => {
    expect(parseQuantity('12 cervezas')).toEqual({ name: 'cervezas', quantity: 12 })
  })

  it('trims whitespace', () => {
    expect(parseQuantity('  2 panes  ')).toEqual({ name: 'panes', quantity: 2 })
  })

  it('strips empty string to name="" qty=1', () => {
    expect(parseQuantity('')).toEqual({ name: '', quantity: 1 })
  })

  it('handles "100" alone (no trailing text)', () => {
    expect(parseQuantity('100')).toEqual({ name: '100', quantity: 1 })
  })

  it('handles "a 2 items" (letter before number)', () => {
    expect(parseQuantity('a 2 items')).toEqual({ name: 'a 2 items', quantity: 1 })
  })
})
