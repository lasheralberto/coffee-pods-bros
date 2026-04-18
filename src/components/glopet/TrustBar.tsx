import React from 'react';
import { Truck, Leaf, Clock, Shield, Coffee } from 'lucide-react';

const ITEMS = [
  { icon: Clock, text: 'Tostado esta semana' },
  { icon: Truck, text: 'Envío en 48h' },
  { icon: Leaf, text: 'Origen trazable' },
  { icon: Shield, text: 'Sin compromiso' },
  { icon: Coffee, text: 'Desde 0,28€ la taza' },
] as const;

export const TrustBar: React.FC = React.memo(() => {
  // Double items for seamless infinite scroll
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--ds-surface-container-low)',
        boxShadow: '0 1px 0 var(--ds-outline-variant) inset, 0 -1px 0 var(--ds-outline-variant) inset',
      }}
    >
      <div className="trust-marquee flex w-max">
        {doubled.map(({ icon: Icon, text }, i) => (
          <div
            key={`${text}-${i}`}
            className="flex items-center gap-2.5 px-8 py-4 md:py-5"
          >
            <Icon size={14} strokeWidth={1.5} style={{ color: 'var(--ds-primary-container)' }} />
            <span
              className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold whitespace-nowrap"
              style={{ color: 'var(--ds-on-surface)', fontFamily: 'var(--font-label)' }}
            >
              {text}
            </span>
            <span className="ml-6 text-[0.45rem]" style={{ color: 'var(--ds-outline-variant)' }}>&#9670;</span>
          </div>
        ))}
      </div>
    </section>
  );
});
