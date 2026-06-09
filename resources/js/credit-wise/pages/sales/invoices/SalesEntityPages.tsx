import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const SalesCenterPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.salesConfig));
export const CashSalesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.cashSaleConfig));
export const SalesTargetsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.salesTargetsConfig));
export const SalesReportsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.reportsListConfig));
export const SalesInvoicesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.salesConfig));
export const SalesReceiptsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.receiptsConfig));
export const SalesReturnsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.salesReturnsConfig));
export const PaymentsReceivedPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.paymentsReceivedConfig));
export const TargetsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.targetsConfig));
