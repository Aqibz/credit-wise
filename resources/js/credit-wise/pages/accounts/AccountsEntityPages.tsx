import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const ChartOfAccountsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/accounts").then((m) => m.coaConfig));
export const TaxCenterPage = createLegacyEntityRoutePage(() => import("@/lib/entities/accounts").then((m) => m.accountsReportsConfig));
export const FinancialStatementsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/accounts").then((m) => m.accountsReportsConfig));
export const AuditTrailPage = createLegacyEntityRoutePage(() => import("@/lib/entities/accounts").then((m) => m.vouchersConfig));
export const TransactionLockingPage = createLegacyEntityRoutePage(() => import("@/lib/entities/settings").then((m) => m.settingsConfig));
