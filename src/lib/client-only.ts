'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to ensure code only runs on the client side
 * This prevents hydration mismatches by ensuring server and client render the same thing initially
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook to safely access localStorage without hydration issues
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient) {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          setValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key, isClient]);

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (isClient) {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue] as const;
}

/**
 * Hook to safely access window object without hydration issues
 */
export function useWindow() {
  const isClient = useClientOnly();
  return isClient ? window : null;
}
