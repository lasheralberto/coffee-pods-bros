import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Link } from '@heroui/react';
import { Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link as RouterLink } from 'react-router-dom';

type HeroInfoSection = {
  id: string;
  title: string;
  heading: string;
  body: string;
  highlights: string[];
};

const HERO_INFO_SECTIONS: HeroInfoSection[] = [
  {
    id: 'que-es',
    title: '¿QUE ES EL CAFE DE ESPECIALIDAD?',
    heading: '¿Qué es el café de especialidad?',
    body: 'Es café evaluado por su calidad sensorial, su origen y su proceso. Cada lote se selecciona por su perfil de taza y su consistencia, no por volumen.',
    highlights: [
      'Puntuación alta en cata profesional.',
      'Cosecha y proceso controlados en origen.',
      'Mayor claridad de notas y aroma en taza.',
    ],
  },
  {
    id: 'calidad',
    title: 'CALIDAD',
    heading: 'Calidad real, lote a lote',
    body: 'Probamos cada café antes de incorporarlo. Solo trabajamos perfiles equilibrados, dulces y limpios para que la experiencia en casa sea constante.',
    highlights: [
      'Control de frescura y fecha de tueste.',
      'Selección por perfil sensorial.',
      'Consistencia entre lotes y formatos.',
    ],
  },
  {
    id: 'tueste',
    title: 'TUESTE ARTESANAL 100% NATURAL',
    heading: 'Tueste artesanal 100% natural',
    body: 'Tostamos en curvas suaves para preservar lo mejor de cada grano: dulzor, acidez agradable y cuerpo limpio, sin quemar ni tapar matices.',
    highlights: [
      'Curvas de tueste adaptadas por origen.',
      'Sin aromas añadidos ni saborizantes.',
      'Envasado rápido para proteger los aromas.',
    ],
  },
  {
    id: 'trazabilidad',
    title: 'TRAZABILIDAD',
    heading: 'Trazabilidad y transparencia',
    body: 'Conoces de dónde viene tu café y cómo se trabajó. Elegimos productores y tostadores que priorizan prácticas responsables y precio justo.',
    highlights: [
      'Información de origen y proceso.',
      'Cadena de valor más transparente.',
      'Relaciones sostenibles con productores.',
    ],
  },
  {
    id: 'que-notas',
    title: '¿QUE VAS A NOTAR AL PROBAR NUESTRO CAFE?',
    heading: '¿Qué vas a notar en taza?',
    body: 'Una taza más limpia y expresiva: notas frutales, achocolatadas o florales según el origen, con final largo y agradable.',
    highlights: [
      'Aroma definido desde la molienda.',
      'Sabores más nítidos y menos amargos.',
      'Mejor equilibrio entre dulzor y acidez.',
    ],
  },
  {
    id: 'por-que',
    title: '¿POR QUE ELEGIR CAFE DE ESPECIALIDAD?',
    heading: '¿Por qué elegir café de especialidad?',
    body: 'Porque mejora tu ritual diario y además respalda una cadena más cuidada: mejor producto para ti y mejores prácticas para quienes lo producen.',
    highlights: [
      'Más sabor y mejor experiencia diaria.',
      'Mayor control de origen y proceso.',
      'Consumo más consciente y responsable.',
    ],
  },
  {
    id: 'tipos',
    title: 'NUESTROS TIPOS DE CAFE DE ESPECIALIDAD',
    heading: 'Nuestros tipos de café',
    body: 'Trabajamos perfiles para espresso y filtro, con tuestes pensados para quienes buscan intensidad, equilibrio o una taza más delicada.',
    highlights: [
      'Perfiles para espresso y cafetera italiana.',
      'Opciones para V60, Chemex o prensa francesa.',
      'Distintos niveles de intensidad y notas.',
    ],
  },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, damping: 26, stiffness: 290 },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.16 } },
};

const mobileVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
  exit: { y: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
};

export const Hero: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [mobileHeroHeight, setMobileHeroHeight] = useState<number | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);

  const heroImageNumber = useMemo(() => Math.floor(Math.random() * 3) + 1, []);

  const activeSection = useMemo(
    () => HERO_INFO_SECTIONS.find((section) => section.id === activeSectionId) ?? null,
    [activeSectionId],
  );

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
      const nextHeight = Math.max(520, Math.min(820, Math.round(availableHeight)));

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
        className="mt-10 sm:mt-6 md:mt-10 -mx-4 md:-mx-10 lg:-mx-16 relative h-[clamp(520px,145vw,820px)] sm:h-[clamp(560px,115vw,780px)] lg:h-[clamp(560px,60vw,700px)]"
        style={mobileHeroHeight ? { height: `${mobileHeroHeight}px` } : undefined}
      >

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
              srcSet={`/images/hero1-mobile.png`}
            />
            <img
              src={`/images/hero3.png`}
              alt="Mesa mediterranea con cafe y ceramica"
              className="h-full w-full object-cover object-[center_30%] sm:object-center"
              loading="eager"
              decoding="async"
            />
          </picture>
          {/* Gradiente superior suavizado para legibilidad del texto (difuminado más amplio) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.2) 14%, rgba(0,0,0,0.08) 32%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
              filter: 'blur(8px)'
            }}
          />
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
            className="hidden lg:block absolute right-4 xl:right-8 top-8 xl:top-10 z-30 w-[min(38vw,460px)]"
          >
            <div className="rounded-2xl overflow-hidden border border-[#aec1d3] bg-gradient-to-br from-[#f8efe1]/92 via-[#f4f0ea]/90 to-[#dbe8f0]/88 backdrop-blur-[3px] shadow-[0_10px_30px_rgba(26,58,92,0.18)] ring-1 ring-white/40">
              <div className="h-[3px] bg-gradient-to-r from-[#ca7f46] via-[#1a7ab5] to-[#e0b07c]" />
              <h2 className="px-4 py-3 text-[#174470] font-mono text-[0.78rem] leading-[1.35] uppercase tracking-[0.1em]">
                Compra cafe de especialidad o specialty coffee
              </h2>

              <div className="border-t border-[#b9cad9] max-h-[45vh] overflow-y-auto">
                {HERO_INFO_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-[#c7d5e1] text-left text-[#174470] hover:bg-[#fff9f1]/70 transition-colors"
                  >
                    <span className="shrink-0 text-[#1a6ca2]">
                      <Plus size={20} strokeWidth={2.6} />
                    </span>
                    <span className="font-mono uppercase tracking-[0.06em] text-[0.8rem] leading-[1.25]">
                      {section.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Botones — entran desde abajo, quedan en el fondo */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.2, 0.65, 0.2, 1] }}
            className="max-w-[1280px] flex flex-wrap gap-3 absolute left-4 right-4 bottom-4 z-30 sm:static sm:mx-auto sm:w-full sm:left-auto sm:right-auto sm:bottom-auto"
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

      <HeroInfoPopover section={activeSection} onClose={() => setActiveSectionId(null)} />
    </header>
  );
};

interface HeroInfoPopoverProps {
  section: HeroInfoSection | null;
  onClose: () => void;
}

const HeroInfoPopover: React.FC<HeroInfoPopoverProps> = ({ section, onClose }) => {
  const modal = (
    <AnimatePresence>
      {section && (
        <div
          className="fixed inset-0 z-modal flex items-end lg:items-center lg:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={section.heading}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-h-[92vh] bg-page rounded-t-3xl overflow-y-auto shadow-xl lg:hidden"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-page rounded-t-3xl">
              <div className="w-10 h-1 rounded-full bg-stone/40" />
            </div>

            <div className="px-5 pb-7">
              <div className="flex justify-end -mt-1 mb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-[1.5rem] leading-tight font-semibold text-primary mb-3">{section.heading}</h3>
              <p className="text-secondary leading-relaxed mb-5">{section.body}</p>

              <div className="space-y-2.5">
                {section.highlights.map((item) => (
                  <div key={item} className="rounded-xl bg-surface px-4 py-3 text-sm text-primary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative hidden lg:block w-full max-w-[780px] bg-page rounded-3xl overflow-hidden shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-8 lg:p-10">
              <div className="flex justify-end -mt-2 -mr-2 mb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-3xl font-semibold text-primary mb-3">{section.heading}</h3>
              <p className="text-secondary leading-relaxed mb-6">{section.body}</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {section.highlights.map((item) => (
                  <div key={item} className="rounded-2xl bg-surface px-4 py-3.5 text-sm text-primary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') {
    return modal;
  }

  return createPortal(modal, document.body);
};
