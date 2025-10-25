import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DropdownMenu from './dropdown-menu.svelte';
import DropdownMenuItem from './dropdown-menu-item.svelte';

describe('DropdownMenu Component', () => {
  it('should render trigger and dropdown content', () => {
    render(DropdownMenu, {
      props: {
        open: true,
        trigger: () => 'Trigger Button',
        children: () => 'Dropdown Content'
      }
    });

    expect(screen.getByText('Trigger Button')).toBeInTheDocument();
    expect(screen.getByText('Dropdown Content')).toBeInTheDocument();
  });

  it('should not show dropdown content when closed', () => {
    render(DropdownMenu, {
      props: {
        open: false,
        trigger: () => 'Trigger Button',
        children: () => 'Dropdown Content'
      }
    });

    expect(screen.getByText('Trigger Button')).toBeInTheDocument();
    expect(screen.queryByText('Dropdown Content')).not.toBeInTheDocument();
  });
});

describe('DropdownMenuItem Component', () => {
  it('should render menu item with content', () => {
    render(DropdownMenuItem, {
      props: {
        children: () => 'Menu Item'
      }
    });

    expect(screen.getByText('Menu Item')).toBeInTheDocument();
  });

  it('should call onclick when clicked', async () => {
    const onclick = vi.fn();
    
    render(DropdownMenuItem, {
      props: {
        onclick,
        children: () => 'Clickable Item'
      }
    });

    const menuItem = screen.getByText('Clickable Item');
    await fireEvent.click(menuItem);

    expect(onclick).toHaveBeenCalled();
  });

  it('should apply destructive variant styles', () => {
    render(DropdownMenuItem, {
      props: {
        variant: 'destructive',
        children: () => 'Delete Item'
      }
    });

    const menuItem = screen.getByText('Delete Item');
    expect(menuItem).toHaveClass('text-destructive');
  });

  it('should be disabled when disabled prop is true', () => {
    render(DropdownMenuItem, {
      props: {
        disabled: true,
        children: () => 'Disabled Item'
      }
    });

    const menuItem = screen.getByText('Disabled Item');
    expect(menuItem).toHaveAttribute('disabled');
  });
});