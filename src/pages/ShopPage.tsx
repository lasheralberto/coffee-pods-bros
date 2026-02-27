import React from 'react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';

export const ShopPage: React.FC = () => {
  return (
    <Section size="lg">
      <Container size="xl">
        <h1 className="heading-display text-5xl mb-6">Tienda</h1>
        <p className="body-lg">Explora nuestra selección de cafés de especialidad.</p>
        {/* Placeholder content */}
        <div className="mt-12 p-12 border-2 border-dashed border-border-color rounded-xl flex items-center justify-center text-muted">
          Próximamente: Catálogo completo de productos
        </div>
      </Container>
    </Section>
  );
};
