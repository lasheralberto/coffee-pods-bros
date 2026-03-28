import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { AnimatePresence, motion } from 'framer-motion'
import { Boxes, ClipboardList, Sparkles, X } from 'lucide-react'
import { PackCustomizerModal } from '../quiz/PackCustomizerModal'
import { useAuthStore } from '../../stores/authStore'
import { useQuizStore } from '../../stores/quizStore'
import { Button } from './Button'
import { getLocale } from '../../data/texts'
import { onSubscriptionPlans, type SubscriptionPlanFirestore } from '../../providers/firebaseProvider'
import { PricingContainer } from './PricingContainer'
import type { PricingPlan } from './PricingContainer'

const FALLBACK_PLANS: PricingPlan[] = [
  {
    id: 'explorer',
    name: 'Starter',
    monthlyPrice: 12.9,
    features: ['250g', 'Entrega mensual', 'Envío incluido', 'Cancela cuando quieras'],
    isPopular: false,
    accent: '',
    accentColor: '#4A5E3A',
    rotation: -2,
    billingLabel: 'mensual',
    currencySymbol: '€',
    description: 'Selección esencial para empezar.',
    badgeLabel: 'Explorer',
    ctaLabel: 'EMPEZAR →',
    numberOfProducts: 6,
  },
  {
    id: 'connoisseur',
    name: 'Connoisseur',
    monthlyPrice: 19.9,
    features: ['500g', 'Entrega quincenal', 'Envío incluido', 'Microlotes exclusivos', 'Cancela cuando quieras'],
    isPopular: true,
    accent: '',
    accentColor: '#C4773B',
    rotation: 1,
    billingLabel: 'quincenal',
    currencySymbol: '€',
    description: 'El plan recomendado para la mayoría.',
    badgeLabel: 'RECOMENDADO',
    ctaLabel: 'EMPEZAR →',
    numberOfProducts: 6,
  },
  {
    id: 'roaster',
    name: 'Roaster',
    monthlyPrice: 29.9,
    features: ['1kg', 'Entrega quincenal', 'Envío incluido', 'Soporte prioritario', 'Cancela cuando quieras'],
    isPopular: false,
    accent: '',
    accentColor: '#7B2D00',
    rotation: 2,
    billingLabel: 'quincenal',
    currencySymbol: '€',
    description: 'Pensado para consumo intensivo.',
    badgeLabel: 'ROASTER',
    ctaLabel: 'EMPEZAR →',
    numberOfProducts: 6,
  },
]

const resolveLocalizedText = (value: Record<string, string> | undefined, locale: string) => {
  if (!value) return ''
  return value[locale] ?? value.es ?? value.en ?? Object.values(value)[0] ?? ''
}

const resolvePlanPrice = (plan: SubscriptionPlanFirestore) => {
  if (typeof plan.totalPrice === 'number' && Number.isFinite(plan.totalPrice) && plan.totalPrice > 0) {
    return plan.totalPrice
  }

  const major = Number.parseFloat(plan.price.replace(',', '.'))
  const cents = Number.parseInt(plan.priceCents, 10)
  if (Number.isFinite(major) && Number.isFinite(cents)) {
    return major + (cents / 100)
  }

  return 0
}

const mapFirestorePlan = (plan: SubscriptionPlanFirestore, locale: string): PricingPlan => ({
  id: plan.id,
  name: resolveLocalizedText(plan.name, locale),
  monthlyPrice: resolvePlanPrice(plan),
  features: plan.features.map((feature) => resolveLocalizedText(feature, locale)).filter(Boolean),
  isPopular: !!plan.highlighted,
  accent: '',
  accentColor: plan.accentColor,
  billingLabel: resolveLocalizedText(plan.interval, locale),
  currencySymbol: '€',
  description: resolveLocalizedText(plan.description, locale),
  badgeLabel: resolveLocalizedText(plan.badge, locale),
  ctaLabel: resolveLocalizedText(plan.subscribeCta, locale) || 'EMPEZAR →',
  rotation: typeof plan.order === 'number' ? plan.order : 0,
  numberOfProducts: plan.numberOfProducts ?? 6,
})

type SubscriptionFlowAction = 'products' | 'quiz'

interface PricingDemoProps {
  mode?: 'inline' | 'modal'
  open?: boolean
  onClose?: () => void
}

interface FlowChoiceModalProps {
  locale: string
  open: boolean
  plan: PricingPlan | null
  onClose: () => void
  onChoose: (action: SubscriptionFlowAction) => void
}

const FlowChoiceModal: React.FC<FlowChoiceModalProps> = ({ locale, open, plan, onClose, onChoose }) => {
  const isSpanish = locale === 'es'

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none">
                <motion.div
                  className="pointer-events-auto relative w-full max-w-2xl rounded-t-[28px] border border-[rgba(28,20,16,0.08)] bg-[linear-gradient(180deg,rgba(250,246,239,0.98),rgba(240,232,216,0.96))] p-5 shadow-[0_22px_60px_rgba(28,20,16,0.16)] sm:rounded-[28px] sm:p-8"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>
                      {isSpanish ? 'Cómo quieres configurar tu suscripción' : 'How do you want to set up your subscription'}
                    </Dialog.Title>
                    <Dialog.Description>
                      {isSpanish ? 'Elige si quieres seleccionar productos manualmente o hacer el quiz.' : 'Choose whether to select products manually or take the quiz.'}
                    </Dialog.Description>
                  </VisuallyHidden.Root>

                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(28,20,16,0.1)] bg-white/80 text-[var(--color-espresso)] shadow-[0_6px_18px_rgba(28,20,16,0.08)]"
                    aria-label={isSpanish ? 'Cerrar' : 'Close'}
                  >
                    <X size={18} />
                  </button>

                  <div className="mb-6 pr-12">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(196,118,58,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-caramel)]">
                      <Sparkles size={14} />
                      {plan?.name}
                    </span>
                    <h2 className="text-2xl font-black leading-tight text-[var(--color-espresso)] sm:text-3xl">
                      {isSpanish ? 'Elige cómo quieres continuar' : 'Choose how you want to continue'}
                    </h2>
                    <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-[var(--color-stone)] sm:text-base">
                      {isSpanish
                        ? 'Puedes construir tu pack manualmente con los cafés de la tienda o hacer el quiz para seguir el flujo guiado y terminar con la recomendación habitual.'
                        : 'You can build your pack manually with the coffees from the shop or take the quiz to follow the guided recommendation flow.'}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => onChoose('products')}
                      className="rounded-[24px] border border-[rgba(28,20,16,0.08)] bg-white/88 p-5 text-left shadow-[0_14px_34px_rgba(28,20,16,0.08)] transition-transform hover:-translate-y-0.5"
                    >
                      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(26,58,92,0.1)] text-[var(--color-roast)]">
                        <Boxes size={22} />
                      </span>
                      <h3 className="text-lg font-semibold text-[var(--color-espresso)]">
                        {isSpanish ? 'Elegir productos' : 'Choose products'}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                        {isSpanish
                          ? 'Abriremos el personalizador del pack con el catálogo de la tienda para que añadas tus cafés al plan seleccionado.'
                          : 'We will open the pack customizer with the shop catalog so you can add coffees to the selected plan.'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChoose('quiz')}
                      className="rounded-[24px] border border-[rgba(28,20,16,0.08)] bg-white/88 p-5 text-left shadow-[0_14px_34px_rgba(28,20,16,0.08)] transition-transform hover:-translate-y-0.5"
                    >
                      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(196,118,58,0.12)] text-[var(--color-caramel)]">
                        <ClipboardList size={22} />
                      </span>
                      <h3 className="text-lg font-semibold text-[var(--color-espresso)]">
                        {isSpanish ? 'Hacer quiz' : 'Take quiz'}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                        {isSpanish
                          ? 'Abriremos el quiz normal de la app y, al terminar, continuará el flujo habitual con la suscripción elegida.'
                          : 'We will open the normal app quiz and, when it finishes, continue the usual flow with the selected subscription.'}
                      </p>
                    </button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export function PricingDemo({ mode = 'inline', open = false, onClose }: PricingDemoProps) {
  const locale = getLocale()
  const intlLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false)
  const [isPackCustomizerOpen, setIsPackCustomizerOpen] = useState(false)
  const [pendingAuthAction, setPendingAuthAction] = useState<SubscriptionFlowAction | null>(null)
  const authUser = useAuthStore((state) => state.user)
  const authIsOpen = useAuthStore((state) => state.isOpen)
  const authActions = useAuthStore((state) => state.actions)
  const quizActions = useQuizStore((state) => state.actions)

  useEffect(() => {
    const unsubscribe = onSubscriptionPlans((firestorePlans) => {
      if (!firestorePlans.length) {
        setPlans(FALLBACK_PLANS)
        return
      }

      setPlans(firestorePlans.map((plan) => mapFirestorePlan(plan, locale)))
    })

    return unsubscribe
  }, [locale])

  const localizedFallback = useMemo(() => {
    if (plans.length) {
      return plans
    }
    return FALLBACK_PLANS
  }, [plans])

  const handlePlanAction = useCallback((plan: PricingPlan) => {
    setSelectedPlan(plan)
    setIsChoiceModalOpen(true)
  }, [])

  const handleChooseFlow = useCallback((action: SubscriptionFlowAction) => {
    if (!selectedPlan) return

    setIsChoiceModalOpen(false)

    if (mode === 'modal') {
      onClose?.()
    }

    if (action === 'products') {
      if (!authUser?.uid) {
        setPendingAuthAction('products')
        authActions.setSuppressSuccessRedirect(true)
        authActions.openAuth('login')
        return
      }

      setIsPackCustomizerOpen(true)
      return
    }

    quizActions.setSubscriptionSelection({
      id: selectedPlan.id,
      name: selectedPlan.name,
      totalPrice: selectedPlan.monthlyPrice,
      numberOfProducts: selectedPlan.numberOfProducts ?? 6,
    })

    if (!authUser?.uid) {
      quizActions.requestResumeAfterAuth()
      authActions.openAuth('login')
      return
    }

    quizActions.openQuiz()
  }, [authActions, authUser?.uid, mode, onClose, quizActions, selectedPlan])

  useEffect(() => {
    if (pendingAuthAction !== 'products') return
    if (!authUser?.uid) return

    authActions.setSuppressSuccessRedirect(false)
    setPendingAuthAction(null)
    setIsPackCustomizerOpen(true)
  }, [authActions, authUser?.uid, pendingAuthAction])

  useEffect(() => {
    if (pendingAuthAction !== 'products') return
    if (authIsOpen || authUser?.uid) return

    authActions.setSuppressSuccessRedirect(false)
    setPendingAuthAction(null)
  }, [authActions, authIsOpen, authUser?.uid, pendingAuthAction])

  const handlePackCustomizerClose = useCallback(() => {
    setIsPackCustomizerOpen(false)
  }, [])

  const pricingContent = (
    <PricingContainer
      title={locale === 'es' ? 'Elige tu plan ideal' : 'Choose your ideal plan'}
      plans={localizedFallback}
      showBillingToggle={false}
      locale={intlLocale}
      onPlanAction={handlePlanAction}
      fullHeight={mode === 'inline'}
      className={mode === 'modal' ? 'min-h-0' : ''}
    />
  )

  return (
    <>
      {mode === 'modal' ? (
        <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
          <AnimatePresence>
            {open ? (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div
                    className="overlay backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                </Dialog.Overlay>

                <Dialog.Content asChild>
                  <div className="fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none">
                    <motion.div
                      className="pointer-events-auto relative w-full max-w-6xl overflow-hidden rounded-t-[28px] bg-transparent sm:rounded-[28px]"
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                    >
                      <VisuallyHidden.Root>
                        <Dialog.Title>
                          {locale === 'es' ? 'Selecciona un plan de suscripción' : 'Select a subscription plan'}
                        </Dialog.Title>
                        <Dialog.Description>
                          {locale === 'es' ? 'Elige el plan para empezar tu nuevo pack.' : 'Choose the plan to start your new pack.'}
                        </Dialog.Description>
                      </VisuallyHidden.Root>

                      <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(28,20,16,0.1)] bg-white/88 text-[var(--color-espresso)] shadow-[0_6px_18px_rgba(28,20,16,0.08)]"
                        aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
                      >
                        <X size={18} />
                      </button>

                      <div className="max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px]">
                        {pricingContent}
                      </div>
                    </motion.div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            ) : null}
          </AnimatePresence>
        </Dialog.Root>
      ) : pricingContent}

      <FlowChoiceModal
        locale={locale}
        open={isChoiceModalOpen}
        plan={selectedPlan}
        onClose={() => setIsChoiceModalOpen(false)}
        onChoose={handleChooseFlow}
      />

      {authUser?.uid && selectedPlan ? (
        <PackCustomizerModal
          open={isPackCustomizerOpen}
          onClose={handlePackCustomizerClose}
          uid={authUser.uid}
          maxProducts={selectedPlan.numberOfProducts}
          planPrice={selectedPlan.monthlyPrice}
          planId={selectedPlan.id}
          title={locale === 'es' ? `Configura tu pack ${selectedPlan.name}` : `Build your ${selectedPlan.name} pack`}
          subtitle={locale === 'es' ? 'Añade productos de la tienda a tu suscripción.' : 'Add products from the shop to your subscription.'}
          onSaved={handlePackCustomizerClose}
        />
      ) : null}
    </>
  )
}
