import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const ReportsEntityPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.reportsListConfig));
