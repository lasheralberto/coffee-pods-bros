import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star } from 'lucide-react';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { t } from '../../data/texts';

const TESTIMONIALS = [
  {
    id: 1,
    nameKey: 'testimonials.elena.name' as const,
    cityKey: 'testimonials.elena.city' as const,
    textKey: 'testimonials.elena.text' as const,
    coffeeKey: 'testimonials.elena.coffee' as const,
    avatar: 'https://i.pravatar.cc/150?u=elena',
  },
  {
    id: 2,
    nameKey: 'testimonials.marc.name' as const,
    cityKey: 'testimonials.marc.city' as const,
    textKey: 'testimonials.marc.text' as const,
    coffeeKey: 'testimonials.marc.coffee' as const,
    avatar: 'https://i.pravatar.cc/150?u=marc',
  },
  {
    id: 3,
    nameKey: 'testimonials.lucia.name' as const,
    cityKey: 'testimonials.lucia.city' as const,
    textKey: 'testimonials.lucia.text' as const,
    coffeeKey: 'testimonials.lucia.coffee' as const,
    avatar: 'https://i.pravatar.cc/150?u=lucia',
  },
  {
    id: 4,
    nameKey: 'testimonials.javier.name' as const,
    cityKey: 'testimonials.javier.city' as const,
    textKey: 'testimonials.javier.text' as const,
    coffeeKey: 'testimonials.javier.coffee' as const,
    avatar: 'https://i.pravatar.cc/150?u=javier',
  },
  {
    id: 5,
    nameKey: 'testimonials.ana.name' as const,
    cityKey: 'testimonials.ana.city' as const,
    textKey: 'testimonials.ana.text' as const,
    coffeeKey: 'testimonials.ana.coffee' as const,
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
          <span className="label-caps text-roast mb-2 block">{t('testimonials.badge')}</span>
          <h2 className="heading-section">{t('testimonials.heading')}</h2>
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
                    <p className="body-lg italic mb-6">"{t(testimonial.textKey)}"</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar
                      src={testimonial.avatar}
                      alt={t(testimonial.nameKey)}
                      className="w-12 h-12 border border-border-color"
                    />
                    <div>
                      <p className="font-display font-bold text-espresso leading-none">
                        {t(testimonial.nameKey)}
                      </p>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wide">
                        {t(testimonial.cityKey)} · {t('testimonials.subscriberOf')} {t(testimonial.coffeeKey)}
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
