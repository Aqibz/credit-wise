import { useEffect, useState } from "react";

/**
 * Persists state in localStorage so user selections survive page reloads
 * and cross-session re-logins on the same browser. The optional `validate`
 * guard rejects stored values that no longer match the allowed shape (e.g.
 * after the option list changes), falling back to `initial`.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw) as unknown;
      if (validate && !validate(parsed)) return initial;
      return parsed as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or storage unavailable — ignore silently
    }
  }, [key, value]);

  return [value, setValue];
}
