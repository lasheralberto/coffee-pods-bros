import React from 'react';
import { motion } from 'framer-motion';
import { Button, Link } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <header className="relative overflow-hidden px-4 pt-4 md:px-10 lg:px-16">
     
      {/* Hero stack: imagen de fondo + texto encima */}
      <div className="mt-10 sm:mt-6 md:mt-10 -mx-4 md:-mx-10 lg:-mx-16 relative h-[clamp(520px,145vw,820px)] sm:h-[clamp(560px,115vw,780px)] lg:h-[clamp(560px,60vw,700px)]">

        {/* Imagen apaisada de fondo con bordes difuminados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.2, 0.65, 0.2, 1] }}
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: [
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              'linear-gradient(to bottom, transparent 0%, black 6%, black 96%, transparent 100%)',
            ].join(', '),
            maskComposite: 'intersect',
            WebkitMaskImage: [
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              'linear-gradient(to bottom, transparent 0%, black 6%, black 96%, transparent 100%)',
            ].join(', '),
            WebkitMaskComposite: 'source-in',
          }}
        >
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet="/assets/images/hero1-mobile.png"
            />
            <img
              src="/images/hero1.png"
              alt="Mesa mediterranea con cafe y ceramica"
              className="h-full w-full object-cover object-[center_30%] sm:object-center"
              loading="eager"
              decoding="async"
            />
          </picture>
          {/* Gradiente superior para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf6ef]/80 via-[#faf6ef]/30 to-transparent" />
          {/* Difuminado inferior: más intenso en móvil para evitar corte recto en hero1-mobile */}
          <div className="absolute inset-x-0 bottom-0 h-44 sm:h-36 bg-gradient-to-b from-transparent via-[#faf6ef]/88 sm:via-[#faf6ef]/70 to-[#faf6ef]" />
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
            <p className="uppercase tracking-[0.24em] text-xs text-[#1a3a5c] mb-6">
              Cafe mediterraneo de especialidad
            </p>
            <h1
              className="glopet-title text-[2.7rem] leading-[0.95] sm:text-[3.5rem] lg:text-[5.2rem] text-white max-w-[14ch]"
              style={{ WebkitTextStroke: '0.25px #1a7ab5' }}
            >
              <span style={{ color: '#ffffff' }}>Entre el{' '}</span>
              <span style={{ color: '#1a7ab5', WebkitTextStroke: '1.5px #dfe4e7' }}>mar</span>
              <span style={{ color: '#ffffff' }}>{' '}y la sobremesa.</span>
            </h1>
            <p className="mt-6 text-[1.1rem] text-[#3f342d] max-w-[34ch] leading-relaxed">
              Glopet nace en tardes largas con sal en el aire. Un café lento, cálido y honesto para volver a respirar sin prisa.
            </p>
          </motion.div>

          {/* Botones — entran desde abajo, quedan en el fondo */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.2, 0.65, 0.2, 1] }}
            className="max-w-[1280px] mx-auto w-full flex flex-wrap gap-3 pb-2 absolute left-4 right-4 bottom-1 sm:static sm:left-auto sm:right-auto sm:bottom-auto"
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
              as={Link}
              href="#manifiesto"
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
