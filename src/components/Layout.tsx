/**
 * Application Layout Component
 * 
 * Provides consistent layout structure across the application
 * with error boundaries, loading states, and responsive design.
 */

import { ReactNode } from 'react';
import { ErrorBoundary, SectionErrorBoundary } from './ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

/**
 * Main application layout with sidebar and content area
 */
export function Layout({ children, showSidebar = true, className = "" }: LayoutProps) {
  return (
    <ErrorBoundary>
      <div className={`flex h-screen bg-brutalist-white ${className}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

/**
 * Page layout for individual pages
 */
export function PageLayout({ 
  children, 
  title, 
  description,
  actions,
  className = "" 
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <SectionErrorBoundary sectionName={title || "Page"}>
      <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
        {/* Page Header */}
        {(title || description || actions) && (
          <div className="border-b-4 border-brutalist-black bg-brutalist-white p-6">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-3xl font-black text-brutalist-black mb-2 uppercase">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="font-bold text-gray-600 uppercase tracking-wide">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Card layout for content sections
 */
export function CardLayout({ 
  children, 
  title, 
  description,
  className = "",
  contentClassName = ""
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <SectionErrorBoundary sectionName={title || "Card Section"}>
      <div className={`brutalist-card ${className}`}>
        {(title || description) && (
          <div className="border-b-4 border-brutalist-black p-6">
            {title && (
              <h2 className="text-2xl font-black text-brutalist-black mb-2 uppercase">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-bold text-gray-600 uppercase tracking-wide">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className={`p-6 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Grid layout for dashboard cards
 */
export function GridLayout({ 
  children, 
  columns = "auto-fit",
  minWidth = "300px",
  gap = "1.5rem",
  className = ""
}: {
  children: ReactNode;
  columns?: string | number;
  minWidth?: string;
  gap?: string;
  className?: string;
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' 
      ? `repeat(${columns}, 1fr)` 
      : `repeat(${columns}, minmax(${minWidth}, 1fr))`,
    gap
  };

  return (
    <SectionErrorBoundary sectionName="Grid Layout">
      <div className={className} style={gridStyle}>
        {children}
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Sidebar layout component
 */
export function SidebarLayout({ 
  children, 
  width = "320px",
  className = ""
}: {
  children: ReactNode;
  width?: string;
  className?: string;
}) {
  return (
    <SectionErrorBoundary sectionName="Sidebar">
      <div 
        className={`bg-brutalist-black border-r-4 border-brutalist-black flex flex-col ${className}`}
        style={{ width }}
      >
        {children}
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Content layout with proper spacing
 */
export function ContentLayout({ 
  children, 
  maxWidth = "none",
  centered = false,
  className = ""
}: {
  children: ReactNode;
  maxWidth?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <SectionErrorBoundary sectionName="Content">
      <div className={`w-full ${centered ? 'mx-auto' : ''} ${className}`} style={{ maxWidth }}>
        {children}
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Two-column layout
 */
export function TwoColumnLayout({ 
  left, 
  right, 
  leftWidth = "1fr",
  rightWidth = "1fr",
  gap = "2rem",
  className = ""
}: {
  left: ReactNode;
  right: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  gap?: string;
  className?: string;
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${leftWidth} ${rightWidth}`,
    gap
  };

  return (
    <SectionErrorBoundary sectionName="Two Column Layout">
      <div className={className} style={gridStyle}>
        <div>
          {left}
        </div>
        <div>
          {right}
        </div>
      </div>
    </SectionErrorBoundary>
  );
}

/**
 * Responsive stack layout
 */
export function StackLayout({ 
  children, 
  spacing = "1.5rem",
  direction = "column",
  className = ""
}: {
  children: ReactNode;
  spacing?: string;
  direction?: "row" | "column";
  className?: string;
}) {
  const flexStyle = {
    display: 'flex',
    flexDirection: direction,
    gap: spacing
  };

  return (
    <SectionErrorBoundary sectionName="Stack Layout">
      <div className={className} style={flexStyle}>
        {children}
      </div>
    </SectionErrorBoundary>
  );
}