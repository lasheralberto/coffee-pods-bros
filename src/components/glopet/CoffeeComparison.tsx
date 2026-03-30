import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

type ComparisonRow = {
  label: string;
  generic: string;
  glopet: string;
};

const ROWS: readonly ComparisonRow[] = [
  {
    label: 'Sabor plano',
    generic: 'Cafe viejo o de rotacion larga que pierde aroma y expresion.',
    glopet: 'Tueste reciente y una taza con mas definicion desde la molienda.',
  },
  {
    label: 'Poca claridad',
    generic: 'No sabes bien que compras ni por que sabe como sabe.',
    glopet: 'Origen, perfil y proceso explicados para elegir con criterio.',
  },
  {
    label: 'Rigidez',
    generic: 'Opciones cerradas y compras que no se adaptan a tu ritmo real.',
    glopet: 'Compra puntual o suscripcion flexible para ajustar cuando quieras.',
  },
] as const;

const EASE = [0.2, 0.65, 0.2, 1] as const;

const ComparisonCard: React.FC<ComparisonRow & { index: number }> = ({
  label,
  generic,
  glopet,
  index,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.48'],
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 1], [0.22, 1]), {
    stiffness: 180,
    damping: 24,
    mass: 0.5,
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [72 + index * 10, 0]), {
    stiffness: 150,
    damping: 22,
    mass: 0.55,
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.92, 1]), {
    stiffness: 180,
    damping: 24,
    mass: 0.55,
  });
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 1], [10, 0]), {
    stiffness: 170,
    damping: 22,
    mass: 0.45,
  });
  const innerParallax = useSpring(useTransform(scrollYProgress, [0, 1], [24, -10]), {
    stiffness: 130,
    damping: 20,
    mass: 0.45,
  });

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale, rotateX, transformPerspective: 1200 }}
      className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/6 backdrop-blur-sm will-change-transform"
    >
      <motion.div style={{ y: innerParallax }} className="will-change-transform">
        <div className="border-b border-white/10 px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#e8d5b0] sm:px-5">
          {label}
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex gap-3 px-4 py-4 text-sm leading-relaxed text-[#e4d8c8] sm:px-5">
            <Minus size={17} className="mt-0.5 shrink-0 text-[#d8c7a5]" />
            <div>
              <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#d8c7a5]">
                Cafe convencional
              </p>
              <span>{generic}</span>
            </div>
          </div>
          <div className="flex gap-3 border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-[#faf6ef] md:border-l md:border-t-0 sm:px-5">
            <Check size={17} className="mt-0.5 shrink-0 text-[#e8d5b0]" />
            <div>
              <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#e8d5b0]">
                Glopet
              </p>
              <span>{glopet}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CoffeeComparison: React.FC = () => {
  return (
    <section id="comparativa" className="mt-14 px-4 md:mt-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1160px] rounded-[1.8rem] border px-5 py-6 md:rounded-[2.4rem] md:px-10 md:py-10" style={{ background: '#1a3a5c', borderColor: 'rgba(232,213,176,0.28)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-[36rem]"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[#e8d5b0]">Por que cambiar</p>
          <h2 className="mt-3 glopet-title text-[1.9rem] leading-[1.02] text-[#faf6ef] sm:mt-4 sm:text-[2.9rem] lg:text-[3.2rem]">
            El problema no es tomar cafe. Es conformarte.
          </h2>
          <p className="mt-3 max-w-[34rem] text-sm leading-relaxed text-[#e4d8c8] sm:text-base">
            Si buscas mejor sabor, mas criterio al elegir y una compra que se adapte a ti, aqui esta la diferencia.
          </p>
        </motion.div>

        <div className="mt-6 grid gap-3 [perspective:1200px] md:mt-8 md:gap-4">
          {ROWS.map(({ label, generic, glopet }, index) => (
            <ComparisonCard
              key={label}
              label={label}
              generic={generic}
              glopet={glopet}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};