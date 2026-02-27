import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SectionSize = 'sm' | 'md' | 'lg';

interface SectionProps {
  size?: SectionSize;
  bg?: 'page' | 'surface' | 'inverse' | 'mist';
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  size = 'md',
  bg = 'page',
  children,
  id,
  className,
}) => {
  const sizeClasses = `section-${size}`;
  const bgClasses = `bg-${bg}`;

  return (
    <section id={id} className={cn('section', sizeClasses, bgClasses, className)}>
      {children}
    </section>
  );
};
