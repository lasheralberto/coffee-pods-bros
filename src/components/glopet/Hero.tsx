import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';
import hero4Image from '../../../assets/images/hero4.png';
import { gsap, useGSAP } from '../../lib/gsap';
import { ArrowRight, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const rootRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions;
          const copyItems = copyRef.current ? Array.from(copyRef.current.children) : [];
          const actionItems = actionsRef.current ? Array.from(actionsRef.current.children) : [];

          if (reduceMotion) {
            gsap.set([mediaRef.current, ...copyItems, ...actionItems, scrollHintRef.current], {
              clearProps: 'all',
              autoAlpha: 1,
            });
            return;
          }

          const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

          intro
            .fromTo(
              mediaRef.current,
              { autoAlpha: 0, scale: 1.12 },
              { autoAlpha: 1, scale: 1, duration: 2, ease: 'power2.out' },
            )
            .fromTo(
              copyItems,
              { autoAlpha: 0, y: 50 },
              { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.15 },
              0.5,
            )
            .fromTo(
              actionItems,
              { autoAlpha: 0, y: 30 },
              { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12 },
              0.9,
            )
            .fromTo(
              scrollHintRef.current,
              { autoAlpha: 0, y: -10 },
              { autoAlpha: 1, y: 0, duration: 0.6 },
              1.4,
            );

          // Scroll hint bounce
          gsap.to(scrollHintRef.current, {
            y: 8,
            duration: 1.2,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          });

          // Parallax on scroll
          gsap.to(mediaRef.current, {
            yPercent: isDesktop ? 18 : 10,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.1,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <header
      ref={rootRef}
      className="relative overflow-hidden -mt-[var(--navbar-height-desktop)]"
      style={{ height: '100dvh', minHeight: '600px', maxHeight: '1100px' }}
    >
      {/* Fullscreen image background */}
      <div
        ref={mediaRef}
        className="absolute inset-0"
      >
        <img
          src={hero4Image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />

        {/* Dark cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'linear-gradient(to bottom, rgba(28,20,16,0.56) 0%, rgba(28,20,16,0.32) 40%, rgba(28,20,16,0.44) 70%, rgba(28,20,16,0.8) 100%)',
              'radial-gradient(ellipse at 30% 50%, rgba(196,118,58,0.08) 0%, transparent 60%)',
            ].join(', '),
          }}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 md:pb-20 lg:pb-24">
        <div className="max-w-[1280px] mx-auto w-full">
          {/* Copy block */}
          <div ref={copyRef} className="max-w-[680px]">
            <p className="uppercase tracking-[0.3em] text-[0.7rem] text-white/70 mb-5 font-medium"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Café mediterráneo de especialidad
            </p>
            <h1
              className="glopet-title text-[2.8rem] leading-[0.92] sm:text-[3.8rem] lg:text-[5.5rem] text-white"
            >
              Nacido entre
              <br />
              el mar y la
              <br />
              <span className="text-[#e8c88a]">sobremesa.</span>
            </h1>
            <p
              className="mt-6 md:mt-8 text-[1rem] md:text-[1.1rem] text-white/80 max-w-[48ch] leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Glopet nace en tardes salinas y sobremesas que se alargan. Café lento, cálido y honesto, tostado esta semana.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            ref={actionsRef}
            className="mt-8 md:mt-10 flex flex-wrap gap-3 sm:gap-4"
          >
            <Button
              as={RouterLink}
              to="/shop"
              size="lg"
              radius="full"
              className="font-bold px-10 py-6 text-[0.85rem] tracking-wide text-[#1c1410] bg-white hover:bg-[#f5ead9] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
              endContent={<ArrowRight size={16} />}
            >
              Descubrir café
            </Button>
            <Button
              as={RouterLink}
              to="/subscriptions"
              variant="bordered"
              size="lg"
              radius="full"
              className="px-8 py-6 text-[0.85rem] border-white/40 text-white hover:bg-white/10 hover:border-white/70 transition-all duration-300 tracking-wide"
            >
              Suscripciones
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
      >
        <span className="text-white/50 text-[0.6rem] uppercase tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Scroll
        </span>
        <ChevronDown size={16} className="text-white/40" />
      </div>

      {/* Bottom gradient into page */}
      <div className="absolute inset-x-0 bottom-0 h-32 z-[5] bg-gradient-to-t from-[#faf6ef] to-transparent" />
    </header>
  );
};
