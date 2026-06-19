import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const ContractsIndexPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.hpCasesConfig));
