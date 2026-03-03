import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

export const OurStoryPage: React.FC = () => {
  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.span variants={childVariants} className="badge badge-outline mb-4">
            {t('ourStory.badge')}
          </motion.span>

          <motion.h1 variants={childVariants} className="heading-display text-5xl md:text-6xl mb-6">
            {t('ourStory.heading')}
          </motion.h1>

          <motion.p variants={childVariants} className="body-lg max-w-3xl mb-10">
            {t('ourStory.intro')}
          </motion.p>

          <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="flat" className="bg-[var(--color-foam)] border border-[var(--border-color)]">
              <h2 className="heading-section text-2xl mb-3">{t('ourStory.value1Title')}</h2>
              <p className="body-lg">{t('ourStory.value1Text')}</p>
            </Card>

            <Card variant="flat" className="bg-[var(--color-foam)] border border-[var(--border-color)]">
              <h2 className="heading-section text-2xl mb-3">{t('ourStory.value2Title')}</h2>
              <p className="body-lg">{t('ourStory.value2Text')}</p>
            </Card>

            <Card variant="flat" className="bg-[var(--color-foam)] border border-[var(--border-color)]">
              <h2 className="heading-section text-2xl mb-3">{t('ourStory.value3Title')}</h2>
              <p className="body-lg">{t('ourStory.value3Text')}</p>
            </Card>
          </motion.div>

          <motion.div variants={childVariants} className="mt-10 rounded-3xl bg-[var(--color-espresso)] p-8 md:p-10">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-highlight)] mb-3">
              {t('ourStory.closingBadge')}
            </p>
            <p className="text-cream text-lg md:text-xl leading-relaxed max-w-4xl">
              {t('ourStory.closingText')}
            </p>
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
