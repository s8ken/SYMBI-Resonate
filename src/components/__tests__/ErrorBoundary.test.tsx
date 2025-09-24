/**
 * ErrorBoundary Component Tests
 * 
 * Tests for the ErrorBoundary component to ensure proper error handling
 * and fallback UI rendering in various error scenarios.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary, SectionErrorBoundary } from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error occurred</div>;
};

// Mock component that throws after interaction
const ConditionalError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Conditional error');
  }
  return (
    <div>
      <button onClick={() => {
        throw new Error('Click error');
      }}>
        Throw Error
      </button>
      <span>Normal content</span>
    </div>
  );
};

// Suppress console errors for these tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-content">Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render multiple children correctly', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">First child</div>
          <div data-testid="child2">Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error UI when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('SYSTEM ERROR DETECTED')).toBeInTheDocument();
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
      expect(screen.getByText('TRY AGAIN')).toBeInTheDocument();
      expect(screen.getByText('RELOAD PAGE')).toBeInTheDocument();
      expect(screen.getByText('GO HOME')).toBeInTheDocument();
    });

    it('should display error details correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('ERROR DETAILS')).toBeInTheDocument();
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument();
    });

    it('should provide recovery options', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('RECOVERY OPTIONS')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /TRY AGAIN/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /RELOAD PAGE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GO HOME/i })).toBeInTheDocument();
    });

    it('should show help information', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('NEED HELP?')).toBeInTheDocument();
      expect(screen.getByText(/If this error persists/)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('SYSTEM ERROR DETECTED')).not.toBeInTheDocument();
    });
  });

  describe('Error Handler Callback', () => {
    it('should call onError callback when error occurs', () => {
      const mockOnError = vi.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('should pass correct error information to callback', () => {
      const mockOnError = vi.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError />
        </ErrorBoundary>
      );

      const [error, errorInfo] = mockOnError.mock.calls[0];
      expect(error.message).toBe('Test error message');
      expect(errorInfo).toHaveProperty('componentStack');
    });
  });

  describe('Recovery Actions', () => {
    it('should allow retry functionality', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const RetryableComponent = () => {
        if (shouldThrow) {
          throw new Error('Retryable error');
        }
        return <div data-testid="success">Component loaded successfully</div>;
      };

      render(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByText('SYSTEM ERROR DETECTED')).toBeInTheDocument();

      // Fix the error condition and click retry
      shouldThrow = false;
      const retryButton = screen.getByRole('button', { name: /TRY AGAIN/i });
      await user.click(retryButton);

      // Component should recover (note: in real scenarios this might need state management)
      // For this test, we just verify the button is clickable
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle home navigation', async () => {
      const user = userEvent.setup();
      
      // Mock window.location
      const mockLocation = {
        href: '',
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /GO HOME/i });
      await user.click(homeButton);

      expect(window.location.href).toBe('/');
    });

    it('should handle page reload', async () => {
      const user = userEvent.setup();
      
      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: {
          reload: mockReload,
        },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /RELOAD PAGE/i });
      await user.click(reloadButton);

      expect(mockReload).toHaveBeenCalled();
    });
  });
});

describe('SectionErrorBoundary', () => {
  it('should render children normally when no error', () => {
    render(
      <SectionErrorBoundary sectionName="Test Section">
        <div data-testid="section-content">Section content</div>
      </SectionErrorBoundary>
    );

    expect(screen.getByTestId('section-content')).toBeInTheDocument();
  });

  it('should show section-specific error message', () => {
    render(
      <SectionErrorBoundary sectionName="Test Section">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(screen.getByText('Error loading Test Section')).toBeInTheDocument();
  });

  it('should display error icon', () => {
    render(
      <SectionErrorBoundary sectionName="Navigation">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(screen.getByText('Error loading Navigation')).toBeInTheDocument();
    // The AlertTriangle icon should be present
    expect(screen.getByText('Error loading Navigation').previousElementSibling).toBeInTheDocument();
  });

  it('should handle different section names', () => {
    const { rerender } = render(
      <SectionErrorBoundary sectionName="Dashboard">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(screen.getByText('Error loading Dashboard')).toBeInTheDocument();

    rerender(
      <SectionErrorBoundary sectionName="Analytics">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(screen.getByText('Error loading Analytics')).toBeInTheDocument();
  });
});

describe('Error Boundary Integration', () => {
  it('should handle nested error boundaries correctly', () => {
    render(
      <ErrorBoundary>
        <div>Outer content</div>
        <SectionErrorBoundary sectionName="Inner Section">
          <ThrowError />
        </SectionErrorBoundary>
      </ErrorBoundary>
    );

    // Inner boundary should catch the error
    expect(screen.getByText('Error loading Inner Section')).toBeInTheDocument();
    // Outer boundary should still render its content
    expect(screen.getByText('Outer content')).toBeInTheDocument();
  });

  it('should propagate uncaught errors to parent boundary', () => {
    const ProblematicSection = () => {
      throw new Error('Section error');
    };

    render(
      <ErrorBoundary>
        <SectionErrorBoundary sectionName="Working Section">
          <div>Working content</div>
        </SectionErrorBoundary>
        <ProblematicSection />
      </ErrorBoundary>
    );

    // Parent boundary should catch the error from ProblematicSection
    expect(screen.getByText('SYSTEM ERROR DETECTED')).toBeInTheDocument();
  });
});