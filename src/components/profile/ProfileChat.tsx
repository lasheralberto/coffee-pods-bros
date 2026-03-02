import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/Skeleton';
import { t } from '../../data/texts';
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

interface ProfileChatProps {
  uid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileChat: React.FC<ProfileChatProps> = ({ uid, open, onOpenChange }) => {
  const [draft, setDraft] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  const loading = useChatStore((s) => s.loading);
  const sending = useChatStore((s) => s.sending);
  const isAdmin = useChatStore((s) => s.isAdmin);
  const messages = useChatStore((s) => s.messages);
  const errorCode = useChatStore((s) => s.errorCode);
  const actions = useChatStore((s) => s.actions);

  useEffect(() => {
    if (!open) return;
    void actions.initForUser(uid);
    return () => actions.dispose();
  }, [actions, open, uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const errorLabel = useMemo(() => getErrorLabel(errorCode), [errorCode]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    await actions.sendMessage(draft);
    setDraft('');
  };

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
              <div className="fixed inset-0 flex items-end justify-center sm:items-stretch sm:justify-end z-modal pointer-events-none">
                <motion.div
                  className="profile-chat-sheet pointer-events-auto"
                  initial={isDesktop ? { x: '100%', opacity: 0 } : { y: '100%', opacity: 0 }}
                  animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                  exit={isDesktop ? { x: '100%', opacity: 0 } : { y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('chat.title')}</Dialog.Title>
                    <Dialog.Description>{t('chat.empty')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  <div className="profile-chat-sheet__header">
                    <div className="profile-chat-sheet__header-left">
                      <div className="profile-chat__header-icon" aria-hidden>
                        <MessageSquare size={16} />
                      </div>
                      <h3 className="profile-chat__title">{t('chat.title')}</h3>
                    </div>

                    <Dialog.Close asChild>
                      <button className="profile-chat-sheet__close" aria-label={t('purchase.close')}>
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="profile-chat__messages" role="log" aria-live="polite">
                    {loading && (
                      <div className="profile-chat__loading">
                        <Skeleton height={14} lines={3} />
                      </div>
                    )}

                    {!loading && messages.length === 0 && (
                      <p className="profile-chat__empty">{t('chat.empty')}</p>
                    )}

                    {!loading && messages.map((message) => {
                      const isOwn = message.senderId === uid;
                      const createdAt = toDate(message.createdAt);
                      const timestamp = createdAt ? createdAt.toLocaleString() : null;

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

                  {errorLabel && (
                    <p className="profile-chat__error" role="alert">{errorLabel}</p>
                  )}

                  <form className="profile-chat__composer" onSubmit={onSubmit}>
                    <Input
                      value={draft}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        if (errorCode) actions.clearError();
                      }}
                      placeholder={isAdmin ? t('chat.adminPlaceholder') : t('chat.placeholder')}
                      disabled={sending || isAdmin}
                      maxLength={600}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={sending || isAdmin || !draft.trim()}
                      loading={sending}
                    >
                      {t('chat.send')}
                    </Button>
                  </form>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
