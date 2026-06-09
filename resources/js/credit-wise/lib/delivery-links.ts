// Cross-module helpers to link Deliveries with Invoices and Gate Passes.
// Reads from the same localStorage keys that useEntityStore writes to,
// with a seed fallback for SSR / first load.

import { deliveriesConfig, gatePassConfig } from "@/lib/entities";

export type DeliveryStatus =
  | "Pending"
  | "Scheduled"
  | "In Transit"
  | "Delivered"
  | "Failed"
  | "Returned";

export type DeliveryRecord = {
  id: string;
  ref: string;
  invoice?: string;
  customer?: string;
  scheduled?: string;
  vehicle?: string;
  driver?: string;
  status: DeliveryStatus;
  gatePass?: string;
  deliveredAt?: string;
  podBy?: string;
};

export type GatePassRecord = {
  id: string;
  ref: string;
  type?: string;
  party?: string;
  vehicle?: string;
  driver?: string;
  date?: string;
  status?: string;
};

function readStore<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return seed;
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

export function getAllDeliveries(): DeliveryRecord[] {
  return readStore<DeliveryRecord>(
    deliveriesConfig.storageKey,
    deliveriesConfig.seed as DeliveryRecord[],
  );
}

export function getAllGatePasses(): GatePassRecord[] {
  return readStore<GatePassRecord>(
    gatePassConfig.storageKey,
    gatePassConfig.seed as GatePassRecord[],
  );
}

export function getDeliveryByInvoice(invoiceRef: string): DeliveryRecord | undefined {
  if (!invoiceRef) return undefined;
  return getAllDeliveries().find((d) => d.invoice === invoiceRef);
}

export function getGatePassByRef(ref?: string): GatePassRecord | undefined {
  if (!ref) return undefined;
  return getAllGatePasses().find((g) => g.ref === ref);
}

/** Map a delivery status to the Deliveries page fast-filter id. */
export function deliveryFilterFor(status: DeliveryStatus): string {
  switch (status) {
    case "Pending":
      return "pending";
    case "Scheduled":
      return "scheduled";
    case "In Transit":
      return "in-transit";
    case "Delivered":
      return "delivered";
    case "Failed":
      return "failed";
    default:
      return "all";
  }
}

/** Tone for status badges, shared between pages. */
export function deliveryTone(
  status?: DeliveryStatus,
): "primary" | "warning" | "success" | "destructive" | "muted" {
  switch (status) {
    case "Pending":
      return "muted";
    case "Scheduled":
      return "primary";
    case "In Transit":
      return "warning";
    case "Delivered":
      return "success";
    case "Failed":
    case "Returned":
      return "destructive";
    default:
      return "muted";
  }
}

/** Display label — "In Transit" is shown to users as "Out for Delivery". */
export function deliveryLabel(status?: DeliveryStatus): string {
  if (!status) return "Not Scheduled";
  return status === "In Transit" ? "Out for Delivery" : status;
}
