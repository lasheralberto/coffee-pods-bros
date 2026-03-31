import React from 'react';
import { Button } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';

export const CallToAction: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  ensureGsapPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-cta-orb], [data-cta-copy] > *, [data-cta-actions] > *', {
          clearProps: 'all',
          autoAlpha: 1,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          panelRef.current,
          { autoAlpha: 0, y: 44, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panelRef.current,
              start: 'top 84%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-cta-orb]',
          { autoAlpha: 0, scale: 0.72 },
          {
            autoAlpha: 0.92,
            scale: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panelRef.current,
              start: 'top 88%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-cta-copy] > *',
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.82,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panelRef.current,
              start: 'top 82%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-cta-actions] > *',
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panelRef.current,
              start: 'top 78%',
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
    <section ref={sectionRef} id="cta-final" className="px-4 md:px-10 lg:px-16 mt-24 pb-20">
      <div ref={panelRef} className="max-w-[1160px] mx-auto rounded-[2.2rem] border border-[#cfbb95] bg-[#1a3a5c] text-[#faf6ef] p-10 md:p-16 text-center glopet-grain overflow-hidden">
        <div data-cta-orb className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(232,213,176,0.34),rgba(232,213,176,0))] blur-2xl" />
        <div data-cta-orb className="pointer-events-none absolute right-[-2.5rem] top-8 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,118,58,0.4),rgba(196,118,58,0))] blur-2xl" />
        <div data-cta-copy>
        <p className="uppercase text-xs tracking-[0.24em] text-[#e8d5b0]">Glopet</p>
        <h2 className="mt-5 glopet-title text-4xl md:text-6xl leading-tight">Tu proxima sobremesa empieza aqui.</h2>
        <p className="mt-5 text-[#f5ead9] max-w-[45ch] mx-auto text-lg leading-relaxed">
          Elige tu bolsa o suscribete y recibe cafe fresco de costa en casa cada mes.
        </p>
        </div>
        <div data-cta-actions className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button
            as={RouterLink}
            to="/shop"
            color="secondary"
            size="lg"
            radius="full"
            className="glopet-tactile-btn font-semibold px-9"
          >
            Comprar ahora
          </Button>
          <Button
            as={RouterLink}
            to="/subscriptions"
            variant="bordered"
            size="lg"
            radius="full"
            className="border-[#e8d5b0] text-[#faf6ef]"
          >
            Encontrar mi suscripcion
          </Button>
        </div>
      </div>
    </section>
  );
};
