import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { ArrowRight, Compass, Package, Repeat } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';

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

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const CoffeePaths: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <section id="elige-tu-camino" className="mt-14 px-4 md:mt-24 md:px-10 lg:px-16">
      <div className="max-w-[1160px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-[42rem]"
        >
          <p
            className="uppercase tracking-[0.24em] text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Elige tu camino
          </p>
          <h2 className="mt-3 glopet-title text-[1.85rem] leading-[1.02] sm:mt-4 sm:text-[2.8rem] lg:text-[3.2rem]" style={{ color: 'var(--color-espresso)' }}>
            Tres formas simples de entrar en Glopet.
          </h2>
          <p className="mt-3 max-w-[44ch] text-sm leading-relaxed sm:mt-4 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Compra puntual, suscripcion flexible o recomendacion guiada. La home ahora explica con claridad por donde empezar.
          </p>
        </motion.div>

        <div className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-10 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0 lg:pr-0">
          {PATHS.map(({ title, text, accent, border, icon: Icon, ctaLabel, to }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
              className="flex min-h-[232px] w-[82vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[1.4rem] border p-4 sm:min-h-[260px] sm:w-auto sm:max-w-none sm:rounded-[2rem] sm:p-7 md:p-8 lg:h-full"
              style={{
                background: 'var(--bg-surface)',
                borderColor: border,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl"
                style={{ background: accent, color: 'var(--color-espresso)' }}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 text-[1.18rem] leading-[1.02] sm:mt-6 sm:text-[1.45rem]" style={{ color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {title}
              </h3>
              <p className="mt-2.5 flex-1 text-[0.88rem] leading-relaxed sm:mt-3 sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {text}
              </p>
              {to ? (
                <Button
                  as={RouterLink}
                  to={to}
                  size="sm"
                  radius="full"
                  className="mt-4 h-10 w-full bg-[#1a3a5c] px-4 text-[#faf6ef] sm:mt-7 sm:h-auto sm:w-fit sm:px-6"
                  endContent={<ArrowRight size={15} />}
                >
                  {ctaLabel}
                </Button>
              ) : (
                <Button
                  size="sm"
                  radius="full"
                  className="mt-4 h-10 w-full bg-[#c4763a] px-4 text-[#faf6ef] sm:mt-7 sm:h-auto sm:w-fit sm:px-6"
                  endContent={<ArrowRight size={15} />}
                  onPress={() => actions.openQuiz()}
                >
                  {ctaLabel}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};