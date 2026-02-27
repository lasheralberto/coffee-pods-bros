import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GridProps {
  cols?: 2 | 3 | 4 | 'auto-sm' | 'auto-md' | 'auto-lg';
  gap?: 4 | 6 | 8;
  children: React.ReactNode;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  cols = 3,
  gap = 6,
  children,
  className,
}) => {
  const colsClasses =
    typeof cols === 'string'
      ? `grid-${cols}`
      : `grid-${cols}`;
  const gapClasses = `gap-${gap}`;

  return (
    <div className={cn('grid', colsClasses, gapClasses, className)}>
      {children}
    </div>
  );
};
