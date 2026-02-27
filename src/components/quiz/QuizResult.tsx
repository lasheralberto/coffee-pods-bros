import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../../stores/quizStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check } from 'lucide-react';
import { t } from '../../data/texts';

export const QuizResult: React.FC = () => {
  const { result, actions } = useQuizStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <motion.div
          className="w-16 h-16 border-4 border-foam border-t-roast rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="mt-6 text-lg font-display text-espresso"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t('quizResult.analyzing')}
        </motion.p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col md:flex-row gap-8 py-4"
      >
        {/* Left: Image */}
        <motion.div
          className="w-full md:w-1/2 relative aspect-square rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={result.image}
            alt={result.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="font-mono text-xs uppercase tracking-widest mb-1">
              {result.origin}
            </p>
            <p className="font-display text-2xl">{result.name}</p>
          </div>
        </motion.div>

        {/* Right: Details */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <span className="label-caps text-accent mb-2 block">
              {t('quizResult.yourIdealCoffee')}
            </span>
            <h2 className="heading-display text-4xl mb-3">{result.name}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="leaf">{result.origin}</Badge>
              <Badge variant="outline">{result.process}</Badge>
              <Badge variant="outline">{result.altitude}</Badge>
            </div>
          </div>

          <div>
            <p className="label-caps mb-2">{t('quizResult.tastingNotes')}</p>
            <div className="flex flex-wrap gap-2">
              {result.notes.map((note) => (
                <span
                  key={note}
                  className="px-3 py-1 bg-foam rounded-full text-xs font-mono text-espresso uppercase tracking-wide"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          <p className="body-lg">{result.description}</p>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-display font-bold text-roast">
              {result.price}
            </span>
            <span className="text-sm text-muted">{t('quizResult.perMonth')}</span>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button variant="primary" size="lg" fullWidth>
              {t('quizResult.subscribeCta')}
            </Button>
            <Button variant="ghost" size="sm" onClick={actions.resetQuiz}>
              {t('quizResult.retakeQuiz')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {[
              t('quizResult.benefit1'),
              t('quizResult.benefit2'),
              t('quizResult.benefit3'),
              t('quizResult.benefit4'),
            ].map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-xs text-muted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={10} className="text-green-700" />
                </div>
                {benefit}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
