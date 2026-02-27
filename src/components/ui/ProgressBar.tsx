import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressBarProps {
  value: number;
  label?: string;
  showDots?: boolean;
  steps?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showDots = false,
  steps = 6,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <div className="flex justify-between items-center text-xs font-mono text-muted uppercase tracking-wider">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <Progress.Root className="progress-track w-full" value={value}>
        <Progress.Indicator
          className="progress-fill bg-roast h-full transition-all duration-500 ease-out"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </Progress.Root>
      {showDots && (
        <div className="flex justify-between mt-1">
          {Array.from({ length: steps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors duration-300',
                i < (value / 100) * steps ? 'bg-roast' : 'bg-foam'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
