import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t } from '../../data/texts';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { getUserPack } from '../../providers/firebaseProvider';
import type { QuizDoc, UserPack, PackItem } from '../../providers/firebaseProvider';
import { PackCustomizerModal } from './PackCustomizerModal';
import { ChevronDown, RefreshCw, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';

interface QuizUserCardProps {
  quizData: QuizDoc | null;
  onTakeQuiz: () => void;
  uid: string;
}

/**
 * Resolves a quiz option ID to its human-readable label.
 */
function resolveAnswerLabel(questionId: number, answerId: string): string {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return answerId;
  const option = question.options.find((o) => o.id === answerId);
  return option ? option.label : answerId;
}

function formatDate(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (ts instanceof Date) return ts.toLocaleDateString();
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString();
  return '';
}

export const QuizUserCard: React.FC<QuizUserCardProps> = ({ quizData, onTakeQuiz, uid }) => {
  const [pack, setPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [answersOpen, setAnswersOpen] = useState(false);

  const fetchPack = () => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    getUserPack(uid)
      .then((data) => { if (!cancelled) setPack(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  };

  useEffect(fetchPack, [uid, quizData]);

  if (!quizData) {
    return (
      <div>
        <Card variant="outline" padding="lg" className="quiz-user-card quiz-user-card--empty">
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            {t('profile.quizNotCompleted')}
          </p>
          <Button variant="primary" size="md" onClick={onTakeQuiz}>
            {t('profile.takeQuiz')}
          </Button>
        </Card>
      </div>
    );
  }

  const sortedAnswers = Object.entries(quizData.answers)
    .map(([key, val]) => ({ qId: Number(key), answer: val }))
    .sort((a, b) => a.qId - b.qId);

  return (
    <div>
      <Card variant="elevated" padding="none" className="quiz-user-card">
        {/* Header */}
        <div className="quiz-user-card__header">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>
            {t('profile.quizHeading')}
          </h3>
          {quizData.completedAt && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {t('profile.completedAt')} {formatDate(quizData.completedAt)}
            </span>
          )}
        </div>

        {/* Pack display */}
        {loading && (
          <div className="quiz-user-card__result" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {t('profile.loading')}
            </p>
          </div>
        )}

        {!loading && pack && pack.items.length > 0 && (
          <div className="quiz-user-card__pack">
            <span className="quiz-user-card__pack-label">
              {t('profile.yourPack')}
            </span>
            <div className="quiz-user-card__pack-list">
              {pack.items.map((item: PackItem) => (
                <div key={item.profileId} className="pack-item pack-item--active">
                  <img src={item.image} alt={item.name} className="pack-item__img" />
                  <div className="pack-item__info">
                    <span className="pack-item__name">{item.name}</span>
                    <span className="pack-item__price">
                      {item.price.toFixed(2)}€ {t('pack.perUnit')}
                    </span>
                  </div>
                  <span className="pack-item__qty">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="quiz-user-card__pack-total">
              <span className="pack-modal__total-label">{t('pack.total')}</span>
              <span className="pack-modal__total-value">{pack.totalPrice.toFixed(2)}€</span>
            </div>
            <Button variant="accent" size="sm" fullWidth onClick={() => setPackModalOpen(true)}>
              {t('profile.customizePack')}
            </Button>
            <div className="quiz-user-card__purchase-row">
              <Button
                variant="primary"
                size="sm"
                onClick={() => useCartStore.getState().actions.addBundle(pack.items, pack.totalPrice, 'subscription')}
              >
                <RefreshCw size={14} />
                {t('profile.subscriptionBtn')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => useCartStore.getState().actions.addBundle(pack.items, pack.totalPrice, 'oneTime')}
              >
                <ShoppingCart size={14} />
                {t('profile.oneTimePurchase')}
              </Button>
            </div>
          </div>
        )}

        {!loading && (!pack || pack.items.length === 0) && quizData && (
          <div className="quiz-user-card__pack" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              {t('pack.emptyPack')}
            </p>
            <Button variant="accent" size="sm" fullWidth onClick={() => setPackModalOpen(true)}>
              {t('profile.customizePack')}
            </Button>
          </div>
        )}

        {/* Collapsible answer list */}
        <div className="quiz-user-card__answers-toggle" onClick={() => setAnswersOpen((o) => !o)}>
          <span>{answersOpen ? t('profile.hideAnswers') : t('profile.showAnswers')}</span>
          <motion.span
            animate={{ rotate: answersOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'inline-flex' }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </div>
        <AnimatePresence initial={false}>
          {answersOpen && (
            <motion.div
              className="quiz-user-card__answers"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {sortedAnswers.map(({ qId, answer }) => {
                const question = QUIZ_QUESTIONS.find((q) => q.id === qId);
                const questionLabel = question?.question ?? `${t('profile.question')} ${qId}`;
                const answerLabels = Array.isArray(answer)
                  ? answer.map((a) => resolveAnswerLabel(qId, a)).join(', ')
                  : resolveAnswerLabel(qId, answer);

                return (
                  <div key={qId} className="quiz-user-card__answer-row">
                    <span className="quiz-user-card__question-label">{questionLabel}</span>
                    <span className="quiz-user-card__answer-value">{answerLabels}</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retake */}
        <div className="quiz-user-card__footer">
          <Button variant="secondary" size="sm" onClick={onTakeQuiz}>
            {t('profile.takeQuiz')}
          </Button>
        </div>
      </Card>

      {/* Pack Customizer Modal */}
      <PackCustomizerModal
        open={packModalOpen}
        onClose={() => { setPackModalOpen(false); fetchPack(); }}
        uid={uid}
      />
    </div>
  );
};
