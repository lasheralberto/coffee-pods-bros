import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = false,
  lines = 1,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton animate-pulse bg-foam',
            rounded ? 'rounded-full' : 'rounded-md'
          )}
          style={{
            width: lines > 1 && i === lines - 1 ? '70%' : width,
            height,
          }}
        />
      ))}
    </div>
  );
};
