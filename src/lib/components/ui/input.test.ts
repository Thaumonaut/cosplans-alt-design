import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Input from './input.svelte'

describe('Input', () => {
  it('renders with default props', () => {
    render(Input, { props: {} })
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveClass('border-input', 'rounded-md')
  })

  it('handles different input types', () => {
    render(Input, { props: { type: 'email' } })
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles placeholder text', () => {
    render(Input, { props: { placeholder: 'Enter your name' } })
    
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(Input, { props: { disabled: true } })
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('handles value binding', () => {
    render(Input, { props: { value: 'initial' } })
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('initial')
  })
})