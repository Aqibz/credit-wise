import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const RecoveryAgentsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.recoveryAgentsConfig));
export const DailyRecoveryPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.recoveryDailyConfig));
export const RecoveryShortfallsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.recoveryShortfallsConfig));
