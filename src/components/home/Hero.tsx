import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { AwardSeal } from '../ui/AwardSeal';
import { useQuizStore } from '../../stores/quizStore';
import { t } from '../../data/texts';

export const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const { actions } = useQuizStore();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <Container size="xl" className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-mono uppercase tracking-widest text-roast"
          >
            {t('hero.subtitle')}
          </motion.span>

          <h1 className="font-display font-light text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-espresso">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine1')}
            </motion.span>
            <motion.span
              className="block italic text-roast"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {t('hero.headingLine2')}
            </motion.span>
            <motion.span
              className="block"
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
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <Button variant="primary" size="xl" onClick={actions.openQuiz} className="hidden md:inline-flex">
              {t('hero.cta')}
            </Button>
            <div className="flex flex-col gap-1 text-xs text-stone-500 md:ml-4">
              <div className="flex items-center gap-1">
                <span className="font-bold text-espresso">50+</span> {t('hero.statRoasters')}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-espresso">10k</span> {t('hero.statSubscribers')}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-espresso">4.9★</span> {t('hero.statRating')}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Image) */}
        <div className="relative h-[50vh] lg:h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl">
          <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80"
              alt={t('hero.imgAlt')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-espresso/10" />
          </motion.div>

          <div className="absolute bottom-8 right-8 z-20">
            <AwardSeal
              text={t('hero.awardText')}
              centerText={t('hero.awardCenter')}
              size="md"
              className="bg-cream shadow-lg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};
