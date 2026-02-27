import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';

const ORIGINS = [
  {
    id: 1,
    country: 'Etiopía',
    region: 'Yirgacheffe',
    altitude: '2000m',
    process: 'Natural',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  },
  {
    id: 2,
    country: 'Colombia',
    region: 'Huila',
    altitude: '1750m',
    process: 'Honey',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  },
  {
    id: 3,
    country: 'Brasil',
    region: 'Cerrado',
    altitude: '1200m',
    process: 'Pulped Natural',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  },
  {
    id: 4,
    country: 'Kenya',
    region: 'Nyeri',
    altitude: '1800m',
    process: 'Washed',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
  },
];

export const OriginsGrid: React.FC = () => {
  return (
    <Section size="lg" bg="surface">
      <Container size="xl">
        <div className="text-center mb-16">
          <span className="label-caps text-roast mb-2 block">NUESTROS ORÍGENES</span>
          <h2 className="heading-section">Viaja en cada taza</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ORIGINS.map((origin) => (
            <motion.div
              key={origin.id}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={origin.image}
                alt={origin.country}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-cream transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="font-mono text-xs uppercase tracking-widest text-caramel mb-2 block">
                  {origin.region} · {origin.altitude}
                </span>
                <h3 className="font-display text-4xl mb-4">{origin.country}</h3>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <Button variant="inverse" size="sm">
                    Explorar Origen
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
