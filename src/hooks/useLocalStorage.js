'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to interact with LocalStorage in Next.js with complete hydration safety.
 * Initializes with initialValue, retrieves real values on mount, and keeps sync across tabs/hooks.
 * 
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Fallback value if key does not exist
 * @returns {[any, Function]} - The state and state-setter function
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  // Read value on client-side mount only to prevent Next.js hydration mismatches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  // Wrap state updater
  const setValue = useCallback((value) => {
    try {
      setStoredValue((currentVal) => {
        const valueToStore = value instanceof Function ? value(currentVal) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch a custom event to notify other hook instances in the same browser tab
          window.dispatchEvent(new Event('local-storage-update'));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for storage events across other tabs and our own updates
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item !== null ? JSON.parse(item) : initialValue);
        } catch (error) {
          console.warn(`Error reading localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}
export default useLocalStorage;
