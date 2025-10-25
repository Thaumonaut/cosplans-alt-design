import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Button from './button.svelte'

describe('Button', () => {
  it('renders with default props', () => {
    render(Button, { 
      props: {},
      children: () => 'Click me'
    })
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('renders with different variants', () => {
    render(Button, { 
      props: { variant: 'destructive' },
      children: () => 'Delete'
    })
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('renders with different sizes', () => {
    render(Button, { 
      props: { size: 'sm' },
      children: () => 'Small'
    })
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
  })

  it('renders as anchor when href is provided', () => {
    render(Button, { 
      props: { href: '/test' },
      children: () => 'Link'
    })
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('handles disabled state', () => {
    render(Button, { 
      props: { disabled: true },
      children: () => 'Disabled'
    })
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})