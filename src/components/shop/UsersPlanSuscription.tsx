import React, { useRef, useState, useCallback, useEffect, type CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import { t } from '../../data/texts';
import { getSubscriptionPlans, type SubscriptionPlanFirestore } from '../../providers/firebaseProvider';
import { getLocale } from '../../data/texts';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — hardcoded so nothing external can override
═══════════════════════════════════════════════════════════ */

const C = {
  cream:       '#FAF7F2',
  espresso:    '#1A0F0A',
  roast:       '#7B2D00',
  caramel:     '#C4773B',
  foam:        '#EDE8E0',
  accent:      '#E8622A',
  leaf:        '#4A5E3A',
  stone:       '#8C8580',
  secondary:   '#5C4F48',
  border:      '#DDD8D0',
  borderStrong:'#C4BCB4',
} as const;

const FONT = {
  display: '"Cormorant Garamond", Georgia, serif',
  body:    '"Cabinet Grotesk", system-ui, sans-serif',
} as const;

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceCents: string;
  interval: string;
  badge: string;
  subscribeCta: string;
  features: string[];
  highlighted?: boolean;
  accentColor: string;
  glowColor: string;
}

/* ═══════════════════════════════════════════════════════════
   DATA — fallback when Firestore `suscriptionPlans` is empty
═══════════════════════════════════════════════════════════ */

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'explorer',
    name: t('subs.explorerName'),
    description: t('subs.explorerDesc'),
    price: '12',
    priceCents: '90',
    interval: t('subs.perMonth'),
    badge: t('subs.explorerBadge'),
    subscribeCta: t('subs.subscribeCta'),
    accentColor: C.leaf,
    glowColor: 'rgba(74, 94, 58, 0.18)',
    features: [
      t('subs.feat250g'),
      t('subs.featMonthly'),
      t('subs.featFreeShipping'),
      t('subs.featCancel'),
    ],
  },
  {
    id: 'connoisseur',
    name: t('subs.connoisseurName'),
    description: t('subs.connoisseurDesc'),
    price: '19',
    priceCents: '90',
    interval: t('subs.perMonth'),
    badge: t('subs.connoisseurBadge'),
    subscribeCta: t('subs.subscribeCta'),
    accentColor: C.caramel,
    glowColor: 'rgba(196, 119, 59, 0.22)',
    features: [
      t('subs.feat500g'),
      t('subs.featBiweekly'),
      t('subs.featFreeShipping'),
      t('subs.featExclusive'),
      t('subs.featCancel'),
    ],
    highlighted: true,
  },
  {
    id: 'roaster',
    name: t('subs.roasterName'),
    description: t('subs.roasterDesc'),
    price: '29',
    priceCents: '90',
    interval: t('subs.perMonth'),
    badge: t('subs.roasterBadge'),
    subscribeCta: t('subs.subscribeCta'),
    accentColor: C.roast,
    glowColor: 'rgba(123, 45, 0, 0.18)',
    features: [
      t('subs.feat1kg'),
      t('subs.featBiweekly'),
      t('subs.featFreeShipping'),
      t('subs.featTasting'),
      t('subs.featPriority'),
      t('subs.featCancel'),
    ],
  },
];


/* ═══════════════════════════════════════════════════════════
   MOBILE DETECTION HOOK
═══════════════════════════════════════════════════════════ */

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

/* ═══════════════════════════════════════════════════════════
   MAGNETIC HOVER HOOK
═══════════════════════════════════════════════════════════ */

function useMagneticHover(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [strength, -strength]), {
    stiffness: 200, damping: 28,
  });
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-strength, strength]), {
    stiffness: 200, damping: 28,
  });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    rawX.set(((e.clientX - left) / width) * 2 - 1);
    rawY.set(((e.clientY - top) / height) * 2 - 1);
  }, [rawX, rawY]);

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

/* ═══════════════════════════════════════════════════════════
   PLAN CARD
═══════════════════════════════════════════════════════════ */

const PlanCard: React.FC<{
  plan: Plan;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isMobile: boolean;
}> = ({ plan, index, isSelected, onSelect, isMobile }) => {
  const hl = !!plan.highlighted;
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useMagneticHover(hl ? 6 : 4);

  const shellStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    transition: 'box-shadow 0.5s ease, border-color 0.3s ease',
    background: hl ? C.espresso : 'rgba(255,255,255,0.82)',
    backdropFilter: hl ? undefined : 'blur(12px)',
    border: hl
      ? '1px solid rgba(196,119,59,0.3)'
      : '1px solid rgba(255,255,255,0.6)',
    boxShadow: hl
      ? '0 32px 64px -12px rgba(26,15,10,0.45)'
      : '0 8px 32px -8px rgba(26,15,10,0.12)',
    ...(isSelected && !hl
      ? { outline: '2px solid rgba(196,119,59,0.6)', outlineOffset: 2 }
      : {}),
  };

  const innerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: isMobile ? '18px 16px' : '28px 28px',
  };

  const badgeStyle: CSSProperties = {
    alignSelf: 'flex-start',
    fontSize: isMobile ? 9 : 10,
    fontWeight: 700,
    fontFamily: FONT.body,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    padding: isMobile ? '4px 10px' : '6px 12px',
    borderRadius: 999,
    marginBottom: isMobile ? 12 : 20,
    background: hl ? 'rgba(196,119,59,0.2)' : C.foam,
    color: hl ? C.caramel : C.stone,
    border: hl ? 'none' : `1px solid ${C.border}`,
  };

  const nameStyle: CSSProperties = {
    fontFamily: FONT.display,
    fontSize: isMobile ? '1.25rem' : '1.75rem',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: isMobile ? 4 : 8,
    color: hl ? C.cream : C.espresso,
  };

  const descStyle: CSSProperties = {
    fontSize: isMobile ? 12 : 13,
    lineHeight: 1.5,
    marginBottom: isMobile ? 16 : 28,
    minHeight: isMobile ? 36 : 44,
    color: hl ? 'rgba(250,247,242,0.5)' : C.stone,
  };

  const dividerStyle: CSSProperties = {
    height: 1,
    width: '100%',
    marginBottom: isMobile ? 14 : 24,
    background: hl ? 'rgba(255,255,255,0.1)' : C.border,
  };

  const ctaStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: isMobile ? '11px 16px' : '14px 20px',
    borderRadius: isMobile ? 12 : 16,
    border: 'none',
    cursor: 'pointer',
    fontFamily: FONT.body,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
    background: hl ? C.caramel : C.espresso,
    color: hl ? C.espresso : C.cream,
    boxShadow: hl ? '0 4px 20px rgba(196,119,59,0.35)' : 'none',
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      whileHover={{ y: hl ? -10 : -6 }}
    >
      {/* Outer glow (highlighted only) */}
      {hl && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 28,
            pointerEvents: 'none',
            background: plan.glowColor,
            filter: 'blur(24px)',
            transform: 'scale(1.08) translateZ(-1px)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Card shell */}
      <div style={shellStyle}>
        {/* Top gradient bar */}
        <div
          style={{
            height: 3,
            width: '100%',
            background: `linear-gradient(90deg, ${plan.accentColor}, transparent)`,
          }}
        />

        {/* Inner content */}
        <div style={innerStyle}>
          {/* Badge */}
          <motion.span
            style={badgeStyle}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {plan.badge}
          </motion.span>

          {/* Plan name */}
          <h3 style={nameStyle}>{plan.name}</h3>

          {/* Description */}
          <p style={descStyle}>{plan.description}</p>

          {/* Price block */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: isMobile ? 16 : 28 }}>
            <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginTop: isMobile ? 4 : 8, color: hl ? 'rgba(250,247,242,0.6)' : C.stone }}>
              €
            </span>
            <motion.span
              style={{
                fontSize: isMobile ? '2.25rem' : '3.5rem',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: hl ? C.cream : C.espresso,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            >
              {plan.price}
            </motion.span>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 2, marginTop: isMobile ? 4 : 8 }}>
              <span style={{ fontSize: isMobile ? '0.95rem' : '1.25rem', fontWeight: 700, lineHeight: 1, color: hl ? C.cream : C.espresso }}>
                ,{plan.priceCents}
              </span>
              <span style={{ fontSize: isMobile ? 10 : 11, marginTop: 4, letterSpacing: '0.04em', color: hl ? 'rgba(250,247,242,0.4)' : C.stone }}>
                {plan.interval}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={dividerStyle} />

          {/* Features */}
          <ul style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 14, marginBottom: isMobile ? 18 : 32, flex: 1, listStyle: 'none', padding: 0 }}>
            {plan.features.map((fKey, fi) => (
              <motion.li
                key={fKey}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + fi * 0.05 + 0.4 }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: hl ? 'rgba(196,119,59,0.25)' : C.foam,
                    border: hl ? 'none' : `1px solid ${C.border}`,
                  }}
                >
                  <Check size={10} strokeWidth={3} color={hl ? C.caramel : C.leaf} />
                </span>
                <span style={{ fontSize: isMobile ? 11 : 13, lineHeight: 1.4, color: hl ? 'rgba(250,247,242,0.75)' : C.secondary }}>
                  {fKey}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={ctaStyle}
          >
            <span>{plan.subscribeCta}</span>
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   QUIZ CTA BANNER
═══════════════════════════════════════════════════════════ */

const QuizCtaBanner: React.FC<{ onOpenQuiz: () => void; isMobile: boolean }> = ({ onOpenQuiz, isMobile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    style={{
      position: 'relative',
      marginBottom: isMobile ? 24 : 40,
      borderRadius: isMobile ? 20 : 28,
      overflow: 'hidden',
      background: C.espresso,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 64px -16px rgba(26,15,10,0.5)',
    }}
  >
    {/* Background noise texture */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: 128,
      }}
    />

    {/* Ambient glow */}
    <div
      style={{
        position: 'absolute',
        top: -64,
        right: -64,
        width: 288,
        height: 288,
        borderRadius: '50%',
        pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(196,119,59,0.15) 0%, transparent 70%)',
      }}
    />

    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? 16 : 24,
        padding: isMobile ? '24px 16px' : '36px 32px',
      }}
    >
      {/* Text */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <motion.span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: FONT.body,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            background: 'rgba(196,119,59,0.15)',
            color: C.caramel,
            padding: '6px 12px',
            borderRadius: 999,
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Sparkles size={10} />
          {t('subs.quizBadge')}
        </motion.span>

        <motion.h3
          style={{
            fontFamily: FONT.display,
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: 700,
            color: C.cream,
            lineHeight: 1.1,
            marginBottom: 12,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('subs.quizCtaTitle')}
        </motion.h3>

        <motion.p
          style={{
            fontSize: 14,
            color: 'rgba(250,247,242,0.45)',
            lineHeight: 1.6,
            maxWidth: 360,
            margin: '0 auto',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('subs.quizCtaText')}
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <motion.button
          onClick={onOpenQuiz}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: C.caramel,
            color: C.espresso,
            padding: isMobile ? '11px 20px' : '14px 28px',
            borderRadius: isMobile ? 12 : 16,
            border: 'none',
            cursor: 'pointer',
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            fontFamily: FONT.body,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 24px rgba(196,119,59,0.4)',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <Zap size={14} />
          <span>{t('subs.quizCtaButton')}</span>
        </motion.button>
      </motion.div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   MOBILE DOTS
═══════════════════════════════════════════════════════════ */

const MobileDots: React.FC<{
  count: number;
  active: number;
  onDotClick: (i: number) => void;
}> = ({ count, active, onDotClick }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginTop: 28,
    }}
    className="md:hidden"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <motion.button
        key={idx}
        onClick={() => onDotClick(idx)}
        aria-label={`Plan ${idx + 1}`}
        animate={{
          width: idx === active ? 24 : 8,
          backgroundColor: idx === active ? C.roast : C.borderStrong,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ height: 8, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer' }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

const CARD_GAP = 20;

export const UsersPlanSuscription: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const { actions } = useQuizStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('connoisseur');
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const isMobile = useIsMobile();

  /* Fetch plans from Firestore `suscriptionPlans`, fallback to DEFAULT_PLANS */
  useEffect(() => {
    let cancelled = false;
    const l = getLocale();
    getSubscriptionPlans().then((remote) => {
      if (cancelled || remote.length === 0) return;
      const mapped: Plan[] = remote.map((p: SubscriptionPlanFirestore) => ({
        id:           p.id,
        name:         p.name[l]         ?? p.name['es']         ?? '',
        description:  p.description[l]  ?? p.description['es']  ?? '',
        badge:        p.badge[l]        ?? p.badge['es']        ?? '',
        price:        p.price,
        priceCents:   p.priceCents,
        interval:     p.interval[l]     ?? p.interval['es']     ?? '',
        subscribeCta: p.subscribeCta[l] ?? p.subscribeCta['es'] ?? '',
        features:     p.features.map((f: Record<string, string>) => f[l] ?? f['es'] ?? ''),
        highlighted:  p.highlighted ?? false,
        accentColor:  p.accentColor,
        glowColor:    p.glowColor,
      }));
      setPlans(mapped);
    });
    return () => { cancelled = true; };
  }, []);

  const quizDone = isAuthenticated && authUser?.quizCompleted;

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - CARD_GAP, behavior: 'smooth' });
    setActiveIdx(idx);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const childEl = child as HTMLElement;
      const mid = childEl.offsetLeft + childEl.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  }, []);

  if (!quizDone) {
    return <QuizCtaBanner onOpenQuiz={actions.openQuiz} isMobile={isMobile} />;
  }

  return (
    <motion.section
      style={{ marginBottom: isMobile ? 32 : 64 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Section header */}
      <motion.div
        style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 48 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: FONT.body,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            background: 'rgba(196,119,59,0.12)',
            color: C.caramel,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid rgba(196,119,59,0.2)',
          }}
        >
          <Sparkles size={10} />
          {t('subs.recBadge')}
        </span>

        <h2
          style={{
            fontFamily: FONT.display,
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: C.espresso,
            lineHeight: 1.05,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          {t('subs.recHeading')}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: C.stone,
            maxWidth: 360,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t('subs.recSubheading')}
        </p>
      </motion.div>

      {/* Plan grid / carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="
          flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide
          md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none
          items-stretch
        "
        style={{
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
          marginLeft: -16,
          marginRight: -16,
          perspective: 1200,
        }}
      >
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            style={{
              scrollSnapAlign: 'center',
              flexShrink: 0,
              minWidth: isMobile
                ? 'min(78vw, 280px)'
                : (plan.highlighted ? 308 : 292),
              display: 'flex',
            }}
            className="md:shrink md:snap-none md:min-w-0"
          >
            <PlanCard
              plan={plan}
              index={i}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>

      {/* Mobile dots */}
      <MobileDots count={plans.length} active={activeIdx} onDotClick={scrollTo} />

      {/* Trust line */}
      <motion.p
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(140,133,128,0.6)',
          marginTop: 32,
          letterSpacing: '0.04em',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Sin permanencia &nbsp;·&nbsp; Cancela cuando quieras &nbsp;·&nbsp; Envío gratis
      </motion.p>
    </motion.section>
  );
};
