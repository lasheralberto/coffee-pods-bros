import React, { useMemo } from 'react';
import { t } from '../../data/texts';
import { gsap, useGSAP } from '../../lib/gsap';
import { XCard, type XCardProps } from '../ui/x-gradient-card';

const AVATAR_STOCK = {
  marta: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=75',
  jordi: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=75',
  ana: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=75',
} as const;

export const Testimonials: React.FC = React.memo(() => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const introRef = React.useRef<HTMLDivElement | null>(null);
  const cardsRef = React.useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-testimonial-intro] > *', { clearProps: 'all', autoAlpha: 1 });
        gsap.set('[data-testimonial-card]', { clearProps: 'all', autoAlpha: 1 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-testimonial-intro] > *',
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introRef.current,
              start: 'top 84%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-testimonial-card]',
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 84%',
              once: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const xCards = useMemo<XCardProps[]>(() => [
    {
      link: 'https://x.com/dorian_baffier/status/1880291036410572934',
      authorName: t('testimonials.review1Name'),
      authorHandle: 'marta_glopet',
      authorImage: AVATAR_STOCK.marta,
      content: [t('testimonials.review1Quote')],
      isVerified: true,
      timestamp: 'Jan 18, 2026',
      reply: {
        authorName: t('footer.brand'),
        authorHandle: 'glopet',
        authorImage: AVATAR_STOCK.jordi,
        content: t('testimonials.review2Quote'),
        isVerified: true,
        timestamp: 'Jan 18',
      },
    },
    {
      link: 'https://x.com/serafimcloud/status/1880291036410572934',
      authorName: t('testimonials.review3Name'),
      authorHandle: 'ana_glopet',
      authorImage: AVATAR_STOCK.ana,
      content: [t('testimonials.review3Quote')],
      isVerified: true,
      timestamp: 'Apr 6, 2026',
      reply: {
        authorName: t('footer.brand'),
        authorHandle: 'glopet',
        authorImage: AVATAR_STOCK.marta,
        content: t('testimonials.review1Quote'),
        isVerified: true,
        timestamp: 'Apr 7',
      },
    },
  ], []);

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="mt-20 px-4 md:px-10 lg:px-16 py-20"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div
          ref={introRef}
          data-testimonial-intro
          className="text-center mb-14"
        >
          <p
            className="uppercase tracking-[0.24em] text-xs mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {t('testimonials.badge')}
          </p>
          <h2
            className="glopet-title text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1]"
            style={{ color: 'var(--color-espresso)' }}
          >
            {t('testimonials.heading')}
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="flex gap-5 overflow-x-auto px-1 pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none"
        >
          {xCards.map((card) => (
            <div
              key={card.authorHandle}
              data-testimonial-card
              className="snap-start shrink-0 w-[90%] sm:w-[78%] md:w-[68%] lg:w-full lg:min-w-0"
            >
              <XCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
