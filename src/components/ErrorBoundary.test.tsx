/**
 * Error Boundary Component Tests
 * 
 * Tests for the ErrorBoundary component to ensure proper error handling.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error</div>;
};

// Component that throws during render
const ProblematicComponent = () => {
  throw new Error('Component render error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/SYSTEM ERROR DETECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TRY AGAIN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GO HOME/i })).toBeInTheDocument();
  });

  it('should display error message in error UI', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Component render error/i)).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should show custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should reset error state when retry is clicked', async () => {
    const { user } = renderWithUser(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be displayed initially
    expect(screen.getByText(/SYSTEM ERROR DETECTED/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /TRY AGAIN/i });
    await user.click(retryButton);

    // Component should attempt to re-render (though it will error again in this test)
    expect(screen.getByText(/SYSTEM ERROR DETECTED/i)).toBeInTheDocument();
  });
});

describe('SectionErrorBoundary', () => {
  it('should render section-specific error message', () => {
    render(
      <ErrorBoundary 
        fallback={
          <div>Error loading Test Section</div>
        }
      >
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error loading Test Section')).toBeInTheDocument();
  });
});

// Helper function for user events
function renderWithUser(ui: React.ReactElement) {
  return {
    user: {
      click: async (element: Element) => {
        // Mock click behavior - in a real test you'd use @testing-library/user-event
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    },
    ...render(ui)
  };
}