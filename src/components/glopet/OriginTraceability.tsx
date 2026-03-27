import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, PackageCheck, ScanSearch, Wheat } from 'lucide-react';

const DETAIL_ITEMS = [
  { label: 'Productor', value: 'Familia Peixoto' },
  { label: 'Origen', value: 'Brasil' },
  { label: 'Perfil', value: 'Avellana, caramelo y cuerpo sedoso' },
  { label: 'Tueste', value: 'Medio' },
  { label: 'Formatos', value: '250g, 500g y 1kg' },
  { label: 'Marca', value: 'Peixoto' },
] as const;

const TRACE_POINTS = [
  {
    title: 'Origen identificado',
    text: 'No hablamos de cafe generico. Hablamos de lotes y productores reconocibles dentro del catalogo.',
    icon: MapPin,
  },
  {
    title: 'Perfil entendible',
    text: 'Notas de taza y tueste para que sepas si vas hacia una taza mas dulce, mas limpia o mas intensa.',
    icon: Wheat,
  },
  {
    title: 'Seleccion util',
    text: 'La trazabilidad no se queda en discurso: te ayuda a comprar mejor y repetir con criterio.',
    icon: ScanSearch,
  },
  {
    title: 'Catalogo consistente',
    text: 'La informacion relevante se mantiene visible para comparar formatos, lotes y perfiles sin perder contexto.',
    icon: PackageCheck,
  },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

export const OriginTraceability: React.FC = () => {
  return (
    <section id="trazabilidad" className="px-4 md:px-10 lg:px-16 mt-24">
      <div className="max-w-[1160px] mx-auto grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="rounded-[2.2rem] border p-7 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(250,246,239,0.98), rgba(245,234,217,0.82))',
            borderColor: 'rgba(207, 187, 149, 0.8)',
          }}
        >
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Origen real y trazabilidad
          </p>
          <h2 className="mt-4 glopet-title text-[2.2rem] sm:text-[2.8rem] leading-[1.05]" style={{ color: 'var(--color-espresso)' }}>
            Un ejemplo concreto de lo que significa saber que estas tomando.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            En vez de vender una idea abstracta de calidad, Glopet puede bajar al detalle de cada cafe. Este bloque usa un lote ya presente en catalogo para hacerlo tangible.
          </p>

          <div className="mt-8 rounded-[1.7rem] border p-6 md:p-7" style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(207, 187, 149, 0.7)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#1a3a5c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#faf6ef]">
                Lote destacado
              </span>
              <span className="rounded-full border border-[#cfbb95] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#7e5d3f]">
                Peixoto · Familia Peixoto
              </span>
            </div>
            <p className="mt-5 text-[1.65rem] leading-tight" style={{ color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Directo de las fincas de la familia Peixoto en Brasil, con perfil dulce, redondo y facil de reconocer en taza.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DETAIL_ITEMS.map(({ label, value }) => (
                <div key={label} className="rounded-[1.1rem] border px-4 py-3" style={{ borderColor: 'rgba(207, 187, 149, 0.72)', background: 'rgba(250,246,239,0.75)' }}>
                  <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {TRACE_POINTS.map(({ title, text, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
              className="rounded-[1.7rem] border p-6"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(26,58,92,0.08)', color: 'var(--color-espresso)' }}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-[1.15rem] font-semibold leading-tight" style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};