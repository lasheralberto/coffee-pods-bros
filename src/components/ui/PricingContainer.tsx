"use client"
import React, { useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice?: number
  priceBadgeNote?: string
  features: string[]
  isPopular?: boolean
  accent: string
  accentColor?: string
  rotation?: number
  billingLabel?: string
  currencySymbol?: string
  ctaLabel?: string
  description?: string
  badgeLabel?: string
  numberOfProducts?: number
}

interface PricingProps {
  title?: string
  plans: PricingPlan[]
  className?: string
  showBillingToggle?: boolean
  locale?: string
  onPlanAction?: (plan: PricingPlan) => void
  fullHeight?: boolean
}

// Counter Component
const Counter = ({ from, to, locale = 'es-ES', precision = 2 }: { from: number; to: number; locale?: string; precision?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const formatter = useMemo(() => new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }), [locale, precision])

  React.useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    const controls = animate(from, to, {
      duration: 1,
      onUpdate(value) {
        node.textContent = formatter.format(value)
      },
    })
    return () => controls.stop()
  }, [formatter, from, to])
  return <span ref={nodeRef} />
}

// Header Component
const PricingHeader = ({ title }: { title?: string }) => (
  <div className="text-center mb-8 sm:mb-12 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-espresso)] 
                bg-gradient-to-r from-[var(--color-cream)] to-[var(--color-foam)] px-8 py-4 rounded-xl border-4 border-[var(--color-espresso)]
                shadow-[8px_8px_0px_0px_rgba(28,20,16,0.9),_15px_15px_15px_-3px_rgba(28,20,16,0.12)]
                transform transition-transform hover:translate-x-1 hover:translate-y-1 mb-3 relative
                before:absolute before:inset-0 before:bg-[rgba(255,248,239,0.45)] before:rounded-xl before:blur-sm before:-z-10">
        {title}
      </h1>
      <motion.div
        className="h-2 bg-gradient-to-r from-[var(--color-roast)] via-[var(--color-caramel)] to-[var(--color-leaf)] rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5 }}
      />
    </motion.div>
  </div>
)

// Toggle Component
const PricingToggle = ({ isYearly, onToggle }: { isYearly: boolean; onToggle: () => void }) => (
  <div className="flex justify-center items-center gap-4 mb-8 relative z-10">
    <span className={`text-[var(--color-stone)] font-medium ${!isYearly ? 'text-[var(--color-espresso)]' : ''}`}>Monthly</span>
    <motion.button
      className="w-16 h-8 flex items-center bg-[var(--color-foam)] rounded-full p-1 border-2 border-[var(--color-espresso)] shadow-[2px_2px_0px_0px_rgba(28,20,16,0.85)]"
      onClick={onToggle}
    >
      <motion.div
        className="w-6 h-6 bg-[var(--color-cream)] rounded-full border-2 border-[var(--color-espresso)]"
        animate={{ x: isYearly ? 32 : 0 }}
      />
    </motion.button>
    <span className={`text-[var(--color-stone)] font-medium ${isYearly ? 'text-[var(--color-espresso)]' : ''}`}>Yearly</span>
    {isYearly && (
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-[var(--color-leaf)] font-medium text-sm"
      >
        Save 20%
      </motion.span>
    )}
  </div>
)

// Background Effects Component
const BackgroundEffects = () => (
  <>
    <div className="absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-black/5 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    <div className="absolute inset-0" style={{
      backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
      backgroundSize: "16px 16px"
    }} />
  </>
)

// Pricing Card Component
const PricingCard = ({
  plan,
  isYearly,
  index,
  locale,
  useBillingToggle,
  onPlanAction,
}: {
  plan: PricingPlan
  isYearly: boolean
  index: number
  locale: string
  useBillingToggle: boolean
  onPlanAction?: (plan: PricingPlan) => void
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig)

  const yearlyPrice = typeof plan.yearlyPrice === 'number' ? plan.yearlyPrice : plan.monthlyPrice
  const currentPrice = useBillingToggle ? (isYearly ? yearlyPrice : plan.monthlyPrice) : plan.monthlyPrice
  const previousPrice = useBillingToggle ? (!isYearly ? yearlyPrice : plan.monthlyPrice) : plan.monthlyPrice
  const accentStyle = plan.accentColor ? { backgroundColor: plan.accentColor } : undefined
  const billingLabel = plan.billingLabel ?? (useBillingToggle ? (isYearly ? 'yr' : 'mo') : 'plan')
  const ctaLabel = plan.ctaLabel ?? 'GET STARTED →'
  const badgeLabel = plan.badgeLabel ?? (plan.isPopular ? 'POPULAR' : '')
  const hasPriceBadgeNote = Boolean(plan.priceBadgeNote)

  return (
    <motion.div
      ref={cardRef}
      key={plan.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
      }}
      onMouseMove={(e) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.x + rect.width / 2
        const centerY = rect.y + rect.height / 2
        mouseX.set((e.clientX - centerX) / rect.width)
        mouseY.set((e.clientY - centerY) / rect.height)
      }}
      onMouseLeave={() => {
        mouseX.set(0)
        mouseY.set(0)
      }}
      className={`relative w-full bg-[rgba(255,251,245,0.96)] rounded-xl p-6 border-[3px] border-[var(--color-espresso)]
                shadow-[6px_6px_0px_0px_rgba(28,20,16,0.9)]
                hover:shadow-[8px_8px_0px_0px_rgba(28,20,16,0.9)]
                transition-all duration-200`}
    >
      {/* Price Badge */}
      <motion.div
        className={cn(
          `absolute -top-4 -right-4 flex min-h-[64px] min-w-[64px] items-center justify-center border-2 border-[var(--color-espresso)]
                    shadow-[3px_3px_0px_0px_rgba(28,20,16,0.9)]`
          , hasPriceBadgeNote ? 'rounded-[22px] px-3 py-2' : 'w-16 h-16 rounded-full'
          , plan.accent)}
        style={accentStyle}
        animate={{
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.1, 0.9, 1.1, 1],
          y: [0, -5, 5, -3, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: [0.76, 0, 0.24, 1]
        }}
      >
        <div className="text-center text-white">
          <div className="text-sm font-black leading-none">{plan.currencySymbol ?? '€'}</div>
          <div className="text-base font-black leading-none">
            <Counter from={previousPrice} to={currentPrice} locale={locale} precision={2} />
          </div>
          <div className="text-[10px] font-bold">/{billingLabel}</div>
          {plan.priceBadgeNote ? (
            <div className="mt-1 text-[9px] font-black uppercase leading-tight text-[rgba(255,255,255,0.92)]">
              {plan.priceBadgeNote}
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Plan Name and Popular Badge */}
      <div className="mb-4">
        <h3 className="text-xl font-black text-[var(--color-espresso)] mb-2">{plan.name}</h3>
        {plan.description ? (
          <p className="mb-3 text-sm font-medium text-[var(--color-stone)]">{plan.description}</p>
        ) : null}
        {badgeLabel && (
          <motion.span
            className={cn(
              `inline-block px-3 py-1 text-white
                            font-bold rounded-md text-xs border-2 border-[var(--color-espresso)]
                            shadow-[2px_2px_0px_0px_rgba(28,20,16,0.9)]`
              , plan.accent)}
            style={accentStyle}
            animate={{
              y: [0, -3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            {badgeLabel}
          </motion.span>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-2 mb-4">
        {plan.features.map((feature, i) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              x: 5,
              scale: 1.02,
              transition: { type: "spring", stiffness: 400 }
            }}
            className={`flex items-center gap-2 p-2 bg-[rgba(240,232,216,0.45)] rounded-md border-2 border-[var(--color-espresso)]
                            shadow-[2px_2px_0px_0px_rgba(28,20,16,0.9)]`}
          >
            <motion.span
              whileHover={{ scale: 1.2, rotate: 360 }}
              className={cn(
                `w-5 h-5 rounded-md  flex items-center justify-center
                                text-white font-bold text-xs border border-[var(--color-espresso)]
                                shadow-[1px_1px_0px_0px_rgba(28,20,16,0.9)]`
                , plan.accent)}
              style={accentStyle}
            >
              ✓
            </motion.span>
            <span className="text-[var(--color-espresso)] font-bold text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        type="button"
        className={cn(
          `w-full py-2 rounded-lg  text-white font-black text-sm
                    border-2 border-[var(--color-espresso)] shadow-[4px_4px_0px_0px_rgba(28,20,16,0.9)]
                    hover:shadow-[6px_6px_0px_0px_rgba(28,20,16,0.9)]
                    active:shadow-[2px_2px_0px_0px_rgba(28,20,16,0.9)]
                    transition-all duration-200`
          , plan.accent)}
        style={accentStyle}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.95,
          rotate: [-1, 1, 0],
        }}
        onClick={() => onPlanAction?.(plan)}
      >
        {ctaLabel}
      </motion.button>
    </motion.div>
  )
}

// Main Container Component
export const PricingContainer = ({
  title = "Pricing Plans",
  plans,
  className = "",
  showBillingToggle = true,
  locale = 'es-ES',
  onPlanAction,
  fullHeight = true,
}: PricingProps) => {
  const [isYearly, setIsYearly] = useState(false)
  const useBillingToggle = showBillingToggle && plans.some((plan) => typeof plan.yearlyPrice === 'number' && plan.yearlyPrice !== plan.monthlyPrice)

  return (
    <div className={`${fullHeight ? 'min-h-screen' : ''} bg-[var(--color-cream)] p-4 sm:p-6 lg:p-8 relative overflow-hidden rounded-[12px] border border-[rgba(196,118,58,0.18)] ${className}`}>
      <PricingHeader title={title} />
      {useBillingToggle ? (
        <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
      ) : null}
      <BackgroundEffects />

      <div className="w-[100%] max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {plans.map((plan, index) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isYearly={isYearly}
            index={index}
            locale={locale}
            useBillingToggle={useBillingToggle}
            onPlanAction={onPlanAction}
          />
        ))}
      </div>
    </div>
  )
}
