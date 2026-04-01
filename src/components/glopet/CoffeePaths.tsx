import React from 'react';
import { Button } from '@heroui/react';
import { ArrowRight, Compass, Package, Repeat } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { ensureGsapPlugins, gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { EtherealShadow } from '../ui/etheral-shadow';

const PATHS = [
  {
    title: 'Compra una bolsa',
    text: 'Entra por un origen o un blend y prueba Glopet sin comprometer tu rutina.',
    accent: 'rgba(26,58,92,0.10)',
    border: 'rgba(26,58,92,0.18)',
    icon: Package,
    ctaLabel: 'Ir a tienda',
    to: '/shop',
  },
  {
    title: 'Suscribete a tu ritmo',
    text: 'Define frecuencia, cantidad y formato. Ajusta cada envio cuando lo necesites.',
    accent: 'rgba(196,118,58,0.12)',
    border: 'rgba(196,118,58,0.2)',
    icon: Repeat,
    ctaLabel: 'Encontrar mi suscripcion',
    to: '/subscriptions',
  },
  {
    title: 'Dejate guiar',
    text: 'Si no sabes por donde empezar, responde dos minutos y te recomendamos perfil.',
    accent: 'rgba(104,124,94,0.12)',
    border: 'rgba(104,124,94,0.2)',
    icon: Compass,
    ctaLabel: 'Hacer quiz',
    to: undefined,
  },
] as const;

export const CoffeePaths: React.FC = () => {
  const { actions } = useQuizStore();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const introRef = React.useRef<HTMLDivElement | null>(null);
  const desktopDeckRef = React.useRef<HTMLDivElement | null>(null);
  const mobileDeckRef = React.useRef<HTMLDivElement | null>(null);
  const activePath = PATHS[activeIndex];

  const renderIntro = React.useCallback(
    (className: string, isDesktop = false) => (
      <div
        ref={isDesktop ? introRef : undefined}
        data-path-intro
        className={className}
      >
        <p
          className="uppercase tracking-[0.24em] text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Elige tu camino
        </p>
        <h2 className="mt-2 glopet-title text-[1.85rem] leading-[1.02] sm:mt-3 sm:text-[2.55rem] lg:text-[2.9rem]" style={{ color: 'var(--color-espresso)' }}>
          Tres formas simples de entrar en Glopet.
        </h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-relaxed sm:mt-3 sm:text-[0.98rem]" style={{ color: 'var(--text-secondary)' }}>
          Compra puntual, suscripcion flexible o recomendacion guiada. La home ahora explica con claridad por donde empezar.
        </p>
      </div>
    ),
    [],
  );

  const renderCard = React.useCallback(
    (
      path: (typeof PATHS)[number],
      index: number,
      className: string,
      buttonClassName: string,
      marker?: string,
    ) => {
      const { title, text, accent, border, icon: Icon, ctaLabel, to } = path;
      const isActive = activeIndex === index;

      return (
        <div
          key={title}
          data-path-card
          {...(marker ? { [marker]: '' } : {})}
          className={className}
          style={{
            background: index === 1 ? 'linear-gradient(180deg, #fffaf4 0%, #f6eee2 100%)' : 'var(--bg-surface)',
            borderColor: border,
            boxShadow: '0 22px 60px rgba(26, 58, 92, 0.12)',
            perspective: '1200px',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#9b785c]">
                Ruta activa {String(activeIndex + 1).padStart(2, '0')}
              </p>
              <div className="mt-3 flex gap-1.5" aria-label="Indicador de pasos">
                {PATHS.map((item, dotIndex) => (
                  <div
                    key={item.title}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: activeIndex === dotIndex ? 28 : 12,
                      background: activeIndex === dotIndex ? '#1a3a5c' : 'rgba(26,58,92,0.18)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{ background: accent, color: 'var(--color-espresso)' }}
            >
              <Icon size={22} strokeWidth={1.8} />
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8c6d52]">Ruta activa</p>
              <h3 className="mt-2 text-[1.5rem] leading-[0.98] sm:text-[1.9rem]" style={{ color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {title}
              </h3>
            </div>
            <span className="glopet-title text-[1.9rem] leading-none text-[#1a3a5c] sm:text-[2.3rem]">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="mt-4">
            <p className="max-w-[34ch] text-[0.98rem] leading-relaxed sm:text-[1.02rem]" style={{ color: 'var(--text-secondary)' }}>
              {text}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.2em] text-[#8c6d52]">
            <span>{isActive ? 'Activa ahora' : 'Siguiente ruta'}</span>
            <span>{String(index + 1).padStart(2, '0')} / {String(PATHS.length).padStart(2, '0')}</span>
          </div>

          {to ? (
            <Button
              as={RouterLink}
              to={to}
              size="lg"
              radius="full"
              className={buttonClassName}
              endContent={<ArrowRight size={16} />}
            >
              {ctaLabel}
            </Button>
          ) : (
            <Button
              size="lg"
              radius="full"
              className={buttonClassName.replace('bg-[#1a3a5c]', 'bg-[#c4763a]')}
              endContent={<ArrowRight size={16} />}
              onPress={() => actions.openQuiz()}
            >
              {ctaLabel}
            </Button>
          )}
        </div>
      );
    },
    [actions, activeIndex],
  );

  ensureGsapPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-path-intro] > *, [data-path-card], [data-path-deck-shell], [data-path-mobile-card]', { clearProps: 'all', autoAlpha: 1 });
      });

      mm.add(
        {
          desktop: '(min-width: 1024px)',
          mobile: '(max-width: 1023px)',
          motionOk: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { desktop, mobile, motionOk } = context.conditions;

          if (!motionOk) {
            return;
          }

        gsap.fromTo(
          '[data-path-intro] > *',
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.11,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introRef.current,
              start: 'top 80%',
              once: true,
            },
          },
        );

          if (desktop) {
            const cards = gsap.utils.toArray<HTMLElement>('[data-path-desktop-card]');

            gsap.set('[data-path-deck-shell]', { autoAlpha: 1 });
            gsap.set(cards, {
              autoAlpha: 0,
              yPercent: 26,
              scale: 0.9,
              rotate: (index) => (index % 2 === 0 ? -8 : 8),
              zIndex: (index) => index + 1,
              transformOrigin: '50% 100%',
              filter: 'blur(0px)',
              pointerEvents: 'none',
            });

            gsap.set(cards[0], {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              rotate: -2,
              pointerEvents: 'auto',
            });

            let currentIndex = 0;

            const showCard = (nextIndex: number) => {
              if (nextIndex === currentIndex) {
                return;
              }

              const previous = cards[currentIndex];
              const next = cards[nextIndex];

              cards.forEach((card, index) => {
                card.style.pointerEvents = index === nextIndex ? 'auto' : 'none';
              });

              const transition = gsap.timeline({ defaults: { duration: 0.42, ease: 'power2.out' } });

              if (previous) {
                transition.to(
                  previous,
                  {
                    autoAlpha: 0,
                    yPercent: -8,
                    scale: 0.96,
                    rotate: nextIndex > currentIndex ? -3 : 3,
                    overwrite: true,
                  },
                  0,
                );
              }

              if (next) {
                transition.fromTo(
                  next,
                  {
                    autoAlpha: 0,
                    yPercent: nextIndex > currentIndex ? 10 : -10,
                    scale: 0.985,
                    rotate: nextIndex % 2 === 0 ? -2 : 2,
                  },
                  {
                    autoAlpha: 1,
                    yPercent: 0,
                    scale: 1,
                    rotate: nextIndex % 2 === 0 ? -1 : 1,
                    overwrite: true,
                  },
                  0.04,
                );
              }

              currentIndex = nextIndex;
              setActiveIndex(nextIndex);
            };

            ScrollTrigger.create({
              trigger: desktopDeckRef.current,
              start: 'center center',
              end: () => `+=${cards.length * 260}`,
              pin: true,
              anticipatePin: 1,
              scrub: false,
              snap: {
                snapTo: cards.length > 1 ? 1 / (cards.length - 1) : 1,
                duration: { min: 0.12, max: 0.2 },
                delay: 0,
                ease: 'power1.out',
              },
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const nextIndex = Math.round(self.progress * (cards.length - 1));
                showCard(nextIndex);
              },
            });
          }

          if (mobile) {
            const mobileCards = gsap.utils.toArray<HTMLElement>('[data-path-mobile-card]');

            gsap.set('[data-path-mobile-deck-shell]', { autoAlpha: 1 });
            gsap.set(mobileCards, {
              autoAlpha: 0,
              yPercent: 26,
              scale: 0.9,
              rotate: (index) => (index % 2 === 0 ? -8 : 8),
              zIndex: (index) => index + 1,
              transformOrigin: '50% 100%',
              pointerEvents: 'none',
            });

            gsap.set(mobileCards[0], {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              rotate: -2,
              pointerEvents: 'auto',
            });

            let currentMobileIndex = 0;

            const showMobileCard = (nextIndex: number) => {
              if (nextIndex === currentMobileIndex) {
                return;
              }

              const previous = mobileCards[currentMobileIndex];
              const next = mobileCards[nextIndex];

              mobileCards.forEach((card, index) => {
                card.style.pointerEvents = index === nextIndex ? 'auto' : 'none';
              });

              const transition = gsap.timeline({ defaults: { duration: 0.42, ease: 'power2.out' } });

              if (previous) {
                transition.to(
                  previous,
                  {
                    autoAlpha: 0,
                    yPercent: -8,
                    scale: 0.96,
                    rotate: nextIndex > currentMobileIndex ? -3 : 3,
                    overwrite: true,
                  },
                  0,
                );
              }

              if (next) {
                transition.fromTo(
                  next,
                  {
                    autoAlpha: 0,
                    yPercent: nextIndex > currentMobileIndex ? 10 : -10,
                    scale: 0.985,
                    rotate: nextIndex % 2 === 0 ? -2 : 2,
                  },
                  {
                    autoAlpha: 1,
                    yPercent: 0,
                    scale: 1,
                    rotate: nextIndex % 2 === 0 ? -1 : 1,
                    overwrite: true,
                  },
                  0.04,
                );
              }

              currentMobileIndex = nextIndex;
              setActiveIndex(nextIndex);
            };

            ScrollTrigger.create({
              trigger: mobileDeckRef.current,
              start: 'center center',
              end: () => `+=${mobileCards.length * 260}`,
              pin: true,
              anticipatePin: 1,
              scrub: false,
              snap: {
                snapTo: mobileCards.length > 1 ? 1 / (mobileCards.length - 1) : 1,
                duration: { min: 0.12, max: 0.2 },
                delay: 0,
                ease: 'power1.out',
              },
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const nextIndex = Math.round(self.progress * (mobileCards.length - 1));
                showMobileCard(nextIndex);
              },
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="elige-tu-camino" className="relative mt-12">
      {/* ── Fondo mediterráneo full-width ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'linear-gradient(155deg, #c8dff0 0%, #daedf7 18%, #edf6fb 38%, #f3ede0 62%, #ede3d0 82%, #e5d8c0 100%)',
        }}
      >
        <EtherealShadow
          color="rgba(26, 92, 155, 0.40)"
          animation={{ scale: 55, speed: 35 }}
          noise={{ opacity: 0.5, scale: 1.4 }}
          sizing="fill"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="max-w-[1160px] mx-auto px-4 md:px-10 lg:px-16">
        <div ref={mobileDeckRef} className="mt-4 lg:hidden">
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
            {renderIntro('mx-auto max-w-[760px] text-center')}
            <div data-path-mobile-deck-shell className="relative min-h-[250px] w-full">
              {PATHS.map((path, index) => (
                <div key={path.title} className="absolute inset-x-0 top-0 flex justify-center">
                  {renderCard(
                    path,
                    index,
                    'flex max-w-[760px] flex-col rounded-[1.3rem] border p-4',
                    'mt-4 h-10 w-full bg-[#1a3a5c] px-4.5 text-[#faf6ef]',
                    'data-path-mobile-card',
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={desktopDeckRef}
          className="relative mt-5 hidden lg:block"
        >
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
            {renderIntro('mx-auto max-w-[760px] text-center', true)}
            <div data-path-deck-shell className="relative min-h-[220px] w-full xl:min-h-[240px]">
            {PATHS.map((path, index) => (
              <div key={path.title} className="absolute inset-x-0 top-0 flex justify-center">
                {renderCard(
                  path,
                  index,
                  'flex max-w-[760px] flex-col rounded-[1.3rem] border p-4 xl:p-5',
                  'mt-4 h-10 w-fit bg-[#1a3a5c] px-5 text-[#faf6ef]',
                  'data-path-desktop-card',
                )}
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="sr-only" aria-live="polite">
          Ruta activa {String(activeIndex + 1).padStart(2, '0')}: {activePath.title}
        </div>
      </div>
    </section>
  );
};