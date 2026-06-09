import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const InstallmentsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.installmentsActiveConfig));
export const InstallmentsTodayPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.installmentsTodayConfig));
export const InstallmentsOverduePage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.installmentsOverdueConfig));
export const InstallmentPlansPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.installmentPlansConfig));
