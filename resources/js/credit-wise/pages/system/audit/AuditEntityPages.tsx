import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const AuditLogsPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/accounts").then((m) => ({
    ...m.vouchersConfig,
    title: "Audit Logs",
    description: "System activity, user actions and financial audit events.",
  })),
);
