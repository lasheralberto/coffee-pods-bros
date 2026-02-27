import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StackProps {
  gap?: 2 | 4 | 6 | 8 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  gap = 4,
  align = 'stretch',
  children,
  className,
}) => {
  const gapClasses = `stack-${gap}`;
  const alignClasses = `items-${align}`;

  return (
    <div className={cn('flex flex-col', gapClasses, alignClasses, className)}>
      {children}
    </div>
  );
};
