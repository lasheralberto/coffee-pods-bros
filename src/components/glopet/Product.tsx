import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';

const highlights = [
  {
    title: 'Origen',
    value: 'De las mejores fincas del mundo, directo a tu taza',
    position: { bottom: '14%', left: '4%' },
    rotate: '-3deg',
    delay: 0.2,
  },
  {
    title: 'Tueste',
    value: 'Tostado a mano, en pequeños lotes, sin prisa',
    position: { top: '38%', left: '36%' },
    rotate: '2.5deg',
    delay: 0.4,
  },
  {
    title: 'Artesanos',
    value: 'Obsesionados con el café. Desde el mediterráneo',
    position: { top: '9%', right: '5%' },
    rotate: '-1.5deg',
    delay: 0.3,
  },
];

const maskImage = [
  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
].join(', ');

export const Product: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const mediaRef = React.useRef<HTMLDivElement | null>(null);

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
            gsap.set('[data-product-media], [data-product-card]', { clearProps: 'all', autoAlpha: 1 });
            return;
          }

          gsap.fromTo(
            '[data-product-media]',
            { autoAlpha: 0, scale: 0.97, y: 36 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 1.05,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: mediaRef.current,
                start: 'top 82%',
                once: true,
              },
            },
          );

          gsap.fromTo(
            '[data-product-card]',
            { autoAlpha: 0, y: 34, rotate: (index) => (index % 2 === 0 ? -4 : 4), scale: 0.94 },
            {
              autoAlpha: 1,
              y: 0,
              rotate: 0,
              scale: 1,
              duration: 0.85,
              stagger: 0.13,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: mediaRef.current,
                start: 'top 76%',
                once: true,
              },
            },
          );

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

          gsap.utils.toArray<HTMLElement>('[data-product-card]').forEach((card, index) => {
            gsap.to(card, {
              yPercent: index % 2 === 0 ? -10 : -5,
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
    <section ref={sectionRef} id="cafe" className="mt-20">
      <div className="relative mx-4 md:mx-10 lg:mx-16">
        {/* Imagen con bordes difuminados */}
        <div
          ref={mediaRef}
          data-product-media
          className="w-full h-[340px] sm:h-[420px] lg:h-[500px] overflow-hidden"
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
            aria-label="Mesa mediterranea con cafe y ceramica"
          >
            <source src="/videos/hero2.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Cards flotando sobre la imagen */}
        {highlights.map((item) => (
          <div
            key={item.title}
            data-product-card
            className="absolute"
            style={{ ...item.position, rotate: item.rotate }}
          >
            <Card
              className="border border-[#d8c7a5] bg-[#faf6ef]/88 backdrop-blur-md shadow-xl w-[155px] sm:w-[190px]"
              radius="lg"
            >
              <CardBody className="p-4 md:p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#1a3a5c]">{item.title}</p>
                <p className="mt-2 text-base glopet-title text-[#1c1410] leading-snug">{item.value}</p>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
