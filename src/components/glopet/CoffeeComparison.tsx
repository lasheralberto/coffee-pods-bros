import React from 'react';
import { X, Check } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';

type ComparisonRow = {
  painLabel: string;
  genericStat: string;
  genericDesc: string;
  glopetStat: string;
  glopetDesc: string;
};

const ROWS: readonly ComparisonRow[] = [
  {
    painLabel: 'Frescura',
    genericStat: '+60 días',
    genericDesc: 'En el lineal meses antes de llegar a ti.',
    glopetStat: '≤7 días',
    glopetDesc: 'Tostado esta semana. En tu puerta.',
  },
  {
    painLabel: 'Origen',
    genericStat: '¿?',
    genericDesc: 'Blend anónimo, sin datos de procedencia.',
    glopetStat: 'Trazado',
    glopetDesc: 'Finca, varietal y proceso en cada bolsa.',
  },
  {
    painLabel: 'Flexibilidad',
    genericStat: 'Fijo',
    genericDesc: 'Formatos rígidos que no se adaptan a ti.',
    glopetStat: 'Sin ataduras',
    glopetDesc: 'Pausa o cancela cuando quieras.',
  },
] as const;

const ComparisonCard: React.FC<ComparisonRow & { index: number }> = ({
  painLabel,
  genericStat,
  genericDesc,
  glopetStat,
  glopetDesc,
  index,
}) => (
  <div
    data-comparison-card
    data-comparison-index={index}
    className="overflow-hidden rounded-[1.2rem] will-change-transform"
    style={{
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(4px)',
      perspective: '1200px',
    }}
  >
    {/* Label row — tonal background shift instead of border */}
    <div
      className="px-4 py-2.5 sm:px-5"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
        style={{ color: '#c4f5db', fontFamily: 'var(--font-label)' }}
      >
        {painLabel}
      </p>
    </div>

    {/* Two-column content — space, no divider line */}
    <div data-comparison-inner className="grid grid-cols-2 gap-0 will-change-transform">
      <div className="flex flex-col gap-1 px-4 py-4 sm:px-5">
        <div className="mb-1 flex items-center gap-1.5">
          <X size={12} className="shrink-0" style={{ color: 'rgba(196,245,219,0.45)' }} />
          <p
            className="text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'rgba(196,245,219,0.55)', fontFamily: 'var(--font-label)' }}
          >
            Lo habitual
          </p>
        </div>
        <p className="text-xl font-bold leading-none sm:text-2xl" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {genericStat}
        </p>
        <p className="mt-1 text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{genericDesc}</p>
      </div>

      <div
        className="flex flex-col gap-1 px-4 py-4 sm:px-5"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <Check size={12} className="shrink-0" style={{ color: '#c4f5db' }} />
          <p
            className="text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#c4f5db', fontFamily: 'var(--font-label)' }}
          >
            Glopet
          </p>
        </div>
        <p className="text-xl font-bold leading-none text-white sm:text-2xl">{glopetStat}</p>
        <p className="mt-1 text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>{glopetDesc}</p>
      </div>
    </div>
  </div>
);

export const CoffeeComparison: React.FC = React.memo(() => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const introRef = React.useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-cc-line], [data-comparison-card], [data-comparison-inner]', {
          clearProps: 'all',
          autoAlpha: 1,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-cc-line]',
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introRef.current,
              start: 'top 82%',
              once: true,
            },
          },
        );

        ScrollTrigger.batch('[data-comparison-card]', {
          start: 'top 88%',
          once: true,
          onEnter: (elements) => {
            gsap.fromTo(
              elements,
              {
                autoAlpha: 0,
                y: (i) => 48 + i * 8,
                scale: 0.9,
                rotateX: 10,
                filter: 'blur(6px)',
              },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                filter: 'blur(0px)',
                duration: 0.85,
                stagger: 0.1,
                ease: 'back.out(1.6)',
                clearProps: 'transform,filter',
              },
            );
          },
        });

        gsap.utils.toArray<HTMLElement>('[data-comparison-card]').forEach((card, i) => {
          const inner = card.querySelector<HTMLElement>('[data-comparison-inner]');
          if (!inner) return;
          gsap.fromTo(
            inner,
            { y: 18 + i * 3 },
            {
              y: -8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="comparativa" className="mt-14 px-4 md:mt-20 md:px-10 lg:px-16">
      <div
        className="mx-auto max-w-[1160px] rounded-[1.8rem] px-5 py-7 md:rounded-[2.4rem] md:px-10 md:py-10"
        style={{
          background: [
            'radial-gradient(ellipse at 80% 20%, rgba(196,245,219,0.08) 0%, transparent 50%)',
            'linear-gradient(150deg, var(--ds-primary) 0%, var(--ds-primary-container) 100%)',
          ].join(', '),
        }}
      >
        <div ref={introRef} className="max-w-[36rem]">
          <p
            data-cc-line
            className="text-xs uppercase tracking-[0.24em] font-medium"
            style={{ color: '#c4f5db', fontFamily: 'var(--font-label)' }}
          >
            Por qué cambiar
          </p>
          <h2
            data-cc-line
            className="mt-3 glopet-title text-[1.9rem] leading-[1.02] text-white sm:mt-4 sm:text-[2.9rem] lg:text-[3.2rem]"
          >
            Llevas años pagando café fresco.
            <br />
            Pero no lo era.
          </h2>
          <p data-cc-line className="mt-3 max-w-[32rem] text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Lo que no te cuentan en el paquete, aquí sin filtros.
          </p>
        </div>

        <div className="mt-6 grid gap-3 [perspective:1200px] md:mt-8 md:gap-4">
          {ROWS.map(({ painLabel, genericStat, genericDesc, glopetStat, glopetDesc }, index) => (
            <ComparisonCard
              key={painLabel}
              painLabel={painLabel}
              genericStat={genericStat}
              genericDesc={genericDesc}
              glopetStat={glopetStat}
              glopetDesc={glopetDesc}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
