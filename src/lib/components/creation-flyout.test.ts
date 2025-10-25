import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import CreationFlyout from './creation-flyout.svelte';

describe('CreationFlyout Component', () => {
  it('should render when open is true', () => {
    render(CreationFlyout, {
      props: {
        open: true,
        title: 'New Project'
      }
    });

    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(CreationFlyout, {
      props: {
        open: false,
        title: 'New Project'
      }
    });

    expect(screen.queryByText('New Project')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn();
    
    render(CreationFlyout, {
      props: {
        open: true,
        title: 'New Project',
        onOpenChange
      }
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close when backdrop is clicked', async () => {
    const onOpenChange = vi.fn();
    
    const { container } = render(CreationFlyout, {
      props: {
        open: true,
        title: 'New Project',
        onOpenChange
      }
    });

    const backdrop = container.querySelector('[role="dialog"]');
    if (backdrop) {
      await fireEvent.click(backdrop);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('should close when Escape key is pressed', async () => {
    const onOpenChange = vi.fn();
    
    render(CreationFlyout, {
      props: {
        open: true,
        title: 'New Project',
        onOpenChange
      }
    });

    await fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render children content', () => {
    render(CreationFlyout, {
      props: {
        open: true,
        title: 'New Project',
        children: () => 'Flyout content'
      }
    });

    expect(screen.getByText('Flyout content')).toBeInTheDocument();
  });
});