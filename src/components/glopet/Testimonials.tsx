import React from 'react';
import { t } from '../../data/texts';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';
import { CircularTestimonials } from '../ui/circular-testimonials';

const TESTIMONIALS = [
  {
    quoteKey: 'review1Quote',
    nameKey: 'review1Name',
    roleKey: 'review1Role',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  },
  {
    quoteKey: 'review2Quote',
    nameKey: 'review2Name',
    roleKey: 'review2Role',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80',
  },
  {
    quoteKey: 'review3Quote',
    nameKey: 'review3Name',
    roleKey: 'review3Role',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&q=80',
  },
] as const;

export const Testimonials: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const introRef = React.useRef<HTMLDivElement | null>(null);

  ensureGsapPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-testimonial-intro] > *', { clearProps: 'all', autoAlpha: 1 });
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
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const testimonialData = TESTIMONIALS.map((item) => ({
    quote: t(`testimonials.${item.quoteKey}`),
    name: t(`testimonials.${item.nameKey}`),
    designation: t(`testimonials.${item.roleKey}`),
    src: item.src,
  }));

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

        {/* Circular testimonials carousel */}
        <div className="flex justify-center">
          <CircularTestimonials
            testimonials={testimonialData}
            autoplay={true}
            colors={{
              name: '#1c1410',
              designation: '#7a6a5a',
              testimony: '#3f342d',
              arrowBackground: '#1c1410',
              arrowForeground: '#faf6ef',
              arrowHoverBackground: '#c4763a',
            }}
            fontSizes={{
              name: '1.6rem',
              designation: '0.9rem',
              quote: '1.05rem',
            }}
          />
        </div>
      </div>
    </section>
  );
};


