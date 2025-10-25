import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Dialog from './dialog.svelte';

describe('Dialog Component', () => {
  it('should render when open is true', () => {
    const { container } = render(Dialog, {
      props: {
        open: true,
        title: 'Test Dialog',
        description: 'Test description'
      }
    });

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(Dialog, {
      props: {
        open: false,
        title: 'Test Dialog'
      }
    });

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn();
    
    render(Dialog, {
      props: {
        open: true,
        title: 'Test Dialog',
        onOpenChange,
        showCloseButton: true
      }
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render children content', () => {
    render(Dialog, {
      props: {
        open: true,
        title: 'Test Dialog',
        children: () => 'Custom content'
      }
    });

    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});