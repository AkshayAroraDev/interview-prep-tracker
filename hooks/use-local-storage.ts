"use client";

import { useCallback, useEffect, useState } from "react";

import { storageService } from "@/lib/storage-service";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = storageService.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Keep initial value on parse errors
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        storageService.setJson(key, next);
        return next;
      });
    },
    [key],
  );

  return { value: storedValue, setValue, isHydrated } as const;
}
