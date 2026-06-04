// Resolves the navigation target for a Recent Activity row in
// Stock Operations. Pure function so it can be exhaustively tested.
export type ActivityType = "Adjustment" | "Transfer" | "Audit";

export type ActivityLink = {
  to: "/inventory/transfers" | "/inventory/adjustments";
  search: { q: string; tab?: "audit" | "adjustments" };
};

const REF_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_\-\/]{1,63}$/;

export function isValidRef(ref: unknown): ref is string {
  return typeof ref === "string" && REF_PATTERN.test(ref.trim());
}

function baseFor(type: ActivityType): { to: ActivityLink["to"]; tab?: "audit" | "adjustments" } {
  switch (type) {
    case "Transfer":   return { to: "/inventory/transfers" };
    case "Audit":      return { to: "/inventory/adjustments", tab: "audit" };
    case "Adjustment": return { to: "/inventory/adjustments", tab: "adjustments" };
  }
}

export function resolveActivityLink(type: ActivityType, ref: string): ActivityLink {
  if (!isValidRef(ref)) throw new Error("Activity ref is required to build a deep link");
  const { to, tab } = baseFor(type);
  return { to, search: tab ? { tab, q: ref.trim() } : { q: ref.trim() } };
}

// Graceful variant: never throws. Returns the destination page with NO `q`
// filter when the ref is missing/invalid, plus a flag callers can use to
// surface a toast.
export type SafeActivityLink = {
  to: ActivityLink["to"];
  search: { q?: string; tab?: "audit" | "adjustments" };
  valid: boolean;
};

export function safeResolveActivityLink(type: ActivityType, ref: unknown): SafeActivityLink {
  const { to, tab } = baseFor(type);
  if (!isValidRef(ref)) {
    return { to, search: tab ? { tab } : {}, valid: false };
  }
  return { to, search: tab ? { tab, q: ref.trim() } : { q: ref.trim() }, valid: true };
}
