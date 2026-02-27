import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type BadgeVariant = 'default' | 'brand' | 'accent' | 'leaf' | 'outline' | 'caramel';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  icon,
  className,
}) => {
  const variantClasses = `badge-${variant}`;
  
  return (
    <span className={cn('badge', variantClasses, className)}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};
