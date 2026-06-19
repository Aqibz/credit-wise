import { cn } from "@/lib/helpers/utils";

export const invalidFieldClasses =
  "border-destructive/50 ring-2 ring-destructive/15 focus:border-destructive focus:ring-destructive/20";

export const fieldErrorTextClasses = "text-[11px] font-medium text-destructive";

export function getFieldStateClass(invalid?: boolean, className?: string) {
  return cn(invalid && invalidFieldClasses, className);
}

export function extractPhoneLocalNumber(value: string) {
  const normalized = String(value ?? "").trim();
  return normalized.replace(/^\+\d+\s*/, "").trim();
}

export function hasMeaningfulPhoneValue(value: string) {
  const digits = extractPhoneLocalNumber(value).replace(/\D/g, "");
  return digits.length >= 7;
}

export function isValidEmail(value: string) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}
