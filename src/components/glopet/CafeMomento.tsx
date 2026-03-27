import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { t } from '../../data/texts';
import { onProductsCatalog } from '../../providers/firebaseProvider';
import { useAuthStore } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import { Button } from '../ui/Button';
import { PackCustomizerModal } from '../quiz/PackCustomizerModal';
import { QuizAuthGate } from '../quiz/QuizAuthGate';

const EASE_DEFAULT = [0.2, 0.65, 0.2, 1] as const;

interface CafeMomentoProps {
  surface?: 'inline' | 'modal';
}

export const CafeMomento: React.FC<CafeMomentoProps> = ({ surface = 'inline' }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { currentStep, answers, result, packSaving, actions } = useQuizStore();
  const { setAnswer, nextStep, prevStep, calculateResult, resetQuiz, closeQuiz } = actions;
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [isDesktopInline, setIsDesktopInline] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  ));

  const isModal = surface === 'modal';
  const loading = catalogLoading || packSaving;

  useEffect(() => {
    const unsub = onProductsCatalog((docs) => {
      if (docs) setCatalogLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktopInline(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => media.removeEventListener('change', sync);
  }, []);

  const timeLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return formatter.format(new Date());
  }, []);

  const suggestedProductIds = useMemo(() => {
    if (!result) return [];

    return [result.recommendedProduct.productId, ...result.alternatives.map((alternative) => alternative.productId)];
  }, [result]);

  const suggestedPackItems = useMemo(() => {
    if (!result) return [];

    const products = [result.recommendedProduct, ...result.alternatives];
    const uniqueProducts = products.filter((product, index, allProducts) => (
      allProducts.findIndex((candidate) => candidate.productId === product.productId) === index
    ));

    return uniqueProducts.map((product) => ({
      productId: product.productId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    }));
  }, [result]);

  const activeQuestion = QUIZ_QUESTIONS[currentStep] ?? null;
  const hasResult = !!result;
  const shouldExpandInline = !isModal && isDesktopInline && (currentStep > 0 || loading || hasStoredAnswers(answers) || hasResult);

  const handleRestart = () => {
    resetQuiz();
  };

  const handlePackSaved = () => {
    closeQuiz();
    navigate('/profile');
  };

  const handleSelect = async (questionId: number, optionId: string) => {
    setAnswer(questionId, optionId);

    if (currentStep === QUIZ_QUESTIONS.length - 1) {
      await calculateResult(user?.uid);
      return;
    }

    nextStep();
  };

  const containerClassName = isModal
    ? 'relative max-w-[980px] mx-auto'
    : 'relative max-w-[1240px] mx-auto flex flex-col gap-8 lg:flex-row lg:items-start';

  const contentCard = loading && !hasResult ? (
    <motion.div
      key="cafe-momento-loading"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.32 }}
      className="rounded-[34px] border border-[rgba(28,20,16,0.08)] bg-white/72 p-8 shadow-[0_22px_60px_rgba(28,20,16,0.10)] min-h-[420px] flex flex-col items-center justify-center text-center"
    >
      <div className="h-14 w-14 rounded-full border-4 border-[var(--color-roast)] border-t-transparent animate-spin mb-5" />
      <p className="text-base text-[var(--text-secondary)]">{t(isModal ? 'quiz.generating' : 'cafeMomento.loading')}</p>
    </motion.div>
  ) : hasResult && result ? (
    <motion.div
      key="cafe-momento-result"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.36, ease: EASE_DEFAULT }}
      className="rounded-[34px] border border-[rgba(28,20,16,0.08)] bg-white/76 p-5 sm:p-6 shadow-[0_22px_60px_rgba(28,20,16,0.10)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(26,58,92,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-roast)]">
          <Sparkles size={14} />
          {t(isModal ? 'quiz.title' : 'cafeMomento.resultBadge')}
        </span>
        <Button variant="ghost" size="sm" onClick={handleRestart} leftIcon={<RotateCcw size={14} />}>
          {t(isModal ? 'quiz.restart' : 'cafeMomento.restart')}
        </Button>
      </div>

      {user?.uid ? (
        <div className="rounded-[30px] border border-[rgba(28,20,16,0.08)] bg-[rgba(255,255,255,0.78)] p-5 sm:p-6 shadow-[0_18px_40px_rgba(28,20,16,0.08)]">
          <PackCustomizerModal
            open={isModal}
            onClose={() => undefined}
            uid={user.uid}
            embedded
            hideCloseButton
            title={t('quiz.customizePackTitle')}
            subtitle={t('quiz.customizePackSubtitle')}
            initialItems={suggestedPackItems}
            preferInitialItems
            suggestedProductIds={suggestedProductIds}
            onSaved={handlePackSaved}
          />
        </div>
      ) : null}

      {isModal && !user && (
        <div className="mt-5 rounded-[24px] border border-[rgba(196,118,58,0.18)] bg-[rgba(255,255,255,0.72)] p-5">
          <p className="text-sm text-muted mb-4">{t('quiz.saveToProfile')}</p>
          <QuizAuthGate />
        </div>
      )}
    </motion.div>
  ) : activeQuestion ? (
    <motion.div
      key={`cafe-momento-question-${activeQuestion.id}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.34, ease: EASE_DEFAULT }}
      className="rounded-[34px] border border-[rgba(28,20,16,0.08)] bg-white/72 p-5 sm:p-6 shadow-[0_22px_60px_rgba(28,20,16,0.10)]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {t('quiz.questionOf')} {currentStep + 1} {t('quiz.of')} {QUIZ_QUESTIONS.length}
        </span>
        {currentStep > 0 && (
          <Button variant="ghost" size="sm" onClick={prevStep}>
            {t('quiz.back')}
          </Button>
        )}
      </div>

      <div className="rounded-[28px] bg-[linear-gradient(150deg,rgba(250,246,239,0.98),rgba(245,237,228,0.88))] p-5 border border-[rgba(28,20,16,0.05)] mb-5">
        <h3 className="text-[1.45rem] sm:text-[1.75rem] font-semibold leading-[1.08] text-[var(--color-espresso)] mb-2">
          {activeQuestion.question}
        </h3>
        {activeQuestion.subtitle && (
          <p className="text-[0.98rem] leading-relaxed text-[var(--text-secondary)] max-w-[46ch]">
            {activeQuestion.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activeQuestion.options.map((option, index) => (
          <motion.button
            key={option.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => handleSelect(activeQuestion.id, option.id)}
            className="group rounded-[24px] border border-[rgba(28,20,16,0.08)] bg-white/80 p-4 text-left transition-all hover:border-[rgba(26,58,92,0.2)] hover:bg-white hover:shadow-[0_18px_36px_rgba(26,58,92,0.08)]"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{option.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-primary leading-snug">{option.label}</p>
                {option.sublabel && (
                  <p className="text-sm text-muted mt-1 leading-relaxed">{option.sublabel}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  ) : null;

  return (
    <section
      id={isModal ? undefined : 'cafe-momento'}
      className={`relative overflow-hidden ${isModal ? '' : 'px-4 md:px-10 lg:px-16 py-16 md:py-20'}`}
      style={isModal ? undefined : {
        background: [
          'radial-gradient(circle at 12% 12%, rgba(196,118,58,0.14), transparent 30%)',
          'radial-gradient(circle at 88% 18%, rgba(26,58,92,0.12), transparent 28%)',
          'linear-gradient(180deg, rgba(250,246,239,0.92) 0%, rgba(244,236,223,0.82) 100%)',
        ].join(', '),
      }}
    >
      <div className="absolute inset-0 glopet-grain opacity-60 pointer-events-none" aria-hidden="true" />
      <div className={containerClassName}>
        {!isModal && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: EASE_DEFAULT }}
            animate={shouldExpandInline
              ? { opacity: 0, x: -24, width: 0, minWidth: 0, marginRight: 0 }
              : { opacity: 1, x: 0, width: '36%', minWidth: '320px', marginRight: 0 }}
            className="hidden overflow-hidden lg:block lg:sticky lg:top-28"
            style={{ pointerEvents: shouldExpandInline ? 'none' : 'auto' }}
          >
            <div className="min-w-[320px] pr-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(196,118,58,0.22)] bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-caramel)] mb-5">
                <Sparkles size={14} />
                {t('cafeMomento.badge')}
              </span>

              <h2 className="glopet-title text-[2rem] sm:text-[2.7rem] lg:text-[3.4rem] leading-[1.04] text-[var(--color-espresso)] max-w-[14ch]">
                {t('cafeMomento.heading')}
              </h2>

              <p className="mt-4 max-w-[48ch] text-[1rem] leading-relaxed text-[var(--text-secondary)]">
                {t('cafeMomento.subtitle')}
              </p>

              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[rgba(26,58,92,0.12)] bg-white/66 px-4 py-2 text-sm text-[var(--color-roast)] shadow-[0_12px_32px_rgba(26,58,92,0.08)]">
                <span className="font-medium">{t('cafeMomento.nowLabel')}</span>
                <span className="text-[var(--text-muted)]">{timeLabel}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          layout
          transition={{ duration: 0.45, ease: EASE_DEFAULT }}
          animate={!isModal && isDesktopInline ? { width: shouldExpandInline ? '100%' : '64%' } : undefined}
          className={isModal ? 'w-full' : 'w-full lg:min-w-0'}
        >
          <AnimatePresence mode="wait">{contentCard}</AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

function hasStoredAnswers(answers: Record<number, string | string[]>) {
  return Object.keys(answers).length > 0;
}