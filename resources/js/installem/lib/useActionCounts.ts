import { useEffect, useState } from "react";

/**
 * Per-route "action-required" counts for sidebar badges.
 * Reads the same localStorage keys that useEntityStore writes to,
 * so badges update automatically as users approve / close items.
 */

type CountSpec = {
  key: string;
  match: (item: any) => boolean;
};

// Map sidebar route -> localStorage key + status filter
const SPECS: Record<string, CountSpec> = {
  "/logistics/deliveries": {
    key: "qcrm.deliveries.v2",
    match: (i) => ["Pending", "Scheduled", "In Transit", "Failed"].includes(i.status),
  },
  "/logistics/gate-pass": {
    key: "qcrm.gatepass.v2",
    match: (i) => i.status === "Pending",
  },
  "/purchases/orders": {
    key: "qcrm.po",
    match: (i) => ["Pending", "Draft"].includes(i.status),
  },
  "/purchases/grn": {
    key: "qcrm.grn",
    match: (i) => ["Pending", "Disputed"].includes(i.status),
  },
  "/purchases/bills": {
    key: "qcrm.bills",
    match: (i) => ["Pending", "Overdue"].includes(i.status),
  },
  "/purchases/returns": {
    key: "qcrm.purchase-returns",
    match: (i) => ["Pending", "Draft"].includes(i.status),
  },
  "/sales/returns": {
    key: "qcrm.sales-returns",
    match: (i) => ["Pending", "Approved"].includes(i.status),
  },
  "/support/hp-cases": {
    key: "qcrm.hp-cases",
    match: (i) => ["Pending", "In Review", "Open"].includes(i.status),
  },
  "/contracts/under-process": {
    key: "qcrm.hp-cases",
    match: (i) => i.status === "Under Process",
  },
  "/contracts/under-verification": {
    key: "qcrm.hp-cases",
    match: (i) => i.status === "Under Verification",
  },
  "/contracts/under-approval": {
    key: "qcrm.hp-cases",
    match: (i) => i.status === "Under Approval",
  },
  "/support/tickets": {
    key: "qcrm.tickets",
    match: (i) => ["Open", "Pending"].includes(i.status),
  },
  "/support/complaints": {
    key: "qcrm.complaints",
    match: (i) => ["Open", "Pending"].includes(i.status),
  },
  "/support/warranty": {
    key: "qcrm.warranty",
    match: (i) => ["Open", "Pending", "In Review"].includes(i.status),
  },
  "/installments/today": {
    key: "qcrm.installments.today",
    match: (i) => i.status !== "Paid",
  },
  "/installments/overdue": {
    key: "qcrm.installments.overdue",
    match: (i) => i.status !== "Paid",
  },
  "/recovery/daily": {
    key: "qcrm.recovery.daily",
    match: (i) => i.status !== "Recovered",
  },
};

function compute(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const out: Record<string, number> = {};
  for (const [route, spec] of Object.entries(SPECS)) {
    try {
      const raw = window.localStorage.getItem(spec.key);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      const n = arr.filter(spec.match).length;
      if (n > 0) out[route] = n;
    } catch {}
  }
  return out;
}

export function useActionCounts(): Record<string, number> {
  // Keep the first client render identical to SSR. Reading localStorage in the
  // initial state makes sidebar badges differ during hydration and can break
  // page interactions after React regenerates the tree.
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCounts(compute());
    const refresh = () => setCounts(compute());
    window.addEventListener("storage", refresh);
    // Same-tab updates: poll every 4s (cheap; only reads localStorage)
    const id = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(id);
    };
  }, []);

  return counts;
}

/** Routes where the badge should render with a warning icon. */
export const ACTION_REQUIRED_ROUTES = new Set<string>(Object.keys(SPECS));
