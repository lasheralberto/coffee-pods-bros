import React from 'react';
import { motion } from 'framer-motion';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pageVariants = {
  hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: prefersReduced ? 0 : -12,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
};

/** Wrap each page's content to get a shared entrance/exit animation. */
export const childVariants = {
  hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    variants={pageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);
