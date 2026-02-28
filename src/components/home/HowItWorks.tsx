import React from 'react';
import { ClipboardCheck, CalendarSync, PackageOpen } from 'lucide-react';
import { t } from '../../data/texts';

const STEPS = [
  { id: 1, icon: ClipboardCheck, textKey: 'howItWorks.step1' },
  { id: 2, icon: CalendarSync,   textKey: 'howItWorks.step2' },
  { id: 3, icon: PackageOpen,    textKey: 'howItWorks.step3' },
];

export const HowItWorks: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#e4f54a',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
      }}
    >
      {/* Badge */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(26,15,10,0.55)',
          marginBottom: '1.5rem',
        }}
      >
        {t('howItWorks.badge')}
      </p>

      {/* Steps row */}
      <div
        style={{
          maxWidth: '72rem',
          marginInline: 'auto',
          paddingInline: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              style={{
                flex: '1 1 0%',
                minWidth: '250px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingInline: '1.5rem',
                paddingBlock: '0.75rem',
                borderLeft: idx > 0 ? '1px solid rgba(26,15,10,0.15)' : 'none',
              }}
            >
              <Icon size={34} strokeWidth={1.2} style={{ color: 'rgba(26,15,10,0.65)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1A0F0A', lineHeight: 1.4 }}>
                {t(step.textKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
