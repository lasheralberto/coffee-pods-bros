import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageSquare, X } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { t } from '../../data/texts';
import { getUserDoc } from '../../providers/firebaseProvider';
import { useChatStore } from '../../stores/chatStore';

const toDate = (value: unknown): Date | null => {
  if (!value || typeof value !== 'object') return null;
  if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

const getErrorLabel = (errorCode: string | null): string | null => {
  if (!errorCode) return null;
  if (errorCode === 'missing_admin_id') return t('chat.errors.missingAdmin');
  if (errorCode === 'admin_no_inbox') return t('chat.errors.adminNoInbox');
  if (errorCode === 'load_failed') return t('chat.errors.loadFailed');
  if (errorCode === 'send_failed') return t('chat.errors.sendFailed');
  return t('chat.errors.loadFailed');
};

interface AdminChatsProps {
  uid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ThreadUserMeta {
  displayName: string | null;
  email: string | null;
}

const AdminChatsContent: React.FC<{ uid: string; hideHeader?: boolean }> = ({ uid, hideHeader = false }) => {
  const loading = useChatStore((s) => s.loading);
  const adminThreads = useChatStore((s) => s.adminThreads);
  const errorCode = useChatStore((s) => s.errorCode);
  const [usersByThreadId, setUsersByThreadId] = useState<Record<string, ThreadUserMeta | null>>({});
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const missingIds = adminThreads
      .map((thread) => thread.threadUserId)
      .filter((threadUserId) => !(threadUserId in usersByThreadId));

    if (missingIds.length === 0) return;

    let mounted = true;

    void Promise.all(
      missingIds.map(async (threadUserId) => {
        try {
          const userDoc = await getUserDoc(threadUserId);
          if (!userDoc) return { threadUserId, userMeta: null as ThreadUserMeta | null };
          return {
            threadUserId,
            userMeta: {
              displayName: userDoc.displayName ?? null,
              email: userDoc.email ?? null,
            } as ThreadUserMeta,
          };
        } catch {
          return { threadUserId, userMeta: null as ThreadUserMeta | null };
        }
      }),
    ).then((entries) => {
      if (!mounted) return;
      setUsersByThreadId((current) => {
        const next = { ...current };
        entries.forEach(({ threadUserId, userMeta }) => {
          next[threadUserId] = userMeta;
        });
        return next;
      });
    });

    return () => {
      mounted = false;
    };
  }, [adminThreads, usersByThreadId]);

  const errorLabel = useMemo(() => getErrorLabel(errorCode), [errorCode]);
  const visibleThreads = useMemo(
    () => adminThreads.filter((thread) => Boolean(usersByThreadId[thread.threadUserId])),
    [adminThreads, usersByThreadId],
  );

  useEffect(() => {
    setExpandedThreadIds((current) => {
      const next = { ...current };
      let changed = false;

      const visibleIds = new Set(visibleThreads.map((thread) => thread.threadUserId));

      Object.keys(next).forEach((threadId) => {
        if (!visibleIds.has(threadId)) {
          delete next[threadId];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [visibleThreads]);

  const toggleThread = (threadId: string) => {
    setExpandedThreadIds((current) => ({
      ...current,
      [threadId]: !current[threadId],
    }));
  };

  return (
    <section className="admin-chats" aria-label={t('chat.adminInboxTitle')}>
      {!hideHeader && (
        <div className="admin-chats__header">
          <div className="admin-chats__title-wrap">
            <div className="profile-chat__header-icon" aria-hidden>
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="admin-chats__title">{t('chat.adminInboxTitle')}</h3>
              <p className="admin-chats__subtitle">{t('chat.adminInboxSubtitle')}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="admin-chats__loading">
          <Skeleton height={14} lines={4} />
        </div>
      )}

      {errorLabel && (
        <p className="profile-chat__error" role="alert">{errorLabel}</p>
      )}

      {!loading && !errorLabel && visibleThreads.length === 0 && (
        <p className="profile-chat__empty">{t('chat.adminInboxEmpty')}</p>
      )}

      {!loading && !errorLabel && visibleThreads.length > 0 && (
        <div className="admin-chats__threads" role="log" aria-live="polite">
          {visibleThreads.map((thread) => {
            const userMeta = usersByThreadId[thread.threadUserId];
            if (!userMeta) return null;

            const heading = userMeta.displayName || userMeta.email || t('chat.userFallback');
            const isExpanded = Boolean(expandedThreadIds[thread.threadUserId]);
            const panelId = `admin-thread-panel-${thread.threadUserId}`;
            return (
              <article key={thread.threadUserId} className="admin-chats__thread">
                <button
                  type="button"
                  className="admin-chats__thread-toggle"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => toggleThread(thread.threadUserId)}
                >
                  <header className="admin-chats__thread-header">
                    <h4 className="admin-chats__thread-title">{heading}</h4>
                    <div className="admin-chats__thread-meta">
                      {userMeta.displayName && userMeta.email && (
                        <span className="admin-chats__thread-email">{userMeta.email}</span>
                      )}
                      <span className="admin-chats__thread-user-id">{thread.threadUserId}</span>
                    </div>
                  </header>
                  <span className={`admin-chats__thread-chevron ${isExpanded ? 'is-open' : ''}`} aria-hidden>
                    <ChevronDown size={16} />
                  </span>
                </button>

                {isExpanded && (
                  <div id={panelId} className="admin-chats__thread-panel">
                    {thread.messages.length === 0 && (
                      <p className="admin-chats__thread-empty">{t('chat.adminThreadEmpty')}</p>
                    )}

                    {thread.messages.length > 0 && (
                      <div className="admin-chats__messages">
                        {thread.messages.map((message) => {
                          const createdAt = toDate(message.createdAt);
                          const timestamp = createdAt ? createdAt.toLocaleString() : null;
                          const isOwn = message.senderId === uid;

                          return (
                            <div
                              key={message.id}
                              className={`profile-chat__message ${isOwn ? 'is-own' : 'is-other'}`}
                            >
                              <p className="profile-chat__message-text">{message.text}</p>
                              {timestamp && (
                                <span className="profile-chat__message-time">{timestamp}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const AdminChats: React.FC<AdminChatsProps> = ({ uid, open, onOpenChange }) => {
  const actions = useChatStore((s) => s.actions);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isDesktop && !open) return;
    void actions.initAdminInbox(uid);
    return () => actions.dispose();
  }, [actions, isDesktop, open, uid]);

  if (isDesktop) {
    return (
      <section className="card card-default card-body-lg">
        <AdminChatsContent uid={uid} />
      </section>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              <div className="fixed inset-0 flex items-end justify-center z-modal pointer-events-none">
                <motion.div
                  className="profile-chat-sheet pointer-events-auto"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('chat.adminInboxTitle')}</Dialog.Title>
                    <Dialog.Description>{t('chat.adminInboxSubtitle')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  <div className="profile-chat-sheet__header">
                    <div className="profile-chat-sheet__header-left">
                      <div className="profile-chat__header-icon" aria-hidden>
                        <MessageSquare size={16} />
                      </div>
                      <h3 className="profile-chat__title">{t('chat.adminInboxTitle')}</h3>
                    </div>

                    <Dialog.Close asChild>
                      <button className="profile-chat-sheet__close" aria-label={t('purchase.close')}>
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="profile-chat__messages admin-chats__mobile-wrapper">
                    <AdminChatsContent uid={uid} hideHeader />
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
