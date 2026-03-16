import React from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { Testimonials } from '../components/home/Testimonials';
import { OriginsGrid } from '../components/home/OriginsGrid';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useQuizStore } from '../stores/quizStore';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

export const HomePage: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <PageTransition>
      <motion.div variants={childVariants}><Hero /></motion.div>
      <motion.div variants={childVariants}><HowItWorks /></motion.div>
      <motion.div variants={childVariants}><OriginsGrid /></motion.div>
      <motion.div variants={childVariants}><Testimonials /></motion.div>
      
      {/* Final CTA */}
      <motion.div variants={childVariants}>
        <Section
          size="lg"
          bg="roast"
          className="text-center text-cream bg-[linear-gradient(135deg,var(--color-roast),var(--color-espresso))]"
        >
          <Container size="md">
            <h2 className="font-display text-5xl md:text-6xl uppercase tracking-[0.02em] mb-6">
              {t('homeCta.heading')}
            </h2>
            <p className="body-lg text-cream/85 mb-8 max-w-2xl mx-auto">
              {t('homeCta.text')}
            </p>
            <Button variant="inverse" size="lg" onClick={actions.openQuiz}>
              {t('homeCta.button')}
            </Button>
          </Container>
        </Section>
      </motion.div>
    </PageTransition>
  );
};
