import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Select from './select.svelte'

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ]

  it('renders with default props', () => {
    render(Select, { props: { options: mockOptions } })
    
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Select an option...')
  })

  it('displays custom placeholder', () => {
    render(Select, { 
      props: { 
        options: mockOptions, 
        placeholder: 'Choose an option' 
      } 
    })
    
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('Choose an option')
  })

  it('handles disabled state', () => {
    render(Select, { 
      props: { 
        options: mockOptions, 
        disabled: true 
      } 
    })
    
    const trigger = screen.getByRole('button')
    expect(trigger).toBeDisabled()
  })

  it('shows selected value', () => {
    render(Select, { 
      props: { 
        options: mockOptions, 
        value: 'option1' 
      } 
    })
    
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('Option 1')
  })
})