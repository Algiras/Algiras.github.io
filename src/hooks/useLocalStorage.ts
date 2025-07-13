import { useState, useEffect, useCallback } from 'react';

// Generic type for localStorage values
type StorageValue<T> = T | null;

// Configuration options for localStorage hook
interface UseLocalStorageOptions {
  // Custom serializer (default: JSON.stringify)
  serialize?: (value: any) => string;
  // Custom deserializer (default: JSON.parse)
  deserialize?: (value: string) => any;
  // Whether to sync across tabs/windows
  syncAcrossTabs?: boolean;
}

/**
 * Custom hook for localStorage with TypeScript support and error handling
 * @param key - localStorage key
 * @param initialValue - initial value if key doesn't exist
 * @param options - configuration options
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [StorageValue<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  // Get value from localStorage or return initial value
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Set value in localStorage and state
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to local storage
        window.localStorage.setItem(key, serialize(valueToStore));
        
        // Save state
        setStoredValue(valueToStore);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serialize]
  );

  // Remove value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in localStorage (for cross-tab sync)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

// Specialized hooks for different data types
export function useLocalStorageString(key: string, initialValue: string = '') {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageNumber(key: string, initialValue: number = 0) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageBoolean(key: string, initialValue: boolean = false) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageObject<T extends Record<string, any>>(
  key: string, 
  initialValue: T
) {
  return useLocalStorage(key, initialValue);
} 