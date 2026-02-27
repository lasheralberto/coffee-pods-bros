import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoadingStore } from '../../stores/loadingStore';

/**
 * Apple-style global loading indicator.
 * Thin progress bar at the very top of the viewport with an indeterminate
 * shimmer animation — minimal, elegant, non-intrusive.
 */
export const GlobalLoadingBar: React.FC = () => {
  const isLoading = useLoadingStore((s) => s.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="global-loading-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          <motion.div
            className="global-loading-bar__track"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: [0.45, 0, 0.55, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
