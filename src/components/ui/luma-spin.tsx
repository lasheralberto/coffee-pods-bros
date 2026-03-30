import React from 'react';
import { cn } from '@/lib/utils';

const lumaSpinStyles = `
  @keyframes luma-loader-anim {
    0% {
      inset: 0 35px 35px 0;
    }
    12.5% {
      inset: 0 35px 0 0;
    }
    25% {
      inset: 35px 35px 0 0;
    }
    37.5% {
      inset: 35px 0 0 0;
    }
    50% {
      inset: 35px 0 0 35px;
    }
    62.5% {
      inset: 0 0 0 35px;
    }
    75% {
      inset: 0 0 35px 35px;
    }
    87.5% {
      inset: 0 0 35px 0;
    }
    100% {
      inset: 0 35px 35px 0;
    }
  }

  .luma-loader__ring {
    animation: luma-loader-anim 2.5s infinite;
    box-shadow: inset 0 0 0 3px var(--color-roast);
  }

  .luma-loader__ring--echo {
    box-shadow: inset 0 0 0 3px rgba(var(--color-accent-rgb), 0.92);
  }

  .luma-loader__core {
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), transparent 38%),
      radial-gradient(circle at 70% 70%, rgba(240, 200, 122, 0.38), transparent 40%),
      linear-gradient(145deg, rgba(250, 246, 239, 0.9), rgba(240, 232, 216, 0.55));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }
`;

type LumaSpinProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const LumaSpin: React.FC<LumaSpinProps> = ({ className, label = 'Cargando', ...props }) => {
  return (
    <div
      className={cn('relative aspect-square w-[72px]', className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span
        aria-hidden="true"
        className="luma-loader__ring absolute rounded-[50px]"
      />
      <span
        aria-hidden="true"
        className="luma-loader__ring luma-loader__ring--echo absolute rounded-[50px]"
        style={{ animationDelay: '-1.25s' }}
      />
      <span
        aria-hidden="true"
        className="luma-loader__core absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      <style>{lumaSpinStyles}</style>
    </div>
  );
};

export const Component = LumaSpin;