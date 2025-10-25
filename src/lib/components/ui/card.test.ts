import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Card from './card.svelte'
import CardHeader from './card-header.svelte'
import CardTitle from './card-title.svelte'
import CardContent from './card-content.svelte'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default styling', () => {
      render(Card, { 
        props: {},
        children: () => 'Card content'
      })
      
      const card = screen.getByText('Card content').parentElement
      expect(card).toHaveClass('bg-card', 'rounded-xl', 'border')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('applies custom class names', () => {
      render(Card, { 
        props: { class: 'custom-class' },
        children: () => 'Card content'
      })
      
      const card = screen.getByText('Card content').parentElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('renders with proper styling', () => {
      render(CardHeader, { 
        props: {},
        children: () => 'Header content'
      })
      
      const header = screen.getByText('Header content').parentElement
      expect(header).toHaveClass('grid', 'px-6')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })
  })

  describe('CardTitle', () => {
    it('renders with title styling', () => {
      render(CardTitle, { 
        props: {},
        children: () => 'Card Title'
      })
      
      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })
  })

  describe('CardContent', () => {
    it('renders with content styling', () => {
      render(CardContent, { 
        props: {},
        children: () => 'Card content'
      })
      
      const content = screen.getByText('Card content').parentElement
      expect(content).toHaveClass('px-6')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })
  })
})