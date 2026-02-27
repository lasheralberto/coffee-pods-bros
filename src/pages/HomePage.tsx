import React from 'react';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { Testimonials } from '../components/home/Testimonials';
import { OriginsGrid } from '../components/home/OriginsGrid';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useQuizStore } from '../stores/quizStore';

export const HomePage: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <>
      <Hero />
      <HowItWorks />
      <OriginsGrid />
      <Testimonials />
      
      {/* Final CTA */}
      <Section size="lg" bg="roast" className="text-center text-cream">
        <Container size="md">
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            ¿Listo para tu mejor café?
          </h2>
          <p className="body-lg text-cream/80 mb-8 max-w-2xl mx-auto">
            Únete a más de 10.000 amantes del café que reciben granos frescos cada mes.
            Sin permanencia, cancela cuando quieras.
          </p>
          <Button variant="inverse" size="xl" onClick={actions.openQuiz}>
            EMPEZAR AHORA
          </Button>
        </Container>
      </Section>
    </>
  );
};
