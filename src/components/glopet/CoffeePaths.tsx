import React from 'react';
import { Button } from '@heroui/react';
import { ArrowRight, Package, Repeat, Compass } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { gsap, useGSAP } from '../../lib/gsap';

const PATHS = [
  {
    title: 'Compra una bolsa',
    subtitle: 'Sin compromiso',
    text: 'Elige un origen o un blend y prueba Glopet. Una sola compra, sin suscripción.',
    icon: Package,
    ctaLabel: 'Ir a tienda',
    to: '/shop' as string | undefined,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=480&h=600&fit=crop&q=75',
  },
  {
    title: 'Suscríbete a tu ritmo',
    subtitle: 'Flexible',
    text: 'Define frecuencia, cantidad y formato. Ajusta o pausa cada envío cuando quieras.',
    icon: Repeat,
    ctaLabel: 'Ver planes',
    to: '/subscriptions' as string | undefined,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=480&h=600&fit=crop&q=75',
  },
  {
    title: 'Déjate guiar',
    subtitle: 'Personalizado',
    text: 'No sabes por dónde empezar? Dos minutos y te recomendamos tu perfil de café.',
    icon: Compass,
    ctaLabel: 'Hacer quiz',
    to: undefined,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=480&h=600&fit=crop&q=75',
  },
] as const;

export const CoffeePaths: React.FC = () => {
  const { actions } = useQuizStore();
  const sectionRef = React.useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-cp-heading] > *, [data-cp-card]', { clearProps: 'all', autoAlpha: 1 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-cp-heading] > *',
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-cp-heading]',
              start: 'top 82%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-cp-card]',
          { autoAlpha: 0, y: 60, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-cp-card]',
              start: 'top 85%',
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
      id="elige-tu-camino"
      className="relative py-24 sm:py-32"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-20">
        {/* Asymmetric heading: large title left, body text tucked right */}
        <div
          data-cp-heading
          className="mb-16 sm:mb-20 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-end"
        >
          <div>
            <p
              className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] font-medium"
              style={{ color: 'var(--color-caramel)', fontFamily: 'var(--font-label)' }}
            >
              Elige tu camino
            </p>
            <h2
              className="glopet-title text-[2.2rem] leading-[1.02] sm:text-[3rem] lg:text-[3.6rem]"
              style={{ color: 'var(--ds-on-surface)' }}
            >
              Tres formas de empezar.
            </h2>
          </div>
          <p
            className="text-[1rem] leading-relaxed lg:pb-2"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
          >
            Compra puntual, suscripción flexible o recomendación guiada. Tú decides cómo entrar.
          </p>
        </div>

        {/* Cards grid — no borders, tonal layering */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5 lg:gap-7">
          {PATHS.map((path) => {
            const { title, subtitle, text, icon: Icon, ctaLabel, to, image } = path;

            const handleClick = !to ? () => actions.openQuiz() : undefined;

            return (
              <div
                data-cp-card
                key={title}
                className="group relative flex flex-col overflow-hidden rounded-[1.8rem] will-change-transform"
                style={{
                  background: 'var(--ds-surface-container-lowest)',
                  boxShadow: 'var(--ds-shadow-float)',
                }}
              >
                {/* Image — bleeds to edges */}
                <div className="relative h-[260px] sm:h-[280px] overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 35%, rgba(6,63,46,0.75) 100%)',
                    }}
                  />
                  {/* Subtitle pill — glassmorphic */}
                  <span
                    className="absolute top-4 left-4 rounded-full px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] font-semibold text-white/90"
                    style={{
                      background: 'rgba(6,63,46,0.35)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    }}
                  >
                    {subtitle}
                  </span>
                  {/* Icon */}
                  <div
                    className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background: 'var(--ds-secondary)',
                      boxShadow: '0 8px 24px rgba(123,88,0,0.35)',
                    }}
                  >
                    <Icon size={20} strokeWidth={1.6} color="#fff" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3
                    className="mb-3 text-[1.35rem] leading-[1.15] sm:text-[1.45rem] font-bold"
                    style={{
                      color: 'var(--ds-on-surface)',
                      fontFamily: 'var(--font-body)',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="flex-1 text-[0.88rem] leading-relaxed mb-6"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    {text}
                  </p>

                  {to ? (
                    <Button
                      as={RouterLink}
                      to={to}
                      size="md"
                      radius="full"
                      className="w-full text-[0.8rem] font-semibold tracking-wide transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'var(--ds-secondary)',
                        color: 'var(--ds-on-secondary)',
                      }}
                      endContent={<ArrowRight size={14} />}
                    >
                      {ctaLabel}
                    </Button>
                  ) : (
                    <Button
                      size="md"
                      radius="full"
                      className="w-full text-[0.8rem] font-semibold tracking-wide transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'var(--ds-secondary)',
                        color: 'var(--ds-on-secondary)',
                      }}
                      endContent={<ArrowRight size={14} />}
                      onPress={handleClick}
                    >
                      {ctaLabel}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
