import { useEffect, useState } from "react";
import { Replace, Plus } from "lucide-react";

export type OpeningSaveMode = "overwrite" | "delta";

const STORAGE_KEY = "qcrm.opening-stock.save-mode";
const DEFAULT_MODE: OpeningSaveMode = "overwrite";
const EVT = "qcrm:opening-save-mode";

export function getOpeningSaveMode(): OpeningSaveMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "delta" || v === "overwrite" ? v : DEFAULT_MODE;
}

export function setOpeningSaveMode(mode: OpeningSaveMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  // Notify other mounted toggles in the same tab.
  window.dispatchEvent(new CustomEvent(EVT, { detail: mode }));
}

/** React hook that mirrors the persisted save-mode and stays in sync across
 *  mounts (e.g. Opening Stock tab + standalone /inventory/opening route). */
export function useOpeningSaveMode(): [OpeningSaveMode, (m: OpeningSaveMode) => void] {
  const [mode, setMode] = useState<OpeningSaveMode>(DEFAULT_MODE);

  useEffect(() => {
    setMode(getOpeningSaveMode());
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent<OpeningSaveMode>).detail;
      if (next === "delta" || next === "overwrite") setMode(next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMode(getOpeningSaveMode());
    };
    window.addEventListener(EVT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return [mode, (m) => { setOpeningSaveMode(m); setMode(m); }];
}

/** Segmented control that controls how Opening Stock edits apply the entered
 *  quantity: replace the current value, or add it as a delta. */
export function OpeningSaveModeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useOpeningSaveMode();

  const opts: { key: OpeningSaveMode; label: string; hint: string; Icon: typeof Replace }[] = [
    { key: "overwrite", label: "Overwrite", hint: "Replace current quantity with the entered value", Icon: Replace },
    { key: "delta",     label: "Adjust (±)", hint: "Add the entered value to the current quantity",   Icon: Plus },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Save mode for opening stock quantity"
      className={`inline-flex items-center rounded-lg border border-border bg-card p-0.5 text-[12px] font-semibold ${className ?? ""}`}
    >
      <span className="px-2 text-muted-foreground hidden sm:inline">On save:</span>
      {opts.map(({ key, label, hint, Icon }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            title={hint}
            onClick={() => setMode(key)}
            className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md transition ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
