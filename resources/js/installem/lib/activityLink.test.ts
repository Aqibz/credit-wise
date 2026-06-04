import { describe, it, expect } from "vitest";
import { resolveActivityLink } from "@/lib/activityLink";
import { Route as TransfersRoute } from "@/routes/inventory.transfers";
import { Route as AdjustmentsRoute } from "@/routes/inventory.adjustments";

// End-to-end verification:
// 1. resolveActivityLink builds the correct (to, q, tab) for each activity type.
// 2. The destination route's validateSearch preserves those exact values,
//    so the receiving page filters to the precise record on the right tab.

const cases = [
  {
    type: "Transfer" as const,
    ref: "TRF-2025-0142",
    expectTo: "/inventory/transfers",
    expectSearch: { q: "TRF-2025-0142" },
    route: TransfersRoute,
  },
  {
    type: "Adjustment" as const,
    ref: "ADJ-2025-0099",
    expectTo: "/inventory/adjustments",
    expectSearch: { tab: "adjustments", q: "ADJ-2025-0099" },
    route: AdjustmentsRoute,
  },
  {
    type: "Audit" as const,
    ref: "AUD-2025-0007",
    expectTo: "/inventory/adjustments",
    expectSearch: { tab: "audit", q: "AUD-2025-0007" },
    route: AdjustmentsRoute,
  },
];

describe("Recent Activity → deep link", () => {
  for (const c of cases) {
    it(`${c.type} routes to ${c.expectTo} with correct q/tab`, () => {
      const link = resolveActivityLink(c.type, c.ref);
      expect(link.to).toBe(c.expectTo);
      expect(link.search).toEqual(c.expectSearch);

      // Destination route must accept the search untouched.
      const validate = (c.route.options as any).validateSearch as (
        raw: Record<string, unknown>,
      ) => Record<string, unknown>;
      const parsed = validate(link.search as Record<string, unknown>);
      expect(parsed.q).toBe(c.ref);
      if ("tab" in c.expectSearch) {
        expect(parsed.tab).toBe(c.expectSearch.tab);
      }
    });
  }

  it("throws if ref is missing (prevents silent landing on unfiltered list)", () => {
    expect(() => resolveActivityLink("Transfer", "")).toThrow();
  });

  it("Adjustment ref never lands on the Audit tab and vice versa", () => {
    expect(resolveActivityLink("Adjustment", "ADJ-1").search.tab).toBe("adjustments");
    expect(resolveActivityLink("Audit", "AUD-1").search.tab).toBe("audit");
  });
});

import { safeResolveActivityLink, isValidRef } from "@/lib/activityLink";

describe("safeResolveActivityLink — graceful fallback", () => {
  it("returns destination with no q when ref is empty", () => {
    const r = safeResolveActivityLink("Transfer", "");
    expect(r.valid).toBe(false);
    expect(r.to).toBe("/inventory/transfers");
    expect(r.search).toEqual({});
  });

  it("preserves the correct tab even when ref is invalid", () => {
    expect(safeResolveActivityLink("Audit", null).search).toEqual({ tab: "audit" });
    expect(safeResolveActivityLink("Adjustment", undefined).search).toEqual({ tab: "adjustments" });
  });

  it("rejects refs with whitespace, html, or excessive length", () => {
    expect(isValidRef("")).toBe(false);
    expect(isValidRef("   ")).toBe(false);
    expect(isValidRef("<script>")).toBe(false);
    expect(isValidRef("A".repeat(200))).toBe(false);
    expect(isValidRef("TRF-2025-0001")).toBe(true);
  });

  it("returns valid=true and applies q for well-formed refs", () => {
    const r = safeResolveActivityLink("Adjustment", "ADJ-2025-0001");
    expect(r.valid).toBe(true);
    expect(r.search).toEqual({ tab: "adjustments", q: "ADJ-2025-0001" });
  });
});
