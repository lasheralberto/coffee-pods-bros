import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, MapPin, Coffee } from 'lucide-react';
import { t } from '../../data/texts';

const EASE_DEFAULT = [0.2, 0.65, 0.2, 1] as const;

const FEATURES = [
  {
    key: 'feature1',
    icon: <Coffee size={26} strokeWidth={1.6} />,
    delay: 0,
  },
  {
    key: 'feature2',
    icon: <FlaskConical size={26} strokeWidth={1.6} />,
    delay: 0.1,
  },
  {
    key: 'feature3',
    icon: <MapPin size={26} strokeWidth={1.6} />,
    delay: 0.2,
  },
  {
    key: 'feature4',
    icon: <Leaf size={26} strokeWidth={1.6} />,
    delay: 0.3,
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_DEFAULT, delay },
  }),
};

export const WhyGlopet: React.FC = () => {
  return (
    <section
      id="por-que-glopet"
      className="mt-20 px-4 md:px-10 lg:px-16 py-16"
      style={{ background: 'var(--bg-surface)' }}
    >
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_DEFAULT }}
          className="text-center mb-12"
        >
          <p
            className="uppercase tracking-[0.24em] text-xs mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {t('whyGlopet.badge')}
          </p>
          <h2
            className="glopet-title text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] leading-[1.1] mb-4"
            style={{ color: 'var(--color-espresso)' }}
          >
            {t('whyGlopet.heading')}
          </h2>
          <p
            className="text-base max-w-[46ch] mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('whyGlopet.subheading')}
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {FEATURES.map(({ key, icon, delay }) => (
            <motion.div
              key={key}
              custom={delay}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.22 } }}
              className="rounded-[1.5rem] border p-6 flex flex-col gap-4"
              style={{
                background: 'var(--bg-page)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Icon badge */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(196,118,58,0.14), rgba(26,58,92,0.08))',
                  color: 'var(--color-caramel)',
                  border: '1px solid rgba(196,118,58,0.20)',
                }}
              >
                {icon}
              </div>

              <div>
                <h3
                  className="font-semibold text-[1.05rem] leading-snug mb-2"
                  style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}
                >
                  {t(`whyGlopet.${key}Title`)}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t(`whyGlopet.${key}Text`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
