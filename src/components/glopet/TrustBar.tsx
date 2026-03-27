import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Headset, RefreshCcw, Truck } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Entrega en 48h',
    text: 'Salimos rapido para que el cafe llegue fresco y no pierda expresion en taza.',
    icon: Truck,
  },
  {
    title: 'Flexibilidad real',
    text: 'Pausa, cambia cantidad o mueve la fecha de tu suscripcion sin friccion.',
    icon: RefreshCcw,
  },
  {
    title: 'Pago seguro',
    text: 'Checkout protegido y claro, sin costes sorpresa al final del proceso.',
    icon: CreditCard,
  },
  {
    title: 'Ayuda humana',
    text: 'Si no sabes que elegir, te ayudamos a afinar perfil, formato y frecuencia.',
    icon: Headset,
  },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const TrustBar: React.FC = () => {
  return (
    <section id="confianza" className="px-4 md:px-10 lg:px-16 mt-10">
      <div
        className="max-w-[1160px] mx-auto rounded-[2rem] border px-5 py-5 md:px-7 md:py-6"
        style={{
          background: 'linear-gradient(135deg, rgba(250,246,239,0.94), rgba(245,234,217,0.72))',
          borderColor: 'rgba(207, 187, 149, 0.8)',
          boxShadow: '0 18px 42px rgba(28, 20, 16, 0.06)',
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {BENEFITS.map(({ title, text, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
              className="flex gap-4 rounded-[1.4rem] border p-4 md:p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.52)',
                borderColor: 'rgba(207, 187, 149, 0.55)',
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(196,118,58,0.18), rgba(26,58,92,0.12))',
                  color: 'var(--color-espresso)',
                }}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}
                >
                  {title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};