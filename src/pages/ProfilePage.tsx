import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { QuizUserCard } from '../components/quiz/QuizUserCard';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../stores/authStore';
import { useQuizStore } from '../stores/quizStore';
import { onUserDoc, onUserQuizData, onUserPurchases, onUserSubscription, type UserDoc, type QuizDoc, type PurchaseDoc, type UserSubscriptionDoc } from '../providers/firebaseProvider';
import { UserPurchasingHistory } from '../components/shop/UserPurchasingHistory';
import { UserSubscription } from '../components/shop/UserSubscription';
import { t } from '../data/texts';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);
  const quizActions = useQuizStore((s) => s.actions);
  const navigate = useNavigate();

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [quizData, setQuizData] = useState<QuizDoc | null>(null);
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [subscription, setSubscription] = useState<UserSubscriptionDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let loadCount = 0;
    const checkDone = () => { loadCount++; if (loadCount >= 4) setLoading(false); };

    const unsub1 = onUserDoc(authUser.uid, (uDoc) => {
      setUserDoc(uDoc);
      checkDone();
    });
    const unsub2 = onUserQuizData(authUser.uid, (qDoc) => {
      setQuizData(qDoc);
      checkDone();
    });
    const unsub3 = onUserPurchases(authUser.uid, (pDocs) => {
      setPurchases(pDocs);
      checkDone();
    });
    const unsub4 = onUserSubscription(authUser.uid, (sub) => {
      setSubscription(sub);
      checkDone();
    });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [authUser?.uid]);

  /* Not authenticated */
  if (!isAuthenticated) {
    return (
      <PageTransition>
        <Section size="lg">
          <Container size="md" className="text-center">
            <motion.p variants={childVariants} className="body-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              {t('profile.notLoggedIn')}
            </motion.p>
            <motion.div variants={childVariants}>
              <Button variant="primary" size="lg" onClick={() => authActions.openAuth('login')}>
                {t('auth.navLogin')}
              </Button>
            </motion.div>
          </Container>
        </Section>
      </PageTransition>
    );
  }

  const displayName = userDoc?.displayName ?? authUser?.displayName ?? authUser?.email ?? '';
  const displayEmail = userDoc?.email ?? authUser?.email ?? '—';

  const memberSince = userDoc?.createdAt
    ? (() => {
        const ts = userDoc.createdAt as unknown;
        if (ts && typeof ts === 'object' && 'toDate' in (ts as object)) {
          return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
        }
        return '';
      })()
    : '';

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="md">
          {/* Loading state */}
          {loading && (
            <div className="profile-loader" />
          )}

          {/* Error state */}
          {error && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center" style={{ marginBottom: 'var(--space-6)' }}>
              <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</p>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </motion.div>
          )}

          {/* Profile content — always show when not loading */}
          {!loading && !error && (
            <>
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0 }}
                className="profile-header"
              >
                <div className="profile-header__avatar">
                  {authUser?.photoURL ? (
                    <img src={authUser.photoURL} alt="" />
                  ) : (
                    <span className="profile-header__initials">
                      {(displayName[0] ?? '').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="profile-header__info">
                  <h1 className="heading-display" style={{ fontSize: 'var(--text-3xl)' }}>
                    {t('profile.heading')}
                  </h1>
                  <p className="body-lg">{displayName}</p>
                  {memberSince && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      {t('profile.memberSince')} {memberSince}
                    </p>
                  )}
                </div>
              </motion.div>

 

              {/* Quiz Card — shows draft pack until user subscribes */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 }}
              >
                <QuizUserCard
                  quizData={quizData}
                  onTakeQuiz={quizActions.openQuiz}
                  uid={authUser!.uid}
                />
              </motion.div>

              {/* User Subscription */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.20 }}
              >
                <UserSubscription uid={authUser!.uid} />
              </motion.div>

              {/* Purchase History */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.24 }}
              >
                <UserPurchasingHistory purchases={purchases} />
              </motion.div>

              {/* Logout */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.28 }}
                className="profile-logout"
              >
                <Button variant="ghost" size="sm" onClick={authActions.logout}>
                  <LogOut size={16} />
                  {t('profile.logout')}
                </Button>
              </motion.div>
            </>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
};
