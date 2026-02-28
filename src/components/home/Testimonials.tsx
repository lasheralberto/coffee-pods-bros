import React from 'react';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { t } from '../../data/texts';

const PILLARS = [
  {
    id: 1,
    titleKey: 'difference.pillar1.title',
    textKey: 'difference.pillar1.text',
    image: 'https://images.unsplash.com/photo-1522992319-0365e5f11656?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 2,
    titleKey: 'difference.pillar2.title',
    textKey: 'difference.pillar2.text',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&crop=center',
  },
  {
    id: 3,
    titleKey: 'difference.pillar3.title',
    textKey: 'difference.pillar3.text',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=faces',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <Section size="lg" bg="page">
      <Container size="xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="label-caps text-roast mb-3 block tracking-[0.25em]">
            {t('difference.badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] text-espresso leading-tight max-w-3xl mx-auto">
            {t('difference.heading')}
          </h2>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-14">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="flex flex-col items-center text-center">
              {/* Circular image */}
              <div className="w-48 h-48 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full overflow-hidden mb-8 shadow-lg">
                <img
                  src={pillar.image}
                  alt={t(pillar.titleKey)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Title */}
              <h3 className="font-display text-xl md:text-lg lg:text-2xl font-bold text-espresso mb-4 leading-snug max-w-[260px]">
                {t(pillar.titleKey)}
              </h3>

              {/* Description */}
              <p className="body-base text-muted leading-relaxed max-w-xs">
                {t(pillar.textKey)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
