import { useCallback, useEffect, useState } from "react";

export type Entity = { id: string; [key: string]: any };

const isBrowser = typeof window !== "undefined";

function read<T extends Entity>(key: string, seed: T[]): T[] {
  if (!isBrowser) return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const stored: T[] = JSON.parse(raw);
    // Merge: keep user mutations, but backfill any new fields from seed
    // (by id) and append seed rows that don't exist in storage yet.
    const byId = new Map(stored.map((it) => [it.id, it] as const));
    let changed = false;
    for (const s of seed) {
      const existing = byId.get(s.id);
      if (!existing) {
        byId.set(s.id, s);
        changed = true;
        continue;
      }
      for (const k of Object.keys(s)) {
        if (!(k in existing)) {
          (existing as any)[k] = (s as any)[k];
          changed = true;
        }
      }
    }
    const merged = Array.from(byId.values());
    if (changed) window.localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  } catch {
    return seed;
  }
}


function write<T extends Entity>(key: string, items: T[]) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export function useEntityStore<T extends Entity>(key: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(seed);

  useEffect(() => {
    setItems(read<T>(key, seed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const create = useCallback((data: Omit<T, "id">) => {
    setItems((prev) => {
      const next = [{ ...(data as any), id: crypto.randomUUID() } as T, ...prev];
      write(key, next);
      return next;
    });
  }, [key]);

  const update = useCallback((id: string, data: Partial<T>) => {
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, ...data } : it));
      write(key, next);
      return next;
    });
  }, [key]);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      write(key, next);
      return next;
    });
  }, [key]);

  const reset = useCallback(() => {
    write(key, seed);
    setItems(seed);
  }, [key, seed]);

  return { items, create, update, remove, reset };
}
