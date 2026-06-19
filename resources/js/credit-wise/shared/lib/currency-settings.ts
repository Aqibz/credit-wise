import { useSyncExternalStore } from "react";

export const MASTER_SETTINGS_STORAGE_KEY = "qcrm.masterSettingsKv";
export const SETTINGS_CHANGED_EVENT = "creditwise:master-settings-changed";

export type CurrencyOption = {
  value: string;
  code: string;
  chip: string;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: "PKR (Rs.)", code: "PKR", chip: "Rs." },
  { value: "USD ($)", code: "USD", chip: "$" },
  { value: "AED", code: "AED", chip: "AED" },
];

const DEFAULT_CURRENCY = CURRENCY_OPTIONS[0];

function readStoredCurrencyValue() {
  if (typeof window === "undefined") return DEFAULT_CURRENCY.value;

  try {
    const raw = window.localStorage.getItem(MASTER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_CURRENCY.value;
    const parsed = JSON.parse(raw) as Array<{ id: string; values?: Record<string, unknown> }>;
    return String(parsed?.[0]?.values?.currency ?? DEFAULT_CURRENCY.value);
  } catch {
    return DEFAULT_CURRENCY.value;
  }
}

export function getCurrencyPreference() {
  const storedValue = readStoredCurrencyValue();
  return CURRENCY_OPTIONS.find((option) => option.value === storedValue) ?? DEFAULT_CURRENCY;
}

export function notifyCurrencySettingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === MASTER_SETTINGS_STORAGE_KEY) onChange();
  };
  const handleSettingsChanged = () => onChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
  };
}

export function useCurrencyPreference() {
  return useSyncExternalStore(subscribe, getCurrencyPreference, getCurrencyPreference);
}
