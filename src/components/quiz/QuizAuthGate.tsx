import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Chrome, Coffee } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { t } from '../../data/texts';

type AuthView = 'signup' | 'login';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const QuizAuthGate: React.FC = () => {
  const [view, setView] = useState<AuthView>('signup');
  const { isLoading, error, actions } = useAuthStore();
  const hasQuizResult = useQuizStore((s) => !!s.result);
  const packSaving = useQuizStore((s) => s.packSaving);
  const saveResultsForUser = useQuizStore((s) => s.actions.saveResultsForUser);
  const setPackSaving = useQuizStore((s) => s.actions.setPackSaving);

  const loading = isLoading || packSaving;

  const handleGoogle = async () => {
    if (hasQuizResult) setPackSaving(true);
    try {
      const user = await actions.loginWithGoogle();
      if (user && hasQuizResult) {
        await saveResultsForUser(user.uid);
      }
    } finally {
      if (hasQuizResult) setPackSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      {/* Teaser header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-foam rounded-full flex items-center justify-center mx-auto mb-4">
          <Coffee size={32} className="text-roast" />
        </div>
        <h2 className="heading-section text-2xl mb-2">
          {t('quizAuthGate.title')}
        </h2>
        <p className="body-lg text-muted max-w-md">
          {t('quizAuthGate.subtitle')}
        </p>
      </div>

      {/* Google button */}
      <div className="w-full max-w-sm">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Chrome size={18} />}
          onClick={handleGoogle}
          loading={loading}
        >
          {t('auth.continueGoogle')}
        </Button>

        <div className="auth-divider my-4">
          <span>{t('auth.orDivider')}</span>
        </div>

        {/* Inline forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === 'signup' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'signup' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'signup' ? <InlineSignupForm /> : <InlineLoginForm />}
          </motion.div>
        </AnimatePresence>

        {/* Toggle login/signup */}
        <p className="text-center text-sm text-muted mt-4">
          {view === 'signup' ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
          <button
            type="button"
            className="auth-switch-link font-semibold text-roast hover:underline"
            onClick={() => setView(view === 'signup' ? 'login' : 'signup')}
          >
            {view === 'signup' ? t('auth.goToLogin') : t('auth.goToSignup')}
          </button>
        </p>
      </div>
    </motion.div>
  );
};

/* ── Inline Signup ─────────────────────────────────────── */

const InlineSignupForm: React.FC = () => {
  const { isLoading, error, actions } = useAuthStore();
  const hasQuizResult = useQuizStore((s) => !!s.result);
  const packSaving = useQuizStore((s) => s.packSaving);
  const saveResultsForUser = useQuizStore((s) => s.actions.saveResultsForUser);
  const setPackSaving = useQuizStore((s) => s.actions.setPackSaving);
  const loading = isLoading || packSaving;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

  const onSubmit = async (data: SignupData) => {
    if (hasQuizResult) setPackSaving(true);
    try {
      const user = await actions.signupWithEmail(data.email, data.password, data.name);
      if (user && hasQuizResult) {
        await saveResultsForUser(user.uid);
      }
    } finally {
      if (hasQuizResult) setPackSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="stack-4">
      <Input
        label={t('auth.name')}
        type="text"
        placeholder={t('auth.namePlaceholder')}
        error={errors.name?.message}
        {...register('name', { required: true, minLength: 2 })}
      />
      <Input
        label={t('auth.email')}
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        leftAddon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email', { required: true })}
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        error={errors.password?.message}
        {...register('password', { required: true, minLength: 6 })}
      />

      {error && <p className="auth-error-msg">{error}</p>}

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        {t('auth.signupBtn')}
      </Button>
    </form>
  );
};

/* ── Inline Login ──────────────────────────────────────── */

const InlineLoginForm: React.FC = () => {
  const { isLoading, error, actions } = useAuthStore();
  const hasQuizResult = useQuizStore((s) => !!s.result);
  const packSaving = useQuizStore((s) => s.packSaving);
  const saveResultsForUser = useQuizStore((s) => s.actions.saveResultsForUser);
  const setPackSaving = useQuizStore((s) => s.actions.setPackSaving);
  const loading = isLoading || packSaving;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    if (hasQuizResult) setPackSaving(true);
    try {
      const user = await actions.loginWithEmail(data.email, data.password);
      if (user && hasQuizResult) {
        await saveResultsForUser(user.uid);
      }
    } finally {
      if (hasQuizResult) setPackSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="stack-4">
      <Input
        label={t('auth.email')}
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        leftAddon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email', { required: true })}
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        error={errors.password?.message}
        {...register('password', { required: true, minLength: 6 })}
      />

      {error && <p className="auth-error-msg">{error}</p>}

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        {t('auth.loginBtn')}
      </Button>
    </form>
  );
};
