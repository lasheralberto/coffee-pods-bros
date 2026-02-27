import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t } from '../../data/texts';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { COFFEE_PROFILES } from '../../data/matchingRules';
import type { QuizDoc } from '../../providers/firebaseProvider';

interface QuizUserCardProps {
  quizData: QuizDoc | null;
  onTakeQuiz: () => void;
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
  // Firestore Timestamp
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (ts instanceof Date) return ts.toLocaleDateString();
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString();
  return '';
}

export const QuizUserCard: React.FC<QuizUserCardProps> = ({ quizData, onTakeQuiz }) => {
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

  const profile = quizData.coffeeProfileId
    ? COFFEE_PROFILES[quizData.coffeeProfileId]
    : null;

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

        {/* Coffee Profile Result */}
        {profile && (
          <div className="quiz-user-card__result">
            <div className="quiz-user-card__result-img">
              <img src={profile.image} alt={profile.name} />
            </div>
            <div className="quiz-user-card__result-info">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                {t('profile.yourResult')}
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)' }}>
                {profile.name}
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {profile.description}
              </p>
              <div className="quiz-user-card__tags">
                {profile.tags.map((tag) => (
                  <span key={tag} className="quiz-user-card__tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Answer list */}
        <div className="quiz-user-card__answers">
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
        </div>

        {/* Retake */}
        <div className="quiz-user-card__footer">
          <Button variant="secondary" size="sm" onClick={onTakeQuiz}>
            {t('profile.takeQuiz')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
