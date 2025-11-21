import React from 'react';
export interface SeparatorProps {
  className?: string;
}
export const Separator: React.FC<SeparatorProps> = ({ className }) => (
  <hr className={className ?? 'border-neutral-200 dark:border-neutral-800'} />
);
