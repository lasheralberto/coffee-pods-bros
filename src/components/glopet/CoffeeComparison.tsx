import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

const ROWS = [
  {
    label: 'Frescura real',
    generic: 'Cafe de larga rotacion, mas plano y con menos aroma al abrir.',
    glopet: 'Tueste reciente y perfiles con mas definicion desde la molienda hasta el final.',
  },
  {
    label: 'Trazabilidad',
    generic: 'Origen difuso y poca informacion sobre productor, lote o proceso.',
    glopet: 'Seleccion por origen, notas de taza y referencias concretas del lote cuando estan disponibles.',
  },
  {
    label: 'Flexibilidad',
    generic: 'Formatos cerrados y una compra menos adaptable a tu consumo real.',
    glopet: 'Compra puntual o suscripcion que puedes pausar, mover o ajustar segun tu ritmo.',
  },
  {
    label: 'Impacto cotidiano',
    generic: 'Mas rutina automatica y menos ritual. A menudo mas residuo innecesario.',
    glopet: 'Mejor taza, decision mas consciente y una experiencia que convierte el cafe en momento.',
  },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const CoffeeComparison: React.FC = () => {
  return (
    <section id="comparativa" className="px-4 md:px-10 lg:px-16 mt-24">
      <div className="max-w-[1160px] mx-auto rounded-[2.4rem] border px-6 py-8 md:px-10 md:py-12" style={{ background: '#1a3a5c', borderColor: 'rgba(232,213,176,0.28)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-[44rem]"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[#e8d5b0]">Por que cambiar</p>
          <h2 className="mt-4 glopet-title text-[2.2rem] sm:text-[2.9rem] lg:text-[3.2rem] leading-[1.05] text-[#faf6ef]">
            ¿Por qué Café de Especialidad de Glopet?
          </h2>
          
        </motion.div>

        <div className="mt-10 overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-1 border-b border-white/10 md:grid-cols-[0.9fr_1fr_1fr]">
            <div className="hidden md:block" />
            <div className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#d8c7a5]">Cafe convencional</div>
            <div className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#faf6ef]">Glopet</div>
          </div>
          {ROWS.map(({ label, generic, glopet }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
              className="grid grid-cols-1 border-b border-white/10 last:border-b-0 md:grid-cols-[0.9fr_1fr_1fr]"
            >
              <div className="px-5 py-5 text-sm font-semibold text-[#faf6ef] md:text-base">{label}</div>
              <div className="flex gap-3 px-5 py-5 text-sm leading-relaxed text-[#e4d8c8]">
                <Minus size={18} className="mt-0.5 shrink-0 text-[#d8c7a5]" />
                <span>{generic}</span>
              </div>
              <div className="flex gap-3 px-5 py-5 text-sm leading-relaxed text-[#faf6ef]">
                <Check size={18} className="mt-0.5 shrink-0 text-[#e8d5b0]" />
                <span>{glopet}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};