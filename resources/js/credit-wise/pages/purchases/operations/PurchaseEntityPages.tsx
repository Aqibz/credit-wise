import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const SuppliersPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.suppliersConfig));
export const PurchaseOrdersPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.purchaseOrdersConfig));
export const GoodsReceiptNotesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.grnConfig));
export const PurchaseReturnsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.purchaseReturnsConfig));
export const BillsInvoicesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.billsConfig));
export const PaymentsMadePage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.paymentsMadeConfig));
export const ExpensesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.expensesConfig));
export const SupplierLedgerPage = createLegacyEntityRoutePage(() => import("@/lib/entities/purchases").then((m) => m.suppliersConfig));
