import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './sidebar.svelte';
import SidebarMenuButton from './sidebar-menu-button.svelte';

// Mock window.innerWidth for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset window width to desktop
    window.innerWidth = 1024;
  });

  it('should render sidebar content', () => {
    render(Sidebar, {
      props: {
        children: () => 'Sidebar Content'
      }
    });

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('should handle keyboard shortcut for toggle', async () => {
    const onOpenChange = vi.fn();
    
    render(Sidebar, {
      props: {
        onOpenChange,
        children: () => 'Sidebar Content'
      }
    });

    // Simulate Ctrl+B keyboard shortcut
    await fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('should render as mobile sheet when window is small', () => {
    // Mock mobile width
    window.innerWidth = 500;
    
    render(Sidebar, {
      props: {
        children: () => 'Mobile Sidebar'
      }
    });

    // The component should render differently for mobile
    expect(screen.getByText('Mobile Sidebar')).toBeInTheDocument();
  });

  it('should apply correct variant classes', () => {
    const { container } = render(Sidebar, {
      props: {
        variant: 'floating',
        children: () => 'Floating Sidebar'
      }
    });

    const sidebarElement = container.querySelector('[data-variant="floating"]');
    expect(sidebarElement).toBeInTheDocument();
  });
});

describe('SidebarMenuButton Component', () => {
  it('should render as link when href is provided', () => {
    render(SidebarMenuButton, {
      props: {
        href: '/test',
        children: () => 'Test Link'
      }
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('should render as button when no href is provided', () => {
    render(SidebarMenuButton, {
      props: {
        children: () => 'Test Button'
      }
    });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should call onclick when clicked', async () => {
    const onclick = vi.fn();
    
    render(SidebarMenuButton, {
      props: {
        onclick,
        children: () => 'Clickable Button'
      }
    });

    const button = screen.getByRole('button');
    await fireEvent.click(button);

    expect(onclick).toHaveBeenCalled();
  });

  it('should apply active styles when isActive is true', () => {
    render(SidebarMenuButton, {
      props: {
        isActive: true,
        children: () => 'Active Button'
      }
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-sidebar-accent');
  });

  it('should apply size variant classes', () => {
    render(SidebarMenuButton, {
      props: {
        size: 'lg',
        children: () => 'Large Button'
      }
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
  });
});