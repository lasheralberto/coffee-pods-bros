import { create } from 'zustand';
import {
  getAdminUserId,
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

interface ChatStore {
  currentUserId: string | null;
  adminUserId: string | null;
  isAdmin: boolean;
  loading: boolean;
  sending: boolean;
  messages: ChatMessageDoc[];
  errorCode: ChatErrorCode;
  actions: {
    initForUser: (uid?: string | null) => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    clearError: () => void;
    dispose: () => void;
  };
}

let messagesUnsubscribe: (() => void) | null = null;

const resetThreadSubscription = () => {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
    messagesUnsubscribe = null;
  }
};

export const useChatStore = create<ChatStore>((set, get) => ({
  currentUserId: null,
  adminUserId: null,
  isAdmin: false,
  loading: false,
  sending: false,
  messages: [],
  errorCode: null,
  actions: {
    initForUser: async (uid) => {
      resetThreadSubscription();

      if (!uid) {
        set({
          currentUserId: null,
          adminUserId: null,
          isAdmin: false,
          loading: false,
          messages: [],
          errorCode: null,
        });
        return;
      }

      set({
        currentUserId: uid,
        loading: true,
        messages: [],
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
      set({
        currentUserId: null,
        adminUserId: null,
        isAdmin: false,
        loading: false,
        sending: false,
        messages: [],
        errorCode: null,
      });
    },
  },
}));
