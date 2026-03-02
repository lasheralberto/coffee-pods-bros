import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { AwardSeal } from '../ui/AwardSeal';
import { useQuizStore } from '../../stores/quizStore';
import { t } from '../../data/texts';

import img3 from '@/assets/images/3.jpg';

export const Hero: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Image */}
      <div className="absolute inset-4 sm:inset-6 lg:inset-8 z-0 overflow-hidden rounded-[2.5rem] border border-stone-200/50 shadow-2xl bg-stone-100">
        <motion.img
          src={img3}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            opacity: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: 2, ease: "easeOut" }
          }}
        />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/35 to-stone-900/65 z-20" />
      </div>

      <Container size="xl" className="relative z-20 flex flex-col md:items-center md:text-center w-full max-w-4xl mx-auto py-20 px-4">
        <div className="flex flex-col gap-8 w-full md:items-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-mono uppercase tracking-widest text-[var(--color-highlight)]"
          >
            {t('hero.subtitle')}
          </motion.span>

          <h1 className="font-display font-light text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-espresso">
            <motion.span
              className="block font-bold text-white drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine1')}
            </motion.span>
            <motion.span
              className="block italic drop-shadow-sm"
              style={{ color: 'var(--color-highlight)' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine2')}
            </motion.span>
            <motion.span
              className="block font-bold text-white drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine3')}
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 mt-4 items-center justify-center"
          >
            <Button
              variant="primary"
              size="xl"
              onClick={actions.openQuiz}
              className="border-2 border-[var(--color-highlight)]"
            >
              {t('hero.cta')}
            </Button>
            <div className="flex flex-row gap-4 text-sm text-stone-600 font-medium">
              <div className="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="font-bold text-espresso">50+</span> <span className="hidden sm:inline">{t('hero.statRoasters')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="font-bold text-espresso">10k</span> <span className="hidden sm:inline">{t('hero.statSubscribers')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="font-bold text-espresso">4.9★</span> <span className="hidden sm:inline">{t('hero.statRating')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute -bottom-16 md:-bottom-24 right-4 md:-right-12 z-20"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        >
          <AwardSeal
            text={t('hero.awardText')}
            centerText={t('hero.awardCenter')}
            size="md"
            className="bg-cream shadow-2xl"
          />
        </motion.div>
      </Container>
    </section>
  );
};
