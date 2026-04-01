import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';

const highlights = [
  {
    stat: '48h',
    title: 'Del tueste a tu puerta',
    value: 'No semanas. Sin almacén.',
    position: { bottom: '12%', left: '3%' },
    rotate: '-2.5deg',
  },
  {
    stat: '0',
    title: 'Intermediarios',
    value: 'Finca → tostador → tú.',
    position: { top: '38%', left: '35%' },
    rotate: '2.5deg',
  },
  {
    stat: '100%',
    title: 'Origen trazable',
    value: 'Sabes quién lo cultivó.',
    position: { top: '8%', right: '4%' },
    rotate: '-1.5deg',
  },
];

const maskImage = [
  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
].join(', ');

export const Product: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const mediaRef = React.useRef<HTMLDivElement | null>(null);
  const headlineRef = React.useRef<HTMLDivElement | null>(null);

  ensureGsapPlugins();

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

          if (reduceMotion) {
            gsap.set('[data-product-media], [data-product-card], [data-product-line]', {
              clearProps: 'all',
              autoAlpha: 1,
            });
            return;
          }

          // Headline: líneas aparecen en stagger con reveal suave
          gsap.fromTo(
            '[data-product-line]',
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.11,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headlineRef.current,
                start: 'top 88%',
                once: true,
              },
            },
          );

          // Video reveal
          gsap.fromTo(
            '[data-product-media]',
            { autoAlpha: 0, scale: 0.97, y: 32 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: mediaRef.current,
                start: 'top 84%',
                once: true,
              },
            },
          );

          // Cards: spring pop con back ease
          gsap.fromTo(
            '[data-product-card]',
            { autoAlpha: 0, y: 28, scale: 0.86 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.72,
              stagger: 0.14,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: mediaRef.current,
                start: 'top 78%',
                once: true,
              },
            },
          );

          // Parallax video
          gsap.to('[data-product-media]', {
            yPercent: isDesktop ? 10 : 5,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          });

          // Parallax diferencial por card
          gsap.utils.toArray<HTMLElement>('[data-product-card]').forEach((card, index) => {
            gsap.to(card, {
              yPercent: index % 2 === 0 ? -8 : -4,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2 + index * 0.2,
              },
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="cafe" className="mt-16 mb-4">
      {/* Headline pain-point */}
      <div ref={headlineRef} className="mb-5 px-6 text-center">
        <p data-product-line className="text-[11px] uppercase tracking-[0.26em] text-[#1a7ab5] mb-2">
          Café de verdad
        </p>
        <h2
          data-product-line
          className="glopet-title text-[1.75rem] sm:text-4xl text-[#1c1410] leading-tight max-w-lg mx-auto"
        >
          El café de supermercado tiene meses.{' '}
          <span className="text-[#c4763a]">El nuestro, días.</span>
        </h2>
        <p data-product-line className="mt-2.5 text-sm text-[#4a3728]/68 max-w-xs mx-auto leading-relaxed">
          Origen conocido. Lote pequeño. Sin escalas.
        </p>
      </div>

      {/* Video con cards flotantes */}
      <div className="relative mx-4 md:mx-10 lg:mx-16">
        <div
          ref={mediaRef}
          data-product-media
          className="w-full h-[300px] sm:h-[370px] lg:h-[430px] overflow-hidden"
          style={{
            maskImage,
            maskComposite: 'intersect',
            WebkitMaskImage: maskImage,
            WebkitMaskComposite: 'source-in',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'cover',
            maskSize: 'cover',
          }}
        >
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Mesa mediterránea con café y cerámica artesanal"
          >
            <source src="/videos/hero2.mp4" type="video/mp4" />
          </video>
        </div>

        {highlights.map((item) => (
          <div
            key={item.title}
            data-product-card
            className="absolute"
            style={{ ...item.position, rotate: item.rotate }}
          >
            <Card
              className="border border-[#d8c7a5] bg-[#faf6ef]/90 backdrop-blur-md shadow-xl w-[140px] sm:w-[172px]"
              radius="lg"
            >
              <CardBody className="p-3 md:p-4">
                <p className="text-2xl sm:text-3xl glopet-title text-[#c4763a] leading-none">{item.stat}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#1a3a5c] leading-tight">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[11px] sm:text-xs text-[#1c1410]/72 leading-snug">{item.value}</p>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
