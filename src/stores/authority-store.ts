import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { AuthorityValue } from '@/types/chat';

/**
 * Authority Store State Interface
 * Manages the selected regulatory authority/framework for the chat
 */
interface AuthorityState {
  /** Currently selected authority (null when no selection) */
  selectedAuthority: AuthorityValue;
  
  /** Indicates if the authority selection is locked (e.g., in existing chats) */
  isAuthorityLocked: boolean;
  
  /** Loading state for authority-related operations */
  isAuthorityLoading: boolean;
  
  /** Trigger to open the dropdown (for UX prompts) */
  shouldOpenDropdown: boolean;
}

/**
 * Authority Store Actions Interface
 * Defines all actions that can be performed on the authority state
 */
interface AuthorityActions {
  /** Set the selected authority */
  setSelectedAuthority: (authority: AuthorityValue) => void;
  
  /** Set the locked state of authority selection */
  setIsAuthorityLocked: (locked: boolean) => void;
  
  /** Set the loading state */
  setIsAuthorityLoading: (loading: boolean) => void;
  
  /** Set authority from chat data and lock it */
  setAuthorityFromChat: (chatCategory: AuthorityValue) => void;
  
  /** Reset authority state to default (null, unlocked) */
  resetAuthority: () => void;
  
  /** Trigger dropdown to open (for UX prompts) */
  triggerDropdownOpen: () => void;
  
  /** Clear dropdown trigger */
  clearDropdownTrigger: () => void;
}

/**
 * Combined Authority Store Type
 */
type AuthorityStore = AuthorityState & AuthorityActions;

/**
 * Initial state for the authority store
 */
const initialState: AuthorityState = {
  selectedAuthority: null,
  isAuthorityLocked: false,
  isAuthorityLoading: false,
  shouldOpenDropdown: false,
};

/**
 * Authority Store
 * 
 * Manages the state of regulatory authority/framework selection across the application.
 * Uses Zustand for efficient state management with DevTools support in development.
 * 
 * @example
 * ```tsx
 * const { selectedAuthority, setSelectedAuthority, resetAuthority } = useAuthorityStore();
 * 
 * // Set authority
 * setSelectedAuthority('SRA');
 * 
 * // Reset to default
 * resetAuthority();
 * ```
 */
export const useAuthorityStore = create<AuthorityStore>()(
  devtools(
    (set) => ({
      // State
      ...initialState,

      // Actions
      setSelectedAuthority: (authority) =>
        set(
          { selectedAuthority: authority },
          false,
          'authority/setSelectedAuthority'
        ),

      setIsAuthorityLocked: (locked) =>
        set(
          { isAuthorityLocked: locked },
          false,
          'authority/setIsAuthorityLocked'
        ),

      setIsAuthorityLoading: (loading) =>
        set(
          { isAuthorityLoading: loading },
          false,
          'authority/setIsAuthorityLoading'
        ),

      setAuthorityFromChat: (chatCategory) =>
        set(
          {
            selectedAuthority: chatCategory,
            isAuthorityLocked: true,
            isAuthorityLoading: false,
          },
          false,
          'authority/setAuthorityFromChat'
        ),

      resetAuthority: () =>
        set(
          initialState,
          false,
          'authority/resetAuthority'
        ),

      triggerDropdownOpen: () =>
        set(
          { shouldOpenDropdown: true },
          false,
          'authority/triggerDropdownOpen'
        ),

      clearDropdownTrigger: () =>
        set(
          { shouldOpenDropdown: false },
          false,
          'authority/clearDropdownTrigger'
        ),
    }),
    {
      name: 'authority-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector Hooks for Optimized Re-renders
 * Use these hooks when you only need specific parts of the state
 */

/** Get only the selected authority value */
export const useSelectedAuthority = () =>
  useAuthorityStore((state) => state.selectedAuthority);

/** Get only the locked state */
export const useIsAuthorityLocked = () =>
  useAuthorityStore((state) => state.isAuthorityLocked);

/** Get only the loading state */
export const useIsAuthorityLoading = () =>
  useAuthorityStore((state) => state.isAuthorityLoading);

/** Get the dropdown trigger state */
export const useShouldOpenDropdown = () =>
  useAuthorityStore((state) => state.shouldOpenDropdown);

/** 
 * Get all authority actions
 * Uses useShallow to prevent infinite loops by maintaining stable references
 */
export const useAuthorityActions = () =>
  useAuthorityStore(
    useShallow((state) => ({
      setSelectedAuthority: state.setSelectedAuthority,
      setIsAuthorityLocked: state.setIsAuthorityLocked,
      setIsAuthorityLoading: state.setIsAuthorityLoading,
      setAuthorityFromChat: state.setAuthorityFromChat,
      resetAuthority: state.resetAuthority,
      triggerDropdownOpen: state.triggerDropdownOpen,
      clearDropdownTrigger: state.clearDropdownTrigger,
    }))
  );

