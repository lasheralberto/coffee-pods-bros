import React from 'react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useQuizStore } from '../stores/quizStore';

export const SubscriptionsPage: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <Section size="lg">
      <Container size="xl">
        <h1 className="heading-display text-5xl mb-6">Suscripciones</h1>
        <p className="body-lg mb-8">
          Recibe café fresco en tu puerta con la frecuencia que elijas.
        </p>
        <Button variant="primary" size="lg" onClick={actions.openQuiz}>
          Empezar Quiz para Suscripción
        </Button>
      </Container>
    </Section>
  );
};
