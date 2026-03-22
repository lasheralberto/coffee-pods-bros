import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { t } from '../../data/texts';

const REVIEWS = [
  { quoteKey: 'review1Quote', nameKey: 'review1Name', roleKey: 'review1Role', delay: 0 },
  { quoteKey: 'review2Quote', nameKey: 'review2Name', roleKey: 'review2Role', delay: 0.12 },
  { quoteKey: 'review3Quote', nameKey: 'review3Name', roleKey: 'review3Role', delay: 0.24 },
] as const;

const Stars: React.FC = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} fill="currentColor" strokeWidth={0} style={{ color: 'var(--color-caramel)' }} />
    ))}
  </div>
);

export const Testimonials: React.FC = () => {
  return (
    <section
      id="testimonios"
      className="mt-20 px-4 md:px-10 lg:px-16 py-20"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.2, 0.65, 0.2, 1] }}
          className="text-center mb-14"
        >
          <p
            className="uppercase tracking-[0.24em] text-xs mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {t('testimonials.badge')}
          </p>
          <h2
            className="glopet-title text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1]"
            style={{ color: 'var(--color-espresso)' }}
          >
            {t('testimonials.heading')}
          </h2>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {REVIEWS.map(({ quoteKey, nameKey, roleKey, delay }) => (
            <motion.div
              key={quoteKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.2, 0.65, 0.2, 1], delay }}
              className="relative flex flex-col rounded-[1.75rem] p-7 border"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Decorative quote mark */}
              <span
                aria-hidden="true"
                className="glopet-title absolute top-5 right-6 select-none leading-none"
                style={{
                  fontSize: '5rem',
                  color: 'rgba(196,118,58,0.12)',
                  lineHeight: 1,
                }}
              >
                &ldquo;
              </span>

              <Stars />

              <p
                className="mt-4 text-[0.95rem] leading-relaxed flex-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                &ldquo;{t(`testimonials.${quoteKey}`)}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                {/* Avatar initials */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-caramel), var(--color-roast))',
                    color: 'var(--color-cream)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {Array.from(t(`testimonials.${nameKey}`))[0] ?? ''}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}
                  >
                    {t(`testimonials.${nameKey}`)}
                  </p>
                  <p
                    className="text-xs leading-tight mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t(`testimonials.${roleKey}`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
