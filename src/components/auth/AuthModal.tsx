import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { t } from '../../data/texts';

/* ── Zod schemas ─────────────────────────────────────────── */

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
});

type LoginData  = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

/* ── Login Form ──────────────────────────────────────────── */

type LoginFormProps = {
  onAuthSuccess: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const { isLoading, error, actions } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    const user = await actions.loginWithEmail(data.email, data.password);
    if (user) {
      onAuthSuccess();
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

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
      >
        {t('auth.loginBtn')}
      </Button>
    </form>
  );
};

/* ── Signup Form ─────────────────────────────────────────── */

type SignupFormProps = {
  onAuthSuccess: () => void;
};

const SignupForm: React.FC<SignupFormProps> = ({ onAuthSuccess }) => {
  const { isLoading, error, actions } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

  const onSubmit = async (data: SignupData) => {
    const user = await actions.signupWithEmail(data.email, data.password, data.name);
    if (user) {
      onAuthSuccess();
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

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
      >
        {t('auth.signupBtn')}
      </Button>
    </form>
  );
};

/* ── AuthModal ───────────────────────────────────────────── */

export const AuthModal: React.FC = () => {
  const { isOpen, view, actions, suppressSuccessRedirect } = useAuthStore();
  const quizActions = useQuizStore((s) => s.actions);
  const resumeAfterAuth = useQuizStore((s) => s.resumeAfterAuth);
  const navigate = useNavigate();

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const handleClose = () => {
    quizActions.clearResumeAfterAuth();
    actions.closeAuth();
  };

  const handleAuthSuccess = () => {
    if (resumeAfterAuth) {
      quizActions.clearResumeAfterAuth();
      quizActions.openQuiz({ reset: false });
      return;
    }

    if (suppressSuccessRedirect) {
      actions.setSuppressSuccessRedirect(false);
      return;
    }

    navigate('/profile');
  };

  const handleGoogleLogin = async () => {
    const user = await actions.loginWithGoogle();
    if (user) {
      handleAuthSuccess();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
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
              <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                <motion.div
                  className="auth-modal pointer-events-auto"
                  initial={{ y: prefersReduced ? 0 : '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: prefersReduced ? 0 : '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>
                      {view === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
                    </Dialog.Title>
                    <Dialog.Description>
                      {t('auth.modalDescription')}
                    </Dialog.Description>
                  </VisuallyHidden.Root>

                  {/* Header */}
                  <div className="auth-modal-header">
                    <h2 className="auth-modal-title">
                      {view === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
                    </h2>
                    <p className="auth-modal-subtitle">
                      {view === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
                    </p>
                    <Dialog.Close asChild>
                      <button className="auth-close-btn" aria-label="Close" onClick={handleClose}>
                        <X size={20} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Google */}
                  <div className="auth-modal-body">
                    <Button
                      variant="secondary"
                      fullWidth
                      leftIcon={<Chrome size={18} />}
                      onClick={handleGoogleLogin}
                    >
                      {t('auth.continueGoogle')}
                    </Button>

                    <div className="auth-divider">
                      <span>{t('auth.orDivider')}</span>
                    </div>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={view}
                        initial={{ opacity: 0, x: view === 'login' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: view === 'login' ? 20 : -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {view === 'login'
                          ? <LoginForm onAuthSuccess={handleAuthSuccess} />
                          : <SignupForm onAuthSuccess={handleAuthSuccess} />}
                      </motion.div>
                    </AnimatePresence>

                    {/* Switch view */}
                    <p className="auth-switch-text">
                      {view === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                      <button
                        type="button"
                        className="auth-switch-link"
                        onClick={() => actions.switchView(view === 'login' ? 'signup' : 'login')}
                      >
                        {view === 'login' ? t('auth.goToSignup') : t('auth.goToLogin')}
                      </button>
                    </p>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
