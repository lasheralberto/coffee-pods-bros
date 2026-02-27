import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StickyCtaMobileProps {
  children: React.ReactNode;
  visible?: boolean;
}

export const StickyCtaMobile: React.FC<StickyCtaMobileProps> = ({
  children,
  visible = true,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sticky-cta-mobile md:hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
