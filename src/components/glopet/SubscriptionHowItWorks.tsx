import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { CalendarRange, Coffee, PackageCheck, PauseCircle, SlidersHorizontal } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const STEPS = [
  {
    title: 'Elige tu base',
    text: 'Escoge el perfil, el formato y la frecuencia que mejor encajan con lo que bebes de verdad.',
    icon: Coffee,
  },
  {
    title: 'Ajusta cuando quieras',
    text: 'Puedes cambiar cantidad, pausar, mover la fecha o pasar a otro cafe sin empezar de cero.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Recibelo fresco en casa',
    text: 'Cada envio llega listo para seguir tu ritmo, sin acumular cafe ni depender de recordatorios.',
    icon: PackageCheck,
  },
] as const;

const CONTROLS = [
  { label: 'Pausar sin penalizacion', icon: PauseCircle },
  { label: 'Cambiar fecha de entrega', icon: CalendarRange },
  { label: 'Moverte entre perfiles', icon: Coffee },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const SubscriptionHowItWorks: React.FC = () => {
  return (
    <section id="como-funciona-suscripcion" className="px-4 md:px-10 lg:px-16 mt-24">
      <div className="max-w-[1160px] mx-auto grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2.2rem] border p-7 md:p-10" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
              Como funciona la suscripcion
            </p>
            <h2 className="mt-4 glopet-title text-[2.2rem] sm:text-[2.8rem] leading-[1.05]" style={{ color: 'var(--color-espresso)' }}>
              Una suscripcion que se adapta a tu consumo, no al reves.
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              La home necesitaba explicar de forma directa que puedes cambiar, que recibes y por que suscribirte no te encierra. Este bloque resuelve justo eso.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            {STEPS.map(({ title, text, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: EASE, delay: index * 0.08 }}
                className="flex gap-4 rounded-[1.5rem] border p-5"
                style={{ background: 'var(--bg-page)', borderColor: 'rgba(207, 187, 149, 0.55)' }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(196,118,58,0.12)', color: 'var(--color-caramel)' }}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[1rem] font-semibold leading-tight" style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}>
                    {index + 1}. {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="rounded-[2.2rem] border p-7 md:p-10"
          style={{ background: '#faf6ef', borderColor: 'rgba(207, 187, 149, 0.8)' }}
        >
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Lo que puedes cambiar
          </p>
          <div className="mt-6 space-y-3">
            {CONTROLS.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-[1.1rem] border px-4 py-3" style={{ borderColor: 'rgba(207, 187, 149, 0.7)', background: 'rgba(255,255,255,0.72)' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(26,58,92,0.08)', color: 'var(--color-espresso)' }}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-[#1a3a5c] px-5 py-6 text-[#faf6ef]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#e8d5b0]">Lo que recibes</p>
            <p className="mt-3 text-lg leading-snug" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Cafe fresco, una experiencia estable y el margen suficiente para adaptar la suscripcion a tu semana, no a un calendario fijo.
            </p>
          </div>

          <Button
            as={RouterLink}
            to="/subscriptions"
            size="lg"
            radius="full"
            className="mt-8 bg-[#c4763a] px-7 text-[#faf6ef]"
          >
            Ver opciones de suscripcion
          </Button>
        </motion.div>
      </div>
    </section>
  );
};