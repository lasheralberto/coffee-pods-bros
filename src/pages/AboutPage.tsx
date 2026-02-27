import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

export const AboutPage: React.FC = () => {
  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.h1 variants={childVariants} className="heading-display text-5xl mb-6">{t('about.heading')}</motion.h1>
          <motion.p variants={childVariants} className="body-lg max-w-2xl">
            {t('about.intro')}
          </motion.p>
          <motion.div variants={childVariants} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-video bg-foam rounded-xl flex items-center justify-center text-muted">
              {t('about.teamImage')}
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="heading-section mb-4">{t('about.missionHeading')}</h2>
              <p className="body-lg">
                {t('about.missionText')}
              </p>
            </div>
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
