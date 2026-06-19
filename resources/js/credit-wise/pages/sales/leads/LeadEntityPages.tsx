import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const LeadsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/leads").then((m) => m.leadsConfig));
