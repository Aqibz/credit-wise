import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const HpCasesSupportPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/sales").then((m) => ({
    ...m.hpCasesConfig,
    addHref: "/support/hp-cases/new",
    addLabel: "Add HP Case",
  })),
);
export const SupportTicketsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/support").then((m) => m.supportTicketsConfig));
export const CustomerComplaintsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/support").then((m) => m.customerComplaintsConfig));
export const WarrantyClaimsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/support").then((m) => m.warrantyClaimsConfig));
