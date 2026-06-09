import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const StockOperationsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.stockConfig));
export const StockOnHandPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.stockConfig));
export const WarehousesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.warehousesConfig));
export const StockTransfersPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.transfersConfig));
export const SerialsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.serialsConfig));
export const BarcodeLabelsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.barcodeLabelsConfig));
export const StockCenterPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.openingStockConfig));
export const OpeningStockPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.openingStockConfig));
export const StockAdjustmentsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.stockAdjustmentConfig));
export const PhysicalAuditPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.physicalAuditConfig));
export const DamagedStockPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.damagedStockConfig));
export const LowStockAlertsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.lowStockAlertsConfig));
export const GatePassPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.gatePassConfig));
export const BikeRegistrationPage = createLegacyEntityRoutePage(() => import("@/lib/entities/inventory").then((m) => m.vehicleRegistrationConfig));
