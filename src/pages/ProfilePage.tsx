import React, { Suspense, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, LogOut, MessageSquare, Package, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useGlobalLoadingSync } from '../hooks/useGlobalLoadingSync';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { QuizUserCard } from '../components/quiz/QuizUserCard';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../stores/authStore';
import { useQuizStore } from '../stores/quizStore';
import {
  onUserDoc,
  onUserQuizData,
  onUserPurchases,
  getAdminUserId,
  type UserDoc,
  type QuizDoc,
  type PurchaseDoc,
} from '../providers/firebaseProvider';
import { UserSubscription } from '../components/shop/UserSubscription';
import { ProfileChat } from '../components/profile/ProfileChat';
import { AdminDashboard } from '../components/profile/AdminDashboard';
import { PricingDemo } from '../components/ui/PricingDemo';
import { t } from '../data/texts';

const UserPurchasingHistory = React.lazy(async () => {
  const mod = await import('../components/shop/UserPurchasingHistory');
  return { default: mod.UserPurchasingHistory };
});

export const ProfilePage: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);
  const quizActions = useQuizStore((s) => s.actions);

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [quizData, setQuizData] = useState<QuizDoc | null>(null);
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [subscriptionPlansOpen, setSubscriptionPlansOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [purchaseHistoryOpen, setPurchaseHistoryOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useGlobalLoadingSync(loading);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!authUser?.uid) {
      setIsAdmin(false);
      return;
    }

    let mounted = true;
    getAdminUserId()
      .then((adminUid) => {
        if (!mounted) return;
        setIsAdmin(Boolean(adminUid && adminUid === authUser.uid));
      })
      .catch(() => {
        if (!mounted) return;
        setIsAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let loadCount = 0;

    const checkDone = () => {
      loadCount += 1;
      if (loadCount >= 3) setLoading(false);
    };

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

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [authUser?.uid]);

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
  const displayEmail = userDoc?.email ?? authUser?.email ?? '-';
  const hasQuiz = Boolean(quizData);
  const totalOrders = purchases.length;
  const totalItemsPurchased = purchases.reduce((sum, purchase) => {
    const orderItems = purchase.items.reduce((innerSum, item) => innerSum + item.quantity, 0);
    const bundleItems = purchase.bundleItems?.reduce((innerSum, item) => innerSum + item.quantity, 0) ?? 0;
    return sum + orderItems + bundleItems;
  }, 0);

  const memberDate = userDoc?.createdAt
    ? (() => {
        const ts = userDoc.createdAt as unknown;
        if (ts && typeof ts === 'object' && 'toDate' in (ts as object)) {
          return (ts as { toDate: () => Date }).toDate();
        }
        return null;
      })()
    : null;

  const memberSince = memberDate ? memberDate.toLocaleDateString() : '';
  const membershipDays = memberDate
    ? Math.max(1, Math.floor((Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const canOpenChat = !isAdmin || !isDesktop;
  const quizActionLabel = hasQuiz ? t('profile.refreshRecommendation') : t('profile.takeQuiz');

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="md">
          {loading && <div className="profile-loader" />}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
              style={{ marginBottom: 'var(--space-6)' }}
            >
              <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</p>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </motion.div>
          )}

          {!loading && !error && (
            <div className="profile-shell">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0 }}
                className="profile-hero"
              >
                <div className="profile-header">
                  <div className="profile-header__avatar">
                    {authUser?.photoURL ? (
                      <img src={authUser.photoURL} alt="" />
                    ) : (
                      <span className="profile-header__initials">{(displayName[0] ?? '').toUpperCase()}</span>
                    )}
                  </div>

                  <div className="profile-header__info">
                    <div>
                      <p className="label-caps profile-header__kicker">{t('profile.heading')}</p>
                      <h1 className="heading-display profile-header__title">{displayName}</h1>
                    </div>
                    <p className="profile-header__email">{displayEmail}</p>
                    {memberSince && (
                      <p className="profile-header__member">
                        {t('profile.memberSince')} {memberSince}
                        {membershipDays ? <span> • {membershipDays} dias</span> : null}
                      </p>
                    )}
                  </div>
                </div>

                <div className="profile-hero__actions" role="group" aria-label="Acciones rapidas del perfil">
                  {canOpenChat && (
                    <Button variant="secondary" size="sm" onClick={() => setChatOpen(true)}>
                      <MessageSquare size={16} />
                      {t('chat.open')}
                    </Button>
                  )}

                  {!isAdmin && (
                    <Button variant="secondary" size="sm" onClick={() => setPurchaseHistoryOpen(true)}>
                      <ShoppingBag size={16} />
                      {t('purchase.historyHeading')}
                    </Button>
                  )}

                  {!isAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (hasQuiz) {
                          setSubscriptionPlansOpen(true);
                          return;
                        }
                        quizActions.openQuiz();
                      }}
                    >
                      <Sparkles size={16} />
                      {quizActionLabel}
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" onClick={authActions.logout}>
                    <LogOut size={16} />
                    {t('profile.logout')}
                  </Button>
                </div>
              </motion.div>

          

              {isAdmin ? (
                <AdminDashboard uid={authUser!.uid} chatOpen={chatOpen} onChatOpenChange={setChatOpen} />
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 }}
                  >
                    <UserSubscription uid={authUser!.uid} quizData={quizData} onNewPack={() => setSubscriptionPlansOpen(true)} />
                  </motion.div>

                  <QuizUserCard
                    quizData={quizData}
                    onTakeQuiz={quizActions.openQuiz}
                    uid={authUser!.uid}
                    open={false}
                    onClose={() => undefined}
                  />

                  <PricingDemo
                    mode="modal"
                    open={subscriptionPlansOpen}
                    onClose={() => setSubscriptionPlansOpen(false)}
                  />

                  <Dialog.Root open={purchaseHistoryOpen} onOpenChange={setPurchaseHistoryOpen}>
                    <AnimatePresence>
                      {purchaseHistoryOpen && (
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
                                className="modal-panel purchase-history-modal pointer-events-auto flex flex-col"
                                initial={{ y: isDesktop ? 24 : '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: isDesktop ? 24 : '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                              >
                                <VisuallyHidden.Root>
                                  <Dialog.Title>{t('purchase.historyHeading')}</Dialog.Title>
                                  <Dialog.Description>{displayName}</Dialog.Description>
                                </VisuallyHidden.Root>

                                <div className="purchase-history-modal__header">
                                  <h2 className="purchase-history-modal__title">{t('purchase.historyHeading')}</h2>
                                  <Dialog.Close asChild>
                                    <button className="purchase-history-modal__close" aria-label={t('purchase.close')}>
                                      <X size={18} />
                                    </button>
                                  </Dialog.Close>
                                </div>

                                <div className="purchase-history-modal__body">
                                  <Suspense
                                    fallback={<div className="purchase-history__lazy-loader" aria-label={t('profile.loading')} />}
                                  >
                                    <UserPurchasingHistory purchases={purchases} />
                                  </Suspense>
                                </div>
                              </motion.div>
                            </div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>

                  <ProfileChat uid={authUser!.uid} open={chatOpen} onOpenChange={setChatOpen} />
                </>
              )}

 
            </div>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
};
