import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GlopetFAQSection } from './GlopetFAQSection.tsx';
import hero3Webm from '../../../assets/videos/hero3-webm.mp4';

const HERO_VERTICAL_MASK_MOBILE =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 1.5%, rgba(0,0,0,0.18) 3.5%, rgba(0,0,0,0.34) 6.5%, rgba(0,0,0,0.56) 10%, rgba(0,0,0,0.78) 14%, rgba(0,0,0,0.92) 18%, black 22%, black 97.5%, rgba(0,0,0,0.94) 99%, transparent 100%)';

const HERO_VERTICAL_MASK_DESKTOP =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.06) 1.2%, rgba(0,0,0,0.14) 2.8%, rgba(0,0,0,0.28) 5.2%, rgba(0,0,0,0.46) 8.5%, rgba(0,0,0,0.68) 12.5%, rgba(0,0,0,0.86) 16.5%, black 20%, black 95%, rgba(0,0,0,0.9) 97%, transparent 100%)';

export const Hero: React.FC = () => {
  const [mobileHeroHeight, setMobileHeroHeight] = useState<number | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobileViewport = mobileHeroHeight !== null;

  useEffect(() => {
    const updateMobileHeroHeight = () => {
      if (window.innerWidth >= 640) {
        setMobileHeroHeight(null);
        return;
      }

      const heroContainer = heroContainerRef.current;

      if (!heroContainer) {
        return;
      }

      const { top } = heroContainer.getBoundingClientRect();
      const availableHeight = window.innerHeight - top - 16;
      const widthBasedHeight = Math.round(window.innerWidth * 1.08);
      const viewportBasedHeight = Math.round(window.innerHeight * 0.74);
      const nextHeight = Math.max(
        420,
        Math.min(640, Math.min(Math.round(availableHeight), widthBasedHeight, viewportBasedHeight)),
      );

      setMobileHeroHeight(nextHeight);
    };

    updateMobileHeroHeight();
    window.addEventListener('resize', updateMobileHeroHeight);
    window.addEventListener('orientationchange', updateMobileHeroHeight);

    return () => {
      window.removeEventListener('resize', updateMobileHeroHeight);
      window.removeEventListener('orientationchange', updateMobileHeroHeight);
    };
  }, []);

  return (
    <header className="relative overflow-hidden px-4 pt-0 md:px-10 lg:px-16 -mt-6 md:-mt-8">
     
      {/* Hero stack: imagen de fondo + texto encima */}
      <div
        ref={heroContainerRef}
        className="mt-10 sm:mt-6 md:mt-10 -mx-4 md:-mx-10 lg:-mx-16 relative h-[clamp(420px,118vw,640px)] sm:h-[clamp(560px,115vw,780px)] lg:h-[clamp(560px,60vw,700px)]"
        style={mobileHeroHeight ? { height: `${mobileHeroHeight}px` } : undefined}
      >

        {/* Video de fondo con difuminado vertical */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.2, 0.65, 0.2, 1] }}
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: isMobileViewport
              ? HERO_VERTICAL_MASK_MOBILE
              : HERO_VERTICAL_MASK_DESKTOP,
            WebkitMaskImage: isMobileViewport
              ? HERO_VERTICAL_MASK_MOBILE
              : HERO_VERTICAL_MASK_DESKTOP,
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-[center_22%] sm:object-center"
          >
            <source src={hero3Webm} type="video/webm" />
          </video>
          {/* Gradiente superior suavizado para legibilidad del texto (difuminado más amplio) */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                'linear-gradient(to bottom, rgba(250,246,239,0.96) 0%, rgba(250,246,239,0.82) 5%, rgba(250,246,239,0.56) 11%, rgba(250,246,239,0.24) 18%, rgba(250,246,239,0.08) 26%, rgba(250,246,239,0) 36%)',
                'radial-gradient(120% 48% at 50% 0%, rgba(250,246,239,0.3) 0%, rgba(250,246,239,0) 68%)',
                'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.3) 14%, rgba(0,0,0,0.14) 30%, rgba(0,0,0,0.04) 56%, rgba(0,0,0,0) 76%)',
              ].join(', '),
              pointerEvents: 'none',
            }}
          />
          <div className="absolute inset-0 bg-[#07111a]/18 sm:bg-transparent" />
          {/* Difuminado inferior para suavizar el corte con el fondo de la página */}
          <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-b from-transparent via-[#faf6ef]/42 sm:via-[#faf6ef]/70 to-[#faf6ef]" />
        </motion.div>

        {/* Contenido sobre la imagen */}
        <div className="absolute inset-0 z-20 flex flex-col px-4 md:px-10 lg:px-16 py-8">

          {/* Texto — entra desde arriba, queda centrado verticalmente */}
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.65, 0.2, 1] }}
            className="flex-1 flex flex-col justify-center max-w-[1280px] mx-auto w-full"
          >
            <p className="uppercase tracking-[0.24em] text-xs text-white/90 mb-6">
              Café mediterráneo de especialidad
            </p>
            <h1
              className="glopet-title text-[2.7rem] leading-[0.95] sm:text-[3.5rem] lg:text-[5.2rem] text-white max-w-[20ch]"
              style={{ textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}
            >
              Nacido entre el mar y la sobremesa.
            </h1>
            <p
              className="mt-6 text-[1.05rem] text-white max-w-[44ch] leading-relaxed"
              style={{ textShadow: '0 6px 18px rgba(0,0,0,0.55)' }}
            >
              Glopet nace en tardes salinas y sobremesas que se alargan. Es un café para detenerse: lento, cálido y honesto, que invita a respirar sin prisa.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.65, 0.2, 1] }}
            className="absolute bottom-4 z-30 hidden sm:block sm:left-6 sm:right-6 sm:bottom-6 lg:left-auto lg:right-4 xl:right-8 lg:top-8 lg:bottom-auto lg:w-[min(42vw,540px)]"
          >
            <div className="rounded-[28px] overflow-hidden border border-[#aec1d3] bg-gradient-to-br from-[#f8efe1]/94 via-[#f4f0ea]/92 to-[#dbe8f0]/88 backdrop-blur-[6px] shadow-[0_18px_55px_rgba(26,58,92,0.22)] ring-1 ring-white/45">
              <div className="h-[3px] bg-gradient-to-r from-[#ca7f46] via-[#1a7ab5] to-[#e0b07c]" />
             

              <div className="max-h-[52vh] overflow-y-auto border-t border-[#b9cad9]/90 pr-1">
                <GlopetFAQSection
                  className="max-w-none"
                  itemClassName="border-[#c7d5e1]/95"
                  triggerClassName="px-4 md:px-6 py-4 md:py-5 hover:bg-[#fff9f1]/60"
                  contentClassName="px-4 md:px-6 pb-5 md:pb-6 pl-10 md:pl-14"
                />
              </div>
            </div>
          </motion.div>

          {/* Botones — entran desde abajo, quedan en el fondo */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.2, 0.65, 0.2, 1] }}
            className="hidden max-w-[1280px] flex-wrap gap-3 absolute left-4 right-4 bottom-4 z-30 sm:flex sm:static sm:mx-auto sm:w-full sm:left-auto sm:right-auto sm:bottom-auto"
          >
            <Button
              as={RouterLink}
              to="/shop"
              size="lg"
              color="secondary"
              radius="full"
              className="glopet-tactile-btn font-bold px-10 text-white tracking-wide hover:scale-[1.04] active:scale-[0.98] transition-all duration-200"
            >
              Comenzar
            </Button>
            <Button
              as={RouterLink}
              to="/manifiesto"
              variant="bordered"
              size="lg"
              radius="full"
              className="border-[#1a3a5c] text-[#1a3a5c] bg-transparent"
            >
              Personaliza tu pack
            </Button>
          </motion.div>

        </div>
      </div>
    </header>
  );
};
