import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const AuditLogsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/settings").then((m) => m.settingsConfig));
