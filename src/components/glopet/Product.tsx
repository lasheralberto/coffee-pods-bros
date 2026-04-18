import React, { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import hero2Image from '../../../assets/images/hero2.png';

const highlights = [
  {
    stat: '48h',
    label: 'Del tueste a tu puerta',
    desc: 'No semanas. Sin almacén.',
  },
  {
    stat: '0',
    label: 'Intermediarios',
    desc: 'Finca → tostador → tú.',
  },
  {
    stat: '100%',
    label: 'Trazable',
    desc: 'Sabes quién lo cultivó.',
  },
];

export const Product: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    const el = videoWrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-product-line], [data-product-media], [data-product-stat]', {
          clearProps: 'all',
          autoAlpha: 1,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-product-line]',
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-product-line]',
              start: 'top 85%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-product-media]',
          { autoAlpha: 0, scale: 0.96, y: 40 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-product-media]',
              start: 'top 82%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-product-stat]',
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-product-stat]',
              start: 'top 88%',
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
      id="cafe"
      className="py-24 sm:py-32"
      style={{
        background: [
          'radial-gradient(ellipse at 20% 80%, rgba(196,245,219,0.10) 0%, transparent 50%)',
          'linear-gradient(150deg, var(--ds-primary) 0%, var(--ds-primary-container) 100%)',
        ].join(', '),
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-20">
        {/* Two-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div>
            <p
              data-product-line
              className="text-[0.68rem] uppercase tracking-[0.28em] font-medium mb-5"
              style={{ color: '#e8c88a', fontFamily: 'var(--font-body)' }}
            >
              Café de verdad
            </p>
            <h2
              data-product-line
              className="glopet-title text-[2.2rem] sm:text-[2.8rem] lg:text-[3.4rem] leading-[1.02] text-white"
            >
              El café del súper tiene meses.{' '}
              <span style={{ color: '#e8c88a' }}>El nuestro, días.</span>
            </h2>
            <p
              data-product-line
              className="mt-6 text-[1rem] leading-relaxed max-w-[42ch]"
              style={{ color: 'rgba(250,246,239,0.75)', fontFamily: 'var(--font-body)' }}
            >
              Lote pequeño, origen conocido, sin escalas. Lo que no te cuentan en el paquete, aquí sin filtros.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {highlights.map(({ stat, label, desc }) => (
                <div
                  key={label}
                  data-product-stat
                  className="pt-5"
                  style={{ paddingTop: '1.25rem' }}
                >
                  <p className="glopet-title text-[2rem] sm:text-[2.4rem] leading-none" style={{ color: '#e8c88a' }}>
                    {stat}
                  </p>
                  <p
                    className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] font-semibold text-white/80"
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    {label}
                  </p>
                  <p className="mt-1 text-[0.78rem] leading-snug" style={{ color: 'rgba(250,246,239,0.55)' }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div
            ref={videoWrapperRef}
            data-product-media
            className="relative rounded-[2rem] overflow-hidden aspect-[4/5] lg:aspect-[3/4]"
            style={{
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            {videoVisible && (
              <img
                className="h-full w-full object-cover"
                src={hero2Image}
                alt="Café Glopet de especialidad"
                loading="lazy"
                decoding="async"
              />
            )}
            {/* Subtle overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(6,63,46,0.45) 0%, transparent 45%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
