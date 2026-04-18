import React from 'react';
import { Button } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap, useGSAP } from '../../lib/gsap';

export const CallToAction: React.FC = React.memo(() => {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-cta-el]', { clearProps: 'all', autoAlpha: 1 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-cta-el]',
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="cta-final"
      className="relative overflow-hidden py-28 sm:py-36 lg:py-44"
      style={{
        background: [
          'radial-gradient(ellipse at 20% 80%, rgba(123,88,0,0.20) 0%, transparent 50%)',
          'radial-gradient(ellipse at 78% 18%, rgba(196,245,219,0.08) 0%, transparent 50%)',
          'linear-gradient(150deg, var(--ds-primary) 0%, var(--ds-primary-container) 60%, #2a6452 100%)',
        ].join(', '),
      }}
    >
      {/* Grain texture */}
      <div className="glopet-grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[800px] px-6 md:px-12 text-center">
        <p
          data-cta-el
          className="text-[0.68rem] uppercase tracking-[0.3em] font-medium mb-6"
          style={{ color: '#e8c88a', fontFamily: 'var(--font-body)' }}
        >
          Glopet
        </p>
        <h2
          data-cta-el
          className="glopet-title text-[2.6rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[0.95] text-white"
        >
          Tu próxima sobremesa
          <br />
          empieza aquí.
        </h2>
        <p
          data-cta-el
          className="mt-6 md:mt-8 text-[1.05rem] md:text-[1.15rem] leading-relaxed mx-auto max-w-[42ch]"
          style={{ color: 'rgba(250,246,239,0.7)', fontFamily: 'var(--font-body)' }}
        >
          Elige tu bolsa o suscríbete y recibe café fresco de costa en casa cada mes.
        </p>
        <div data-cta-el className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button
            as={RouterLink}
            to="/shop"
            size="lg"
            radius="full"
            className="font-bold px-10 py-6 text-[0.85rem] tracking-wide text-[#1c1410] bg-white hover:bg-[#f5ead9] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            endContent={<ArrowRight size={16} />}
          >
            Comprar ahora
          </Button>
          <Button
            as={RouterLink}
            to="/subscriptions"
            variant="bordered"
            size="lg"
            radius="full"
            className="px-8 py-6 text-[0.85rem] border-white/30 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300 tracking-wide"
          >
            Ver suscripciones
          </Button>
        </div>
      </div>
    </section>
  );
});
