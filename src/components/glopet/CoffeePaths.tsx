import React from 'react';
import { Button } from '@heroui/react';
import { ArrowRight, Compass, Package, Repeat } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';

const PATHS = [
  {
    title: 'Compra una bolsa',
    text: 'Entra por un origen o un blend y prueba Glopet sin comprometer tu rutina.',
    icon: Package,
    ctaLabel: 'Ir a tienda',
    to: '/shop' as string | undefined,
    num: '01',
    gradientFrom: '#1a3a5c',
    gradientTo: '#0d2240',
    accentLight: 'rgba(26,58,92,0.08)',
    borderColor: 'rgba(26,58,92,0.14)',
    pill: 'Compra única',
  },
  {
    title: 'Suscribete a tu ritmo',
    text: 'Define frecuencia, cantidad y formato. Ajusta cada envío cuando lo necesites.',
    icon: Repeat,
    ctaLabel: 'Ver suscripciones',
    to: '/subscriptions' as string | undefined,
    num: '02',
    gradientFrom: '#c4763a',
    gradientTo: '#a05a20',
    accentLight: 'rgba(196,118,58,0.08)',
    borderColor: 'rgba(196,118,58,0.18)',
    pill: 'Flexible',
  },
  {
    title: 'Déjate guiar',
    text: 'Si no sabes por dónde empezar, dos minutos y te recomendamos tu perfil.',
    icon: Compass,
    ctaLabel: 'Hacer quiz',
    to: undefined,
    num: '03',
    gradientFrom: '#4a7c59',
    gradientTo: '#2d5c3a',
    accentLight: 'rgba(74,124,89,0.08)',
    borderColor: 'rgba(74,124,89,0.18)',
    pill: 'Personalizado',
  },
] as const;

export const CoffeePaths: React.FC = () => {
  const { actions } = useQuizStore();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const headingRef = React.useRef<HTMLDivElement | null>(null);
  const cardsRef = React.useRef<HTMLDivElement | null>(null);

  ensureGsapPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-cp-heading] > *, [data-cp-card]', { clearProps: 'all', autoAlpha: 1 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Heading lines
        gsap.fromTo(
          '[data-cp-heading] > *',
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 82%',
              once: true,
            },
          },
        );

        // All 3 cards together
        gsap.fromTo(
          '[data-cp-card]',
          { autoAlpha: 0, y: 48, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true,
            },
          },
        );

        // Hover lift for each card
        const cards = gsap.utils.toArray<HTMLElement>('[data-cp-card]');
        cards.forEach((card) => {
          const onEnter = () => gsap.to(card, { y: -8, scale: 1.018, duration: 0.35, ease: 'power2.out', overwrite: true });
          const onLeave = () => gsap.to(card, { y: 0, scale: 1, duration: 0.45, ease: 'power2.inOut', overwrite: true });
          card.addEventListener('mouseenter', onEnter);
          card.addEventListener('mouseleave', onLeave);
          return () => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
          };
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="elige-tu-camino"
      className="relative py-20 sm:py-28"
      style={{
        background: 'linear-gradient(160deg, #f7f2ea 0%, #ede3d0 50%, #e0d4be 100%)',
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
          opacity: 0.6,
        }}
      />

      <div className="relative mx-auto max-w-[1160px] px-4 md:px-10 lg:px-16">
        {/* Heading */}
        <div ref={headingRef} data-cp-heading className="mb-14 text-center sm:mb-16">
          <p
            className="mb-3 text-[0.68rem] uppercase tracking-[0.28em]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Elige tu camino
          </p>
          <h2
            className="glopet-title text-[2rem] leading-[1.05] sm:text-[2.6rem] lg:text-[3rem]"
            style={{ color: 'var(--color-espresso)' }}
          >
            Tres formas de entrar en Glopet.
          </h2>
          <p
            className="mx-auto mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Compra puntual, suscripción flexible o recomendación guiada.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6"
        >
          {PATHS.map((path) => {
            const { title, text, icon: Icon, ctaLabel, to, num, gradientFrom, gradientTo, accentLight, borderColor, pill } = path;

            const cardContent = (
              <div
                data-cp-card
                key={title}
                className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border"
                style={{
                  background: 'rgba(255,251,245,0.72)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderColor,
                  boxShadow: '0 4px 32px rgba(26,20,10,0.07), 0 1px 0 rgba(255,255,255,0.9) inset',
                  willChange: 'transform',
                }}
              >
                {/* Top accent stripe */}
                <div
                  className="h-[3px] w-full"
                  style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
                />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Number + pill row */}
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className="font-mono text-[0.68rem] tracking-[0.22em]"
                      style={{ color: gradientFrom, opacity: 0.7 }}
                    >
                      {num}
                    </span>
                    <span
                      className="rounded-full px-3 py-0.5 text-[0.65rem] uppercase tracking-[0.18em]"
                      style={{
                        background: accentLight,
                        color: gradientFrom,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {pill}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                      boxShadow: `0 8px 24px ${gradientFrom}30`,
                    }}
                  >
                    <Icon size={20} strokeWidth={1.6} color="#fff" />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-3 text-[1.3rem] leading-[1.1] sm:text-[1.4rem]"
                    style={{
                      color: 'var(--color-espresso)',
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {title}
                  </h3>

                  {/* Body */}
                  <p
                    className="flex-1 text-[0.88rem] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {text}
                  </p>

                  {/* CTA */}
                  <div className="mt-7">
                    {to ? (
                      <Button
                        as={RouterLink}
                        to={to}
                        size="sm"
                        radius="full"
                        className="w-full text-[0.8rem] font-medium text-white"
                        style={{
                          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                          boxShadow: `0 4px 16px ${gradientFrom}28`,
                        }}
                        endContent={<ArrowRight size={14} />}
                      >
                        {ctaLabel}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        radius="full"
                        className="w-full text-[0.8rem] font-medium text-white"
                        style={{
                          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                          boxShadow: `0 4px 16px ${gradientFrom}28`,
                        }}
                        endContent={<ArrowRight size={14} />}
                        onPress={() => actions.openQuiz()}
                      >
                        {ctaLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );

            return cardContent;
          })}
        </div>
      </div>
    </section>
  );
};