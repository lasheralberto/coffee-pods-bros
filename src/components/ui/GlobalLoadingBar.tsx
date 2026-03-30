import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Waves } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useLoadingStore } from '../../stores/loadingStore';
import { LumaSpin } from './luma-spin';

export const GlobalLoadingBar: React.FC = () => {
  const appLoading = useLoadingStore((s) => s.isLoading);
  const authLoading = useAuthStore((s) => s.isLoading);
  const chatLoading = useChatStore((s) => s.loading || s.sending);
  const isLoading = appLoading || authLoading || chatLoading;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[160] flex items-center justify-center overflow-hidden bg-[rgba(250,246,239,0.64)] backdrop-blur-[8px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,200,122,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(196,118,58,0.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(26,58,92,0.18),transparent_40%)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(28,20,16,0.7)_0.45px,transparent_0.45px)] [background-size:3px_3px]" />
          <motion.div
            className="relative flex w-[min(92vw,360px)] flex-col items-center gap-4 overflow-hidden rounded-[30px] border border-[rgba(196,118,58,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,246,239,0.94))] px-7 py-6 shadow-[0_26px_70px_rgba(26,58,92,0.18)]"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            aria-live="polite"
            aria-label="Cargando contenido"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,200,122,0.95),transparent)]" />
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(240,200,122,0.18)] blur-2xl" />
            <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[rgba(26,58,92,0.12)] blur-2xl" />

            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(196,118,58,0.24)] bg-[rgba(250,246,239,0.85)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-roast)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Waves size={12} strokeWidth={2} />
              Ritual Mediterraneo
            </span>

            <LumaSpin className="mt-1" />

            <div className="text-center">
              <p className="font-[\'Playfair_Display\',Georgia,serif] text-[1.55rem] leading-none text-[var(--color-roast)]">
                Preparando tu cafe
              </p>
              <p className="mt-2 max-w-[24ch] text-sm leading-6 text-[var(--text-secondary)]">
                Cargando contenido con la calma de la costa y el ritmo tostado de la casa.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
