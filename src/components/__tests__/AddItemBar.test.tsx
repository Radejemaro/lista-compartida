import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { AddItemBar } from '../AddItemBar'

afterEach(cleanup)

describe('AddItemBar', () => {
  it('renders the input and buttons', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} />)
    const input = container.querySelector('input')
    expect(input).toBeTruthy()
    expect(input?.getAttribute('aria-label')).toBe('Nuevo producto')
    const submit = container.querySelector('button[aria-label="Agregar producto"]')
    expect(submit).toBeTruthy()
  })

  it('calls onAdd when submitting a non-empty value', () => {
    const onAdd = vi.fn()
    const { container } = render(<AddItemBar onAdd={onAdd} />)
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { value: 'leche' } })
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(onAdd).toHaveBeenCalledWith('leche')
  })

  it('does not call onAdd with empty value', () => {
    const onAdd = vi.fn()
    const { container } = render(<AddItemBar onAdd={onAdd} />)
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows mic button when onVoiceToggle is provided', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} onVoiceToggle={vi.fn()} />)
    const mic = container.querySelector('[aria-label="Agregar por voz"]')
    expect(mic).toBeTruthy()
  })

  it('hides mic button when onVoiceToggle is not provided', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} />)
    const mic = container.querySelector('[aria-label="Agregar por voz"]')
    expect(mic).toBeFalsy()
  })

  it('shows listening state', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} onVoiceToggle={vi.fn()} isListening={true} />)
    const mic = container.querySelector('[aria-label="Detener dictado"]')
    expect(mic).toBeTruthy()
  })

  it('shows permission denied state', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} onVoiceToggle={vi.fn()} permissionDenied={true} />)
    const mic = container.querySelector('[aria-label="Micrófono bloqueado"]')
    expect(mic).toBeTruthy()
  })

  it('submit button is disabled when input is empty', () => {
    const { container } = render(<AddItemBar onAdd={vi.fn()} />)
    const submit = container.querySelector('button[aria-label="Agregar producto"]') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
  })
})
