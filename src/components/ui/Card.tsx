import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CardVariant = 'default' | 'flat' | 'elevated' | 'outline';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = false,
      padding = 'md',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'card';
    const variantClasses = `card-${variant}`;
    const paddingClasses =
      padding === 'none' ? '' : padding === 'lg' ? 'card-body-lg' : 'card-body';
    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all' : '';

    const classes = cn(
      baseClasses,
      variantClasses,
      paddingClasses,
      hoverClasses,
      className
    );

    return (
      <motion.div
        ref={ref}
        className={classes}
        onClick={onClick}
        whileHover={hover ? { y: -3, boxShadow: 'var(--shadow-lg)' } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
