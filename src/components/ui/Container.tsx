import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'narrow' | 'full';

interface ContainerProps {
  size?: ContainerSize;
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  children,
  className,
}) => {
  const sizeClasses =
    size === 'full'
      ? 'w-full'
      : size === 'narrow'
      ? 'container-narrow'
      : `container-${size}`;

  return <div className={cn('container', sizeClasses, className)}>{children}</div>;
};
