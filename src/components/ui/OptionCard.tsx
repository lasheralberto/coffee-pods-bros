import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OptionCardProps {
  emoji: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  emoji,
  label,
  sublabel,
  selected,
  onClick,
  multiSelect = false,
}) => {
  return (
    <motion.div
      className={cn('option-card', selected && 'selected')}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="option-emoji">{emoji}</div>
      <div className="flex-1">
        <div className="option-label">{label}</div>
        {sublabel && <div className="option-sub">{sublabel}</div>}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-espresso"
          >
            {multiSelect ? (
              <div className="w-5 h-5 bg-roast rounded-full flex items-center justify-center">
                <Check size={12} color="white" />
              </div>
            ) : (
              <Check size={20} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
