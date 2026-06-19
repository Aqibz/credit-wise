import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const ChartOfAccountsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/accounts").then((m) => m.coaConfig));
export const TaxCenterPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/accounts").then((m) => ({
    ...m.accountsReportsConfig,
    title: "Tax Center",
    description: "Sales tax, withholding and compliance summaries across the business.",
  })),
);
export const FinancialStatementsPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/accounts").then((m) => ({
    ...m.accountsReportsConfig,
    title: "Financial Statements",
    description: "Profit and loss, balance sheet, cash flow and aging statements.",
  })),
);
export const AuditTrailPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/accounts").then((m) => ({
    ...m.vouchersConfig,
    title: "Audit Trail",
    description: "Chronological accounting activity and voucher traceability across branches.",
  })),
);
export const TransactionLockingPage = createLegacyEntityRoutePage(() =>
  import("@/lib/entities/settings").then((m) => ({
    ...m.settingsConfig,
    title: "Transaction Locking",
    description: "Lock accounting periods and control back-dated financial changes.",
  })),
);
