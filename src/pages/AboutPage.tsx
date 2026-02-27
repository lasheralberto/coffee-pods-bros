import React from 'react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';

export const AboutPage: React.FC = () => {
  return (
    <Section size="lg">
      <Container size="xl">
        <h1 className="heading-display text-5xl mb-6">Nosotros</h1>
        <p className="body-lg max-w-2xl">
          Somos un equipo de apasionados por el café, dedicados a conectar a los mejores tostadores locales con amantes del café como tú.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-video bg-foam rounded-xl flex items-center justify-center text-muted">
            Imagen de equipo
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="heading-section mb-4">Nuestra Misión</h2>
            <p className="body-lg">
              Democratizar el acceso al café de especialidad y apoyar a los productores y tostadores que hacen las cosas bien.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};
