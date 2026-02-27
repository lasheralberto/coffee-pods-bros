import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Grid } from '../ui/Grid';
import { Stack } from '../ui/Stack';
import { Coffee, Package, Smile } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: 1,
      icon: <Coffee size={32} className="text-roast" />,
      title: 'Haz el Quiz',
      description: 'Responde 6 preguntas rápidas para que conozcamos tus gustos y preferencias.',
    },
    {
      id: 2,
      icon: <Package size={32} className="text-roast" />,
      title: 'Recibe tu Café',
      description: 'Te enviamos una selección personalizada de los mejores tostadores de España.',
    },
    {
      id: 3,
      icon: <Smile size={32} className="text-roast" />,
      title: 'Disfruta',
      description: 'Prepara tu taza perfecta y descubre nuevos sabores cada mes. Sin permanencia.',
    },
  ];

  return (
    <Section bg="mist" size="lg">
      <Container size="xl">
        <div className="text-center mb-16">
          <span className="label-caps text-roast mb-2 block">CÓMO FUNCIONA</span>
          <h2 className="heading-section">Tu café ideal en 3 pasos</h2>
        </div>

        <Grid cols={3} gap={8} className="items-start">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-6 -left-6 font-display italic text-8xl text-foam -z-10 select-none">
                {step.id}
              </div>
              <Stack gap={4} align="center" className="text-center">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-2">
                  {step.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-espresso">
                  {step.title}
                </h3>
                <p className="body-lg text-stone-600">
                  {step.description}
                </p>
              </Stack>
            </motion.div>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};
