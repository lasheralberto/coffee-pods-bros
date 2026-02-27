import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AwardSealProps {
  text: string;
  centerText: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'roast' | 'leaf' | 'accent';
  className?: string;
}

export const AwardSeal: React.FC<AwardSealProps> = ({
  text,
  centerText,
  subtext,
  size = 'md',
  color = 'roast',
  className,
}) => {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  const radius = sizeMap[size] / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 border-dashed border-roast',
        `w-${sizeMap[size]} h-${sizeMap[size]}`,
        className
      )}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          className="overflow-visible"
        >
          <path
            id="curve"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="transparent"
          />
          <text width="100%">
            <textPath
              href="#curve"
              className="text-[10px] font-mono uppercase tracking-widest fill-current text-roast"
              startOffset="50%"
              textAnchor="middle"
            >
              {text}
            </textPath>
          </text>
        </svg>
      </motion.div>
      <div className="flex flex-col items-center justify-center z-10 bg-cream rounded-full p-2">
        <span className="font-display font-bold text-xl text-roast leading-none">
          {centerText}
        </span>
        {subtext && (
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider mt-1">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
