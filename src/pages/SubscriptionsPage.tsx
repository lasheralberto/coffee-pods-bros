import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { PricingDemo } from '../components/ui/PricingDemo';
import { t } from '../data/texts';

export const SubscriptionsPage: React.FC = () => {
  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.h1 variants={childVariants} className="heading-display text-5xl mb-6">{t('subscriptions.heading')}</motion.h1>
          <motion.p variants={childVariants} className="body-lg mb-8">
            {t('subscriptions.intro')}
          </motion.p>
          <motion.div variants={childVariants}>
            <PricingDemo />
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
