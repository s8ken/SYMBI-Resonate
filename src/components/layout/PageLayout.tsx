import React from 'react';
import { cn } from '../../utils/cn';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-neutral-50 dark:bg-neutral-950', className)}>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        
        {/* Page Header */}
        {(title || actions) && (
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export interface PageSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <section className={cn('mb-8', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};