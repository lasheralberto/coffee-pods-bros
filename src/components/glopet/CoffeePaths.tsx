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
  },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const CoffeePaths: React.FC = () => {
  const { actions } = useQuizStore();

  return (
    <section id="elige-tu-camino" className="px-4 md:px-10 lg:px-16 mt-24">
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
          <h2 className="mt-4 glopet-title text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] leading-[1.05]" style={{ color: 'var(--color-espresso)' }}>
            Tres formas simples de entrar en Glopet.
          </h2>
          <p className="mt-4 max-w-[44ch] text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Compra puntual, suscripcion flexible o recomendacion guiada. La home ahora explica con claridad por donde empezar.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PATHS.map(({ title, text, accent, border, icon: Icon, ctaLabel, to }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
              className="flex h-full flex-col rounded-[2rem] border p-7 md:p-8"
              style={{
                background: 'var(--bg-surface)',
                borderColor: border,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: accent, color: 'var(--color-espresso)' }}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-[1.45rem] leading-tight" style={{ color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {text}
              </p>
              {to ? (
                <Button
                  as={RouterLink}
                  to={to}
                  size="lg"
                  radius="full"
                  className="mt-7 w-fit bg-[#1a3a5c] px-6 text-[#faf6ef]"
                  endContent={<ArrowRight size={16} />}
                >
                  {ctaLabel}
                </Button>
              ) : (
                <Button
                  size="lg"
                  radius="full"
                  className="mt-7 w-fit bg-[#c4763a] px-6 text-[#faf6ef]"
                  endContent={<ArrowRight size={16} />}
                  onPress={actions.openQuiz}
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