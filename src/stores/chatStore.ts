import { create } from 'zustand';
import {
  getAdminUserId,
  onAdminChatThreads,
  onChatMessages,
  sendChatMessage,
  type ChatMessageDoc,
} from '../providers/firebaseProvider';

export type ChatErrorCode =
  | 'missing_admin_id'
  | 'admin_no_inbox'
  | 'load_failed'
  | 'send_failed'
  | null;

export interface AdminChatThread {
  threadUserId: string;
  updatedAt: unknown;
  messages: ChatMessageDoc[];
}

interface ChatStore {
  currentUserId: string | null;
  adminUserId: string | null;
  isAdmin: boolean;
  loading: boolean;
  sending: boolean;
  messages: ChatMessageDoc[];
  adminThreads: AdminChatThread[];
  errorCode: ChatErrorCode;
  actions: {
    initForUser: (uid?: string | null) => Promise<void>;
    initAdminInbox: (uid?: string | null) => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    clearError: () => void;
    dispose: () => void;
  };
}

let messagesUnsubscribe: (() => void) | null = null;
let adminThreadsUnsubscribe: (() => void) | null = null;
const adminMessageUnsubscribers = new Map<string, () => void>();

const resetThreadSubscription = () => {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
    messagesUnsubscribe = null;
  }
};

const resetAdminSubscriptions = () => {
  if (adminThreadsUnsubscribe) {
    adminThreadsUnsubscribe();
    adminThreadsUnsubscribe = null;
  }

  adminMessageUnsubscribers.forEach((unsubscribe) => unsubscribe());
  adminMessageUnsubscribers.clear();
};

export const useChatStore = create<ChatStore>((set, get) => ({
  currentUserId: null,
  adminUserId: null,
  isAdmin: false,
  loading: false,
  sending: false,
  messages: [],
  adminThreads: [],
  errorCode: null,
  actions: {
    initForUser: async (uid) => {
      resetThreadSubscription();
      resetAdminSubscriptions();

      if (!uid) {
        set({
          currentUserId: null,
          adminUserId: null,
          isAdmin: false,
          loading: false,
          messages: [],
          adminThreads: [],
          errorCode: null,
        });
        return;
      }

      set({
        currentUserId: uid,
        loading: true,
        messages: [],
        adminThreads: [],
        errorCode: null,
      });

      try {
        const adminUserId = await getAdminUserId();
        const isAdmin = adminUserId === uid;

        set({
          adminUserId,
          isAdmin,
          errorCode: !adminUserId ? 'missing_admin_id' : null,
        });

        messagesUnsubscribe = onChatMessages(uid, (messages) => {
          set({ messages, loading: false });
        });
      } catch {
        set({ loading: false, errorCode: 'load_failed' });
      }
    },

    initAdminInbox: async (uid) => {
      resetThreadSubscription();
      resetAdminSubscriptions();

      if (!uid) {
        set({
          currentUserId: null,
          adminUserId: null,
          isAdmin: false,
          loading: false,
          messages: [],
          adminThreads: [],
          errorCode: null,
        });
        return;
      }

      set({
        currentUserId: uid,
        loading: true,
        messages: [],
        adminThreads: [],
        errorCode: null,
      });

      try {
        const adminUserId = await getAdminUserId();
        const isAdmin = adminUserId === uid;

        if (!adminUserId) {
          set({
            adminUserId: null,
            isAdmin: false,
            loading: false,
            errorCode: 'missing_admin_id',
          });
          return;
        }

        if (!isAdmin) {
          set({
            adminUserId,
            isAdmin: false,
            loading: false,
            errorCode: 'admin_no_inbox',
          });
          return;
        }

        set({ adminUserId, isAdmin: true, errorCode: null });

        adminThreadsUnsubscribe = onAdminChatThreads((threads) => {
          const threadIds = threads.map((thread) => thread.threadUserId);

          adminMessageUnsubscribers.forEach((unsubscribe, threadUserId) => {
            if (!threadIds.includes(threadUserId)) {
              unsubscribe();
              adminMessageUnsubscribers.delete(threadUserId);
            }
          });

          threads.forEach((thread) => {
            if (adminMessageUnsubscribers.has(thread.threadUserId)) return;

            const unsubscribe = onChatMessages(thread.threadUserId, (messages) => {
              set((state) => {
                const existing = state.adminThreads.filter(
                  (currentThread) => currentThread.threadUserId !== thread.threadUserId,
                );

                const currentThread = {
                  threadUserId: thread.threadUserId,
                  updatedAt: thread.updatedAt,
                  messages,
                };

                const merged = [...existing, currentThread].sort((a, b) => {
                  const aIndex = threadIds.indexOf(a.threadUserId);
                  const bIndex = threadIds.indexOf(b.threadUserId);
                  const aOrder = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
                  const bOrder = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
                  return aOrder - bOrder;
                });

                return { adminThreads: merged, loading: false };
              });
            });

            adminMessageUnsubscribers.set(thread.threadUserId, unsubscribe);
          });

          set((state) => {
            const byId = new Map(state.adminThreads.map((thread) => [thread.threadUserId, thread]));
            const orderedThreads = threads.map((thread) => {
              const existing = byId.get(thread.threadUserId);
              return {
                threadUserId: thread.threadUserId,
                updatedAt: thread.updatedAt,
                messages: existing?.messages ?? [],
              };
            });
            return {
              adminThreads: orderedThreads,
              loading: false,
            };
          });
        });
      } catch {
        set({ loading: false, errorCode: 'load_failed' });
      }
    },

    sendMessage: async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const { currentUserId, adminUserId, isAdmin } = get();
      if (!currentUserId) return;

      if (isAdmin) {
        set({ errorCode: 'admin_no_inbox' });
        return;
      }

      if (!adminUserId) {
        set({ errorCode: 'missing_admin_id' });
        return;
      }

      try {
        set({ sending: true, errorCode: null });
        await sendChatMessage(currentUserId, currentUserId, adminUserId, trimmed);
      } catch {
        set({ errorCode: 'send_failed' });
      } finally {
        set({ sending: false });
      }
    },

    clearError: () => set({ errorCode: null }),

    dispose: () => {
      resetThreadSubscription();
      resetAdminSubscriptions();
      set({
        currentUserId: null,
        adminUserId: null,
        isAdmin: false,
        loading: false,
        sending: false,
        messages: [],
        adminThreads: [],
        errorCode: null,
      });
    },
  },
}));
