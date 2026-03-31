import React from 'react';
import { Check, Minus } from 'lucide-react';
import { ensureGsapPlugins, gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';

type ComparisonRow = {
  label: string;
  generic: string;
  glopet: string;
};

const ROWS: readonly ComparisonRow[] = [
  {
    label: 'Sabor plano',
    generic: 'Cafe viejo o de rotacion larga que pierde aroma y expresion.',
    glopet: 'Tueste reciente y una taza con mas definicion desde la molienda.',
  },
  {
    label: 'Poca claridad',
    generic: 'No sabes bien que compras ni por que sabe como sabe.',
    glopet: 'Origen, perfil y proceso explicados para elegir con criterio.',
  },
  {
    label: 'Rigidez',
    generic: 'Opciones cerradas y compras que no se adaptan a tu ritmo real.',
    glopet: 'Compra puntual o suscripcion flexible para ajustar cuando quieras.',
  },
] as const;

const ComparisonCard: React.FC<ComparisonRow & { index: number }> = ({
  label,
  generic,
  glopet,
  index,
}) => {
  return (
    <div
      data-comparison-card
      data-comparison-index={index}
      className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/6 backdrop-blur-sm will-change-transform"
      style={{ transformPerspective: '1200px' }}
    >
      <div data-comparison-card-inner className="will-change-transform">
        <div className="border-b border-white/10 px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#e8d5b0] sm:px-5">
          {label}
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex gap-3 px-4 py-4 text-sm leading-relaxed text-[#e4d8c8] sm:px-5">
            <Minus size={17} className="mt-0.5 shrink-0 text-[#d8c7a5]" />
            <div>
              <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#d8c7a5]">
                Cafe convencional
              </p>
              <span>{generic}</span>
            </div>
          </div>
          <div className="flex gap-3 border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-[#faf6ef] md:border-l md:border-t-0 sm:px-5">
            <Check size={17} className="mt-0.5 shrink-0 text-[#e8d5b0]" />
            <div>
              <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#e8d5b0]">
                Glopet
              </p>
              <span>{glopet}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CoffeeComparison: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const introRef = React.useRef<HTMLDivElement | null>(null);

  ensureGsapPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-comparison-intro] > *, [data-comparison-card], [data-comparison-card-inner]', {
          clearProps: 'all',
          autoAlpha: 1,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-comparison-intro] > *',
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introRef.current,
              start: 'top 82%',
              once: true,
            },
          },
        );

        ScrollTrigger.batch('[data-comparison-card]', {
          start: 'top 86%',
          once: true,
          onEnter: (elements) => {
            gsap.fromTo(
              elements,
              {
                autoAlpha: 0,
                y: (index) => 68 + index * 10,
                scale: 0.94,
                rotateX: 12,
                filter: 'blur(8px)',
              },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                filter: 'blur(0px)',
                duration: 0.95,
                stagger: 0.12,
                ease: 'power3.out',
                clearProps: 'transform,filter',
              },
            );
          },
        });

        gsap.utils.toArray<HTMLElement>('[data-comparison-card]').forEach((card, index) => {
          const inner = card.querySelector<HTMLElement>('[data-comparison-card-inner]');

          if (!inner) {
            return;
          }

          gsap.fromTo(
            inner,
            { y: 22 + index * 3 },
            {
              y: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
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
    <section ref={sectionRef} id="comparativa" className="mt-14 px-4 md:mt-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1160px] rounded-[1.8rem] border px-5 py-6 md:rounded-[2.4rem] md:px-10 md:py-10" style={{ background: '#1a3a5c', borderColor: 'rgba(232,213,176,0.28)' }}>
        <div
          ref={introRef}
          data-comparison-intro
          className="max-w-[36rem]"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[#e8d5b0]">Por que cambiar</p>
          <h2 className="mt-3 glopet-title text-[1.9rem] leading-[1.02] text-[#faf6ef] sm:mt-4 sm:text-[2.9rem] lg:text-[3.2rem]">
            El problema no es tomar cafe. Es conformarte.
          </h2>
          <p className="mt-3 max-w-[34rem] text-sm leading-relaxed text-[#e4d8c8] sm:text-base">
            Si buscas mejor sabor, mas criterio al elegir y una compra que se adapte a ti, aqui esta la diferencia.
          </p>
        </div>

        <div className="mt-6 grid gap-3 [perspective:1200px] md:mt-8 md:gap-4">
          {ROWS.map(({ label, generic, glopet }, index) => (
            <ComparisonCard
              key={label}
              label={label}
              generic={generic}
              glopet={glopet}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};