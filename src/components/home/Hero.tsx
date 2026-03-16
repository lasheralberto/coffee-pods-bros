import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gauge, Mountain, Timer } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { AwardSeal } from '../ui/AwardSeal';
import { useQuizStore } from '../../stores/quizStore';
import { t } from '../../data/texts';

import img3 from '@/assets/images/3.jpg';

export const Hero: React.FC = () => {
  const { actions } = useQuizStore();
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center p-3 sm:p-5 lg:p-8">
      <div className="absolute inset-3 sm:inset-5 lg:inset-8 z-0 overflow-hidden rounded-[2.75rem] border border-white/35 shadow-2xl bg-slate-900">
        <motion.img
          src={img3}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{
            opacity: reduceMotion ? 1 : 0,
            scale: reduceMotion ? 1 : 1.08,
            filter: reduceMotion ? 'brightness(1) saturate(1)' : 'brightness(0.36) saturate(0.75)'
          }}
          animate={{ opacity: 1, scale: 1, filter: 'brightness(1) saturate(1)' }}
          transition={{
            opacity: { duration: reduceMotion ? 0 : 1.6, ease: 'easeOut' },
            scale: { duration: reduceMotion ? 0 : 5.2, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: reduceMotion ? 0 : 4.8, ease: [0.22, 1, 0.36, 1] }
          }}
        />

        <motion.div
          className="absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(circle at 60% 32%, rgba(20,209,255,0.12) 0%, rgba(3,10,18,0.84) 68%), linear-gradient(165deg, rgba(5,14,24,0.6) 0%, rgba(6,14,25,0.88) 65%)',
          }}
          initial={{ opacity: reduceMotion ? 1 : 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(217,255,72,0.10),transparent_35%),linear-gradient(0deg,rgba(0,0,0,0.38),transparent_55%)] z-20" />
      </div>

      <Container size="xl" className="relative z-20 flex flex-col md:items-center md:text-center w-full max-w-5xl mx-auto py-16 md:py-20 px-2">
        <div className="flex flex-col gap-6 w-full md:items-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-[var(--color-highlight)]"
          >
            {t('hero.subtitle')}
          </motion.span>

          <h1 className="font-display font-semibold text-[3.1rem] sm:text-[4.1rem] md:text-[5.2rem] lg:text-[6rem] leading-[0.9] tracking-tight text-espresso uppercase">
            <motion.span
              className="block text-white drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine1')}
            </motion.span>
            <motion.span
              className="block drop-shadow-sm"
              style={{ color: 'var(--color-accent)' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine2')}
            </motion.span>
            <motion.span
              className="block text-white drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine3')}
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-2 items-center justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={actions.openQuiz}
              className="border-2 border-[var(--color-highlight)] animate-cadence-pulse"
            >
              {t('hero.cta')}
            </Button>
            <div className="flex flex-row flex-wrap gap-2 text-xs sm:text-sm text-white/80 font-medium justify-center">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                <Mountain size={14} />
                <span className="font-bold text-white">900m</span> <span>{t('hero.statRoasters')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                <Gauge size={14} />
                <span className="font-bold text-white">245w</span> <span>{t('hero.statSubscribers')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                <Timer size={14} />
                <span className="font-bold text-white">48h</span> <span>{t('hero.statRating')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute -bottom-12 md:-bottom-20 right-4 md:right-8 z-20 animate-peloton-float"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
        >
          <AwardSeal
            text={t('hero.awardText')}
            centerText={t('hero.awardCenter')}
            size="sm"
            className="bg-cream/95 shadow-2xl border border-white/30"
          />
        </motion.div>
      </Container>
    </section>
  );
};
