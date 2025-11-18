import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { ChatMessage } from '@/types/chat';

/**
 * Chat Store State Interface
 * Manages chat messages and related UI state
 */
interface ChatState {
  /** Array of chat messages */
  messages: ChatMessage[];

  /** ID of the message to focus on (currently unused) */
  focusMessageId: number | string | null;

  /** Trigger to scroll to bottom when a new message is sent */
  sendMessageTrigger: boolean;
}

/**
 * Chat Store Actions Interface
 * Defines all actions that can be performed on the chat state
 */
interface ChatActions {
  /** Set the entire messages array */
  setMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;

  /** Add a single message to the messages array */
  addMessage: (message: ChatMessage) => void;

  /** Add multiple messages to the messages array */
  addMessages: (messages: ChatMessage[]) => void;

  /** Clear all messages */
  clearMessages: () => void;

  /** Update a specific message by ID */
  updateMessage: (
    messageId: number | string,
    updates: Partial<ChatMessage>
  ) => void;

  /** Set the focus message ID */
  setFocusMessageId: (id: number | string | null) => void;

  /** Set the send message trigger (triggers scroll to bottom) */
  setSendMessageTrigger: (trigger: boolean) => void;

  /** Reset chat state to default */
  resetChatState: () => void;
}

/**
 * Combined Chat Store Type
 */
type ChatStore = ChatState & ChatActions;

/**
 * Initial state for the chat store
 */
const initialState: ChatState = {
  messages: [],
  focusMessageId: null,
  sendMessageTrigger: false,
};

/**
 * Chat Store
 *
 * Manages chat messages and related UI state across the application.
 * Uses Zustand for efficient state management with DevTools support in development.
 *
 * @example
 * ```tsx
 * const { messages, setMessages, addMessage } = useChatStore();
 *
 * // Set messages
 * setMessages([...messages, newMessage]);
 *
 * // Add a message
 * addMessage(newMessage);
 * ```
 */
export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      // State
      ...initialState,

      // Actions
      setMessages: (messages) =>
        set(
          (state) => ({
            messages:
              typeof messages === 'function'
                ? messages(state.messages)
                : messages,
          }),
          false,
          'chat/setMessages'
        ),

      addMessage: (message) =>
        set(
          (state) => ({ messages: [...state.messages, message] }),
          false,
          'chat/addMessage'
        ),

      addMessages: (messages) =>
        set(
          (state) => ({ messages: [...state.messages, ...messages] }),
          false,
          'chat/addMessages'
        ),

      clearMessages: () => set({ messages: [] }, false, 'chat/clearMessages'),

      updateMessage: (messageId, updates) =>
        set(
          (state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          }),
          false,
          'chat/updateMessage'
        ),

      setFocusMessageId: (id) =>
        set({ focusMessageId: id }, false, 'chat/setFocusMessageId'),

      setSendMessageTrigger: (trigger) =>
        set(
          { sendMessageTrigger: trigger },
          false,
          'chat/setSendMessageTrigger'
        ),

      resetChatState: () => set(initialState, false, 'chat/resetChatState'),
    }),
    {
      name: 'chat-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector Hooks for Optimized Re-renders
 * Use these hooks when you only need specific parts of the state
 */

/** Get only the messages array */
export const useChatMessages = () => useChatStore((state) => state.messages);

/** Get only the focus message ID */
export const useFocusMessageId = () =>
  useChatStore((state) => state.focusMessageId);

/** Get only the send message trigger */
export const useSendMessageTrigger = () =>
  useChatStore((state) => state.sendMessageTrigger);

/**
 * Get all chat actions
 * Uses useShallow to prevent infinite loops by maintaining stable references
 */
export const useChatActions = () =>
  useChatStore(
    useShallow((state) => ({
      setMessages: state.setMessages,
      addMessage: state.addMessage,
      addMessages: state.addMessages,
      clearMessages: state.clearMessages,
      updateMessage: state.updateMessage,
      setFocusMessageId: state.setFocusMessageId,
      setSendMessageTrigger: state.setSendMessageTrigger,
      resetChatState: state.resetChatState,
    }))
  );

/**
 * Get only the setMessages action
 */
export const useSetMessages = () => useChatStore((state) => state.setMessages);

/**
 * Get only the setSendMessageTrigger action
 */
export const useSetSendMessageTrigger = () =>
  useChatStore((state) => state.setSendMessageTrigger);
