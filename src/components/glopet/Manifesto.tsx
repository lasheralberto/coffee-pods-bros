// Manifesto.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '../../stores/quizStore';

export const Manifesto: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <section
      id="manifiesto"
      className="mt-20 flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--bg-page)', padding: '80px 5%' }}
    >
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.2, 0.65, 0.2, 1] }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Café diseñado para ti
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.85, ease: [0.2, 0.65, 0.2, 1], delay: 0.1 }}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(2rem, 4vw, 3.4rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: 'var(--color-espresso)',
          letterSpacing: '0.01em',
          maxWidth: '18ch',
          marginBottom: 'var(--space-8)',
        }}
      >
        Descubre el café que encaja con tu ritmo.
      </motion.h2>

      <motion.button
        type="button"
        onClick={actions.openQuiz}
        className="btn btn-accent btn-xl"
        style={{ padding: '1rem 3rem', fontSize: 'var(--text-base)', minHeight: '56px' }}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 }}
        whileHover={{ scale: 1.04, boxShadow: '0 12px 36px rgba(196, 118, 58, 0.45)' }}
        whileTap={{ scale: 0.97 }}
      >
        Hacer el quiz
      </motion.button>
    </section>
  );
};