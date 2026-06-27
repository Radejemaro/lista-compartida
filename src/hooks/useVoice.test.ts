import { describe, it, expect, vi } from 'vitest'
import { parseVoiceText } from './useVoice'

describe('parseVoiceText', () => {
  it('parses "agrega leche" -> addItem("leche")', () => {
    const add = vi.fn()
    const query = vi.fn()
    parseVoiceText('agrega leche', add, query)
    expect(add).toHaveBeenCalledWith('leche')
    expect(query).not.toHaveBeenCalled()
  })

  it('parses "agrega leche, huevos y pan" -> 3 items', () => {
    const add = vi.fn()
    const query = vi.fn()
    parseVoiceText('agrega leche, huevos y pan', add, query)
    expect(add).toHaveBeenCalledTimes(3)
    expect(add).toHaveBeenCalledWith('leche')
    expect(add).toHaveBeenCalledWith('huevos')
    expect(add).toHaveBeenCalledWith('pan')
  })

  it('parses "añade jamón y queso"', () => {
    const add = vi.fn()
    parseVoiceText('añade jamón y queso', add, vi.fn())
    expect(add).toHaveBeenCalledTimes(2)
    expect(add).toHaveBeenCalledWith('jamón')
    expect(add).toHaveBeenCalledWith('queso')
  })

  it('parses "pon manteca"', () => {
    const add = vi.fn()
    parseVoiceText('pon manteca', add, vi.fn())
    expect(add).toHaveBeenCalledWith('manteca')
  })

  it('parses "necesito arroz"', () => {
    const add = vi.fn()
    parseVoiceText('necesito arroz', add, vi.fn())
    expect(add).toHaveBeenCalledWith('arroz')
  })

  it('parses "quiero fruta"', () => {
    const add = vi.fn()
    parseVoiceText('quiero fruta', add, vi.fn())
    expect(add).toHaveBeenCalledWith('fruta')
  })

  it('parses "falta sal"', () => {
    const add = vi.fn()
    parseVoiceText('falta sal', add, vi.fn())
    expect(add).toHaveBeenCalledWith('sal')
  })

  it('parses "compra carne"', () => {
    const add = vi.fn()
    parseVoiceText('compra carne', add, vi.fn())
    expect(add).toHaveBeenCalledWith('carne')
  })

  it('parses "agrega leche, huevos, y además pan"', () => {
    const add = vi.fn()
    parseVoiceText('agrega leche, huevos, y además pan', add, vi.fn())
    expect(add).toHaveBeenCalledTimes(3)
  })

  it('parses "agrega leche;huevos;pan" -> semicolons', () => {
    const add = vi.fn()
    parseVoiceText('agrega leche;huevos;pan', add, vi.fn())
    expect(add).toHaveBeenCalledTimes(3)
  })

  it('calls onQueryMissing for "qué falta"', () => {
    const add = vi.fn()
    const query = vi.fn()
    parseVoiceText('qué falta', add, query)
    expect(query).toHaveBeenCalledOnce()
    expect(add).not.toHaveBeenCalled()
  })

  it('calls onQueryMissing for "que necesito"', () => {
    const query = vi.fn()
    parseVoiceText('que necesito', vi.fn(), query)
    expect(query).toHaveBeenCalledOnce()
  })

  it('calls onQueryMissing for "qué hace falta"', () => {
    const query = vi.fn()
    parseVoiceText('qué hace falta', vi.fn(), query)
    expect(query).toHaveBeenCalledOnce()
  })

  it('calls onQueryMissing for "que comprar"', () => {
    const query = vi.fn()
    parseVoiceText('que comprar', vi.fn(), query)
    expect(query).toHaveBeenCalledOnce()
  })

  it('treats a single word >1 char as item', () => {
    const add = vi.fn()
    parseVoiceText('leche', add, vi.fn())
    expect(add).toHaveBeenCalledWith('leche')
  })

  it('ignores single char words', () => {
    const add = vi.fn()
    parseVoiceText('a', add, vi.fn())
    expect(add).not.toHaveBeenCalled()
  })

  it('handles empty text', () => {
    const add = vi.fn()
    parseVoiceText('', add, vi.fn())
    expect(add).not.toHaveBeenCalled()
  })

  it('parses free-form list "leche, huevos, pan" -> 3 items', () => {
    const add = vi.fn()
    parseVoiceText('leche, huevos, pan', add, vi.fn())
    expect(add).toHaveBeenCalledTimes(3)
    expect(add).toHaveBeenCalledWith('leche')
    expect(add).toHaveBeenCalledWith('huevos')
    expect(add).toHaveBeenCalledWith('pan')
  })

  it('preserves accented characters', () => {
    const add = vi.fn()
    parseVoiceText('agrega café, té, y ñoquis', add, vi.fn())
    expect(add).toHaveBeenCalledWith('café')
    expect(add).toHaveBeenCalledWith('té')
    expect(add).toHaveBeenCalledWith('ñoquis')
  })

  it('handles items with "y" inside the word (mayonesa)', () => {
    const add = vi.fn()
    parseVoiceText('agrega mayonesa, mostaza y ketchup', add, vi.fn())
    expect(add).toHaveBeenCalledWith('mayonesa')
    expect(add).toHaveBeenCalledWith('mostaza')
    expect(add).toHaveBeenCalledWith('ketchup')
  })
})
