import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Gauge, PackageOpen } from 'lucide-react';
import { Container } from '../ui/Container';
import { t } from '../../data/texts';

const STEPS = [
  { id: 1, icon: ClipboardCheck, textKey: 'howItWorks.step1' },
  { id: 2, icon: Gauge, textKey: 'howItWorks.step2' },
  { id: 3, icon: PackageOpen, textKey: 'howItWorks.step3' },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-10 md:py-14">
      <Container size="xl">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[linear-gradient(120deg,rgba(20,209,255,0.10),rgba(217,255,72,0.08))] px-5 py-7 md:px-8 md:py-9 shadow-[var(--shadow-md)]">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-[var(--text-secondary)] mb-6 md:mb-8">
            {t('howItWorks.badge')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="group rounded-2xl border border-white/70 bg-white/70 backdrop-blur px-4 py-4 md:px-5 md:py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-espresso)] text-white flex items-center justify-center shrink-0">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] tracking-[0.28em] uppercase font-semibold text-[var(--text-muted)]">
                        0{step.id}
                      </span>
                      <p className="text-sm md:text-base font-medium leading-snug text-[var(--text-primary)]">
                        {t(step.textKey)}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
