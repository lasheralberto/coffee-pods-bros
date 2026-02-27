import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClusterProps {
  gap?: 2 | 3 | 4;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between';
  children: React.ReactNode;
  className?: string;
}

export const Cluster: React.FC<ClusterProps> = ({
  gap = 3,
  align = 'center',
  justify = 'start',
  children,
  className,
}) => {
  const gapClasses = `cluster-${gap}`;
  const alignClasses = `items-${align}`;
  const justifyClasses = `justify-${justify}`;

  return (
    <div
      className={cn('flex flex-wrap', gapClasses, alignClasses, justifyClasses, className)}
    >
      {children}
    </div>
  );
};
