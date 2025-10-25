import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import Dashboard from '../../routes/+page.svelte';

// Mock window properties for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock matchMedia for responsive behavior
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Dashboard End-to-End Tests', () => {
  beforeEach(() => {
    // Reset window width to desktop
    window.innerWidth = 1024;
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up any side effects
    document.body.style.overflow = 'unset';
  });

  describe('Dashboard Layout and Navigation', () => {
    it('should render dashboard with all main sections', async () => {
      const { container } = render(Dashboard);
      
      // Check for main dashboard elements
      expect(container.querySelector('.flex.min-h-screen')).toBeTruthy();
      
      // Check for welcome message
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // Check for overview text
      expect(screen.getByText(/Here's an overview of your cosplay projects/)).toBeTruthy();
    });

    it('should display statistics cards with correct data', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for stat cards
        expect(screen.getByText('Active Projects')).toBeTruthy();
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
        expect(screen.getByText('Tasks Due Soon')).toBeTruthy();
        expect(screen.getByText('Total Budget')).toBeTruthy();
        
        // Check for stat values
        expect(screen.getByText('3')).toBeTruthy(); // Active Projects count
        expect(screen.getByText('5')).toBeTruthy(); // Tasks Due Soon count
        expect(screen.getByText('$1,900')).toBeTruthy(); // Total Budget
      });
    });

    it('should display project cards with correct information', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for project titles
        expect(screen.getByText('Malenia, Blade of Miquella')).toBeTruthy();
        expect(screen.getByText('Raiden Shogun')).toBeTruthy();
        expect(screen.getByText('V (Female)')).toBeTruthy();
        
        // Check for series information
        expect(screen.getByText('Elden Ring')).toBeTruthy();
        expect(screen.getByText('Genshin Impact')).toBeTruthy();
        expect(screen.getByText('Cyberpunk 2077')).toBeTruthy();
        
        // Check for progress indicators
        expect(screen.getByText('65%')).toBeTruthy();
        expect(screen.getByText('30%')).toBeTruthy();
        expect(screen.getByText('10%')).toBeTruthy();
      });
    });
  });

  describe('Project Creation Flow', () => {
    it('should open character creation modal when New Project button is clicked', async () => {
      render(Dashboard);
      
      // Find and click the New Project button
      const newProjectButton = screen.getByRole('button', { name: /New Project/i });
      expect(newProjectButton).toBeTruthy();
      
      fireEvent.click(newProjectButton);
      await tick();
      
      // Check if modal opens (creation flyout should be visible)
      await waitFor(() => {
        expect(screen.getByText('New Character')).toBeTruthy();
      });
    });

    it('should display character creation form in modal', async () => {
      render(Dashboard);
      
      // Open the modal
      const newProjectButton = screen.getByRole('button', { name: /New Project/i });
      fireEvent.click(newProjectButton);
      await tick();
      
      await waitFor(() => {
        // Check for form fields
        expect(screen.getByText('Character Name')).toBeTruthy();
        expect(screen.getByText('Series / Source')).toBeTruthy();
        expect(screen.getByText('Description')).toBeTruthy();
        expect(screen.getByText('Difficulty Level')).toBeTruthy();
        expect(screen.getByText('Tags')).toBeTruthy();
        expect(screen.getByText('Notes')).toBeTruthy();
        
        // Check for difficulty buttons
        expect(screen.getByText('easy')).toBeTruthy();
        expect(screen.getByText('medium')).toBeTruthy();
        expect(screen.getByText('hard')).toBeTruthy();
        expect(screen.getByText('expert')).toBeTruthy();
        
        // Check for action buttons
        expect(screen.getByText('Create Character')).toBeTruthy();
        expect(screen.getByText('Save as Draft')).toBeTruthy();
      });
    });

    it('should handle form interactions in character creation', async () => {
      render(Dashboard);
      
      // Open the modal
      const newProjectButton = screen.getByRole('button', { name: /New Project/i });
      fireEvent.click(newProjectButton);
      await tick();
      
      await waitFor(() => {
        // Test difficulty selection
        const mediumButton = screen.getByText('medium');
        fireEvent.click(mediumButton);
        
        // Test tag addition
        const tagInput = screen.getByPlaceholderText('Add tag...');
        fireEvent.input(tagInput, { target: { value: 'armor' } });
        
        const addTagButton = tagInput.nextElementSibling;
        if (addTagButton) {
          fireEvent.click(addTagButton);
        }
      });
    });
  });

  describe('Widget Functionality', () => {
    it('should display tasks widget with interactive elements', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for tasks widget
        expect(screen.getByText('Important Tasks')).toBeTruthy();
        
        // Check for task items
        expect(screen.getByText('Order foam for armor pieces')).toBeTruthy();
        expect(screen.getByText('Pattern test for kimono sleeves')).toBeTruthy();
        expect(screen.getByText('Paint sword prop')).toBeTruthy();
        
        // Check for project associations
        expect(screen.getByText('Malenia')).toBeTruthy();
        expect(screen.getByText('Raiden Shogun')).toBeTruthy();
        
        // Check for priority badges
        expect(screen.getByText('high')).toBeTruthy();
        expect(screen.getByText('medium')).toBeTruthy();
        expect(screen.getByText('low')).toBeTruthy();
      });
    });

    it('should display budget widget with financial information', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for budget widget
        expect(screen.getByText('Budget Overview')).toBeTruthy();
        
        // Check for total budget information
        expect(screen.getByText('Total Budget Used')).toBeTruthy();
        expect(screen.getByText('$700 / $1900')).toBeTruthy();
        
        // Check for project-specific budgets
        expect(screen.getByText('$450 / $800')).toBeTruthy(); // Malenia
        expect(screen.getByText('$200 / $600')).toBeTruthy(); // Raiden Shogun
        expect(screen.getByText('$50 / $500')).toBeTruthy();  // V (Cyberpunk)
      });
    });

    it('should display upcoming events widget', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for events widget
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
        
        // Check for event items
        expect(screen.getByText('Anime Expo 2025')).toBeTruthy();
        expect(screen.getByText('Forest Photoshoot')).toBeTruthy();
        expect(screen.getByText('Genshin Meetup')).toBeTruthy();
        
        // Check for event details
        expect(screen.getByText('Nov 8, 2025')).toBeTruthy();
        expect(screen.getByText('Los Angeles, CA')).toBeTruthy();
        expect(screen.getByText('Griffith Park')).toBeTruthy();
        
        // Check for event types
        expect(screen.getByText('convention')).toBeTruthy();
        expect(screen.getByText('photoshoot')).toBeTruthy();
        expect(screen.getByText('meetup')).toBeTruthy();
      });
    });

    it('should display recent activity widget', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Check for activity widget
        expect(screen.getByText('Recent Activity')).toBeTruthy();
        
        // Check for activity items
        expect(screen.getByText('Materials ordered')).toBeTruthy();
        expect(screen.getByText('Progress photos added')).toBeTruthy();
        expect(screen.getByText('Task completed')).toBeTruthy();
        expect(screen.getByText('Pattern uploaded')).toBeTruthy();
        
        // Check for activity descriptions
        expect(screen.getByText('EVA foam and contact cement for Malenia armor')).toBeTruthy();
        expect(screen.getByText('Uploaded 12 photos to Raiden Shogun project')).toBeTruthy();
        
        // Check for timestamps
        expect(screen.getByText('2 hours ago')).toBeTruthy();
        expect(screen.getByText('5 hours ago')).toBeTruthy();
        expect(screen.getByText('Yesterday')).toBeTruthy();
        expect(screen.getByText('2 days ago')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design and Mobile Compatibility', () => {
    it('should handle mobile viewport correctly', async () => {
      // Set mobile viewport
      window.innerWidth = 375;
      
      render(Dashboard);
      
      // The layout should still render without errors
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // Check that grid layouts adapt (this would be tested via CSS classes in real implementation)
      const statsGrid = document.querySelector('.grid.gap-4.sm\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statsGrid).toBeTruthy();
    });

    it('should handle tablet viewport correctly', async () => {
      // Set tablet viewport
      window.innerWidth = 768;
      
      render(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // Check for responsive grid classes
      const projectsGrid = document.querySelector('.grid.gap-4.sm\\:grid-cols-2');
      expect(projectsGrid).toBeTruthy();
    });

    it('should maintain functionality across different screen sizes', async () => {
      // Test desktop
      window.innerWidth = 1200;
      const { rerender } = render(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // Test mobile
      window.innerWidth = 375;
      rerender(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // New Project button should still be functional
      const newProjectButton = screen.getByRole('button', { name: /New Project/i });
      expect(newProjectButton).toBeTruthy();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing project data gracefully', async () => {
      // This test would be more meaningful with actual data loading
      render(Dashboard);
      
      // Should not throw errors even with mock data
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
    });

    it('should handle keyboard navigation', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        const newProjectButton = screen.getByRole('button', { name: /New Project/i });
        
        // Test keyboard activation
        fireEvent.keyDown(newProjectButton, { key: 'Enter' });
        fireEvent.keyDown(newProjectButton, { key: ' ' });
        
        // Should not throw errors
        expect(newProjectButton).toBeTruthy();
      });
    });

    it('should handle focus management', async () => {
      render(Dashboard);
      
      await waitFor(() => {
        // Test that focusable elements exist
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
        
        // Test focus on first button
        if (buttons[0]) {
          buttons[0].focus();
          expect(document.activeElement).toBe(buttons[0]);
        }
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('should render dashboard components efficiently', async () => {
      const startTime = performance.now();
      
      render(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000); // 1 second
    });

    it('should handle component updates efficiently', async () => {
      const { rerender } = render(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
      
      // Rerender should not cause issues
      rerender(Dashboard);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Cosplayer!')).toBeTruthy();
      });
    });
  });
});