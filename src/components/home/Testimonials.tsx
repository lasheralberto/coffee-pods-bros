import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star } from 'lucide-react';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Elena R.',
    city: 'Madrid',
    text: 'Descubrí sabores que no sabía que existían en el café. Cada mes es una sorpresa deliciosa.',
    coffee: 'Ethiopia Yirgacheffe',
    avatar: 'https://i.pravatar.cc/150?u=elena',
  },
  {
    id: 2,
    name: 'Marc S.',
    city: 'Barcelona',
    text: 'La flexibilidad de pausar cuando viajo es lo mejor. Y el café... simplemente otro nivel.',
    coffee: 'Colombia Huila',
    avatar: 'https://i.pravatar.cc/150?u=marc',
  },
  {
    id: 3,
    name: 'Lucía M.',
    city: 'Valencia',
    text: 'Nunca pensé que haría café tan bueno en casa. Las guías de preparación ayudan muchísimo.',
    coffee: 'Brasil Cerrado',
    avatar: 'https://i.pravatar.cc/150?u=lucia',
  },
  {
    id: 4,
    name: 'Javier P.',
    city: 'Sevilla',
    text: 'Calidad precio inmejorable para café de especialidad. El envío siempre llega a tiempo.',
    coffee: 'Blend Misterio',
    avatar: 'https://i.pravatar.cc/150?u=javier',
  },
  {
    id: 5,
    name: 'Ana B.',
    city: 'Bilbao',
    text: 'Me encanta leer la historia detrás de cada productor. Te conecta con lo que bebes.',
    coffee: 'Kenya AA',
    avatar: 'https://i.pravatar.cc/150?u=ana',
  },
];

export const Testimonials: React.FC = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  return (
    <Section size="lg" bg="page">
      <Container size="xl">
        <div className="text-center mb-12">
          <span className="label-caps text-roast mb-2 block">LO QUE DICEN</span>
          <h2 className="heading-section">La comunidad Origen</h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 pl-4"
              >
                <Card variant="flat" className="h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="flex gap-1 mb-4 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="body-lg italic mb-6">"{testimonial.text}"</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 border border-border-color"
                    />
                    <div>
                      <p className="font-display font-bold text-espresso leading-none">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wide">
                        {testimonial.city} · Suscriptor de {testimonial.coffee}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};
