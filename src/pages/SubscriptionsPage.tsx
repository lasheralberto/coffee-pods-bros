import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useQuizStore } from '../stores/quizStore';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

export const SubscriptionsPage: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.h1 variants={childVariants} className="heading-display text-5xl mb-6">{t('subscriptions.heading')}</motion.h1>
          <motion.p variants={childVariants} className="body-lg mb-8">
            {t('subscriptions.intro')}
          </motion.p>
          <motion.div variants={childVariants}>
            <Button variant="primary" size="lg" onClick={actions.openQuiz}>
              {t('subscriptions.startQuiz')}
            </Button>
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
