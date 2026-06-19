import { Suspense, lazy } from "react";
import CreditWiseDashboard from "../credit-wise/pages/overview/dashboard/CreditWiseDashboard";
import { useLocation } from "@/shared/navigation";
import { RouteNotFoundPage } from "@/pages/common/RouteNotFoundPage";

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));

const CreditWiseRoutePages = lazyNamed(() => import("./CreditWiseRoutePages"), "CreditWiseRoutePages");
const ReportsEntityPage = lazyNamed(() => import("@/pages/overview/reports/ReportsEntityPage"), "ReportsEntityPage");
const ContractsIndexPage = lazyNamed(() => import("@/pages/sales/contracts/ContractsIndexPage"), "ContractsIndexPage");
const ContractsFunnelView = lazyNamed(() => import("@/pages/sales/contracts/ContractsFunnelView"), "ContractsFunnelView");
const DueInstallmentsView = lazyNamed(() => import("@/pages/sales/payments/DueInstallmentsView"), "DueInstallmentsView");
const AllCustomersPage = lazyNamed(() => import("@/pages/sales/customers/CustomerRouteViews"), "AllCustomersPage");
const MasterSettingsPage = lazyNamed(() => import("@/pages/system/settings/MasterSettingsPage"), "MasterSettingsPage");
const IntegrationsPage = lazyNamed(() => import("@/pages/system/settings/IntegrationsPage"), "IntegrationsPage");
const BranchesPage = lazyNamed(() => import("@/pages/system/settings/BranchesPage"), "BranchesPage");
const UserAccessPage = lazyNamed(() => import("@/pages/system/security/UserAccessPage"), "UserAccessPage");
const NotificationsPage = lazyNamed(() => import("@/pages/system/settings/NotificationsPage"), "NotificationsPage");
const AppearancePage = lazyNamed(() => import("@/pages/system/settings/AppearancePage"), "AppearancePage");
const SubscriptionPlanPage = lazyNamed(() => import("@/pages/system/platforms/SubscriptionPlanPage"), "SubscriptionPlanPage");
const WebsitePlatformPage = lazyNamed(() => import("@/pages/system/platforms/WebsitePlatformPage"), "WebsitePlatformPage");
const MobileAppsPage = lazyNamed(() => import("@/pages/system/platforms/MobileAppsPage"), "MobileAppsPage");
const CampaignsPage = lazyNamed(() => import("@/pages/system/platforms/CampaignsPage"), "CampaignsPage");
const BannersPage = lazyNamed(() => import("@/pages/system/platforms/BannersPage"), "BannersPage");
const OrgStructureTabs = lazyNamed(() => import("@/components/hr/OrgStructureTabs"), "OrgStructureTabs");
const TimeOffTabs = lazyNamed(() => import("@/components/hr/TimeOffTabs"), "TimeOffTabs");
const CompensationTabs = lazyNamed(() => import("@/components/hr/CompensationTabs"), "CompensationTabs");
const OperationsTabs = lazyNamed(() => import("@/components/hr/OperationsTabs"), "OperationsTabs");
const CustomerProfilePage = lazyNamed(() => import("@/pages/sales/customers/CustomerProfilePage"), "CustomerProfilePage");
const ContractProfilePage = lazyNamed(() => import("@/pages/sales/contracts/ContractProfilePage"), "ContractProfilePage");
const EmployeeProfilePage = lazyNamed(() => import("@/pages/workforce/hr/EmployeeProfilePage"), "EmployeeProfilePage");
const SupplierProfilePage = lazyNamed(() => import("@/pages/purchases/suppliers/SupplierProfilePage"), "SupplierProfilePage");
const StockValueDrilldownPage = lazyNamed(() => import("@/pages/purchases/inventory/StockValueDrilldownPage"), "StockValueDrilldownPage");
const LowStockDrilldownPage = lazyNamed(() => import("@/pages/purchases/inventory/LowStockDrilldownPage"), "LowStockDrilldownPage");
const ItemLedgerReportPage = lazyNamed(() => import("@/pages/purchases/inventory/ItemLedgerReportPage"), "ItemLedgerReportPage");
const StockMovementReportPage = lazyNamed(() => import("@/pages/purchases/inventory/StockMovementReportPage"), "StockMovementReportPage");
const CollectionsDrilldown = lazyNamed(() => import("@/pages/sales/payments/CollectionsDrilldownPage"), "CollectionsDrilldown");
const AttendanceDrilldownPage = lazyNamed(() => import("@/pages/workforce/hr/AttendanceDrilldownPage"), "AttendanceDrilldownPage");
const LeavesDrilldownPage = lazyNamed(() => import("@/pages/workforce/hr/LeavesDrilldownPage"), "LeavesDrilldownPage");
const DeviceManagementPage = lazyNamed(() => import("@/pages/system/platforms/DeviceManagementPage"), "DeviceManagementPage");
const GalleryPage = lazyNamed(() => import("@/pages/purchases/catalog/GalleryPage"), "GalleryPage");
const LeadsPage = lazyNamed(() => import("@/pages/sales/leads/LeadEntityPages"), "LeadsPage");
const BrandsPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "BrandsPage");
const CategoriesPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "CategoriesPage");
const SubCategoriesPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "SubCategoriesPage");
const VariantAttributesPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "VariantAttributesPage");
const ProductsPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "ProductsPage");
const ProductVariantsPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "ProductVariantsPage");
const BundlesPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "BundlesPage");
const CollectionsPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "CollectionsPage");
const PricingPlansPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "PricingPlansPage");
const InstallmentMatrixPage = lazyNamed(() => import("@/pages/purchases/catalog/CatalogEntityPages"), "InstallmentMatrixPage");
const StockOperationsPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "StockOperationsPage");
const StockOnHandPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "StockOnHandPage");
const WarehousesPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "WarehousesPage");
const StockTransfersPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "StockTransfersPage");
const SerialsPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "SerialsPage");
const BarcodeLabelsPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "BarcodeLabelsPage");
const StockCenterPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "StockCenterPage");
const OpeningStockPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "OpeningStockPage");
const StockAdjustmentsPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "StockAdjustmentsPage");
const PhysicalAuditPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "PhysicalAuditPage");
const DamagedStockPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "DamagedStockPage");
const LowStockAlertsPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "LowStockAlertsPage");
const GatePassPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "GatePassPage");
const BikeRegistrationPage = lazyNamed(() => import("@/pages/purchases/inventory/InventoryEntityPages"), "BikeRegistrationPage");
const SuppliersPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "SuppliersPage");
const PurchaseOrdersPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "PurchaseOrdersPage");
const GoodsReceiptNotesPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "GoodsReceiptNotesPage");
const PurchaseReturnsPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "PurchaseReturnsPage");
const BillsInvoicesPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "BillsInvoicesPage");
const PaymentsMadePage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "PaymentsMadePage");
const ExpensesPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "ExpensesPage");
const SupplierLedgerPage = lazyNamed(() => import("@/pages/purchases/operations/PurchaseEntityPages"), "SupplierLedgerPage");
const SalesCenterPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesCenterPage");
const CashSalesPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "CashSalesPage");
const SalesTargetsPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesTargetsPage");
const SalesReportsPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesReportsPage");
const SalesInvoicesPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesInvoicesPage");
const DeliveriesPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "DeliveriesPage");
const SalesReceiptsPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesReceiptsPage");
const SalesReturnsPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "SalesReturnsPage");
const PaymentsReceivedPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "PaymentsReceivedPage");
const TargetsPage = lazyNamed(() => import("@/pages/sales/invoices/SalesEntityPages"), "TargetsPage");
const InstallmentsPage = lazyNamed(() => import("@/pages/sales/installments/InstallmentEntityPages"), "InstallmentsPage");
const InstallmentsTodayPage = lazyNamed(() => import("@/pages/sales/installments/InstallmentEntityPages"), "InstallmentsTodayPage");
const InstallmentsOverduePage = lazyNamed(() => import("@/pages/sales/installments/InstallmentEntityPages"), "InstallmentsOverduePage");
const InstallmentPlansPage = lazyNamed(() => import("@/pages/sales/installments/InstallmentEntityPages"), "InstallmentPlansPage");
const RecoveryAgentsPage = lazyNamed(() => import("@/pages/sales/recovery/RecoveryEntityPages"), "RecoveryAgentsPage");
const DailyRecoveryPage = lazyNamed(() => import("@/pages/sales/recovery/RecoveryEntityPages"), "DailyRecoveryPage");
const RecoveryShortfallsPage = lazyNamed(() => import("@/pages/sales/recovery/RecoveryEntityPages"), "RecoveryShortfallsPage");
const ChartOfAccountsPage = lazyNamed(() => import("@/pages/accounts/AccountsEntityPages"), "ChartOfAccountsPage");
const TaxCenterPage = lazyNamed(() => import("@/pages/accounts/AccountsEntityPages"), "TaxCenterPage");
const FinancialStatementsPage = lazyNamed(() => import("@/pages/accounts/AccountsEntityPages"), "FinancialStatementsPage");
const AuditTrailPage = lazyNamed(() => import("@/pages/accounts/AccountsEntityPages"), "AuditTrailPage");
const TransactionLockingPage = lazyNamed(() => import("@/pages/accounts/AccountsEntityPages"), "TransactionLockingPage");
const EmployeesPage = lazyNamed(() => import("@/pages/workforce/hr/HrEntityPages"), "EmployeesPage");
const SalesTeamPage = lazyNamed(() => import("@/pages/workforce/hr/HrEntityPages"), "SalesTeamPage");
const ShiftsPage = lazyNamed(() => import("@/pages/workforce/hr/HrEntityPages"), "ShiftsPage");
const HolidayCalendarPage = lazyNamed(() => import("@/pages/workforce/hr/HrEntityPages"), "HolidayCalendarPage");
const HrSettingsPage = lazyNamed(() => import("@/pages/workforce/hr/HrEntityPages"), "HrSettingsPage");
const HpCasesSupportPage = lazyNamed(() => import("@/pages/system/support/SupportEntityPages"), "HpCasesSupportPage");
const SupportTicketsPage = lazyNamed(() => import("@/pages/system/support/SupportEntityPages"), "SupportTicketsPage");
const CustomerComplaintsPage = lazyNamed(() => import("@/pages/system/support/SupportEntityPages"), "CustomerComplaintsPage");
const WarrantyClaimsPage = lazyNamed(() => import("@/pages/system/support/SupportEntityPages"), "WarrantyClaimsPage");
const AuditLogsPage = lazyNamed(() => import("@/pages/system/audit/AuditEntityPages"), "AuditLogsPage");

function LazyPage({ component: Component, ...props }) {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-background px-6"><div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">Loading page...</div></div>}>
      <Component {...props} />
    </Suspense>
  );
}
const ENTITY_PAGE_ROUTES = {
  "/reports": ReportsEntityPage,
  "/catalog/brands": BrandsPage,
  "/catalog/categories": CategoriesPage,
  "/catalog/sub-categories": SubCategoriesPage,
  "/catalog/attributes": VariantAttributesPage,
  "/catalog/products": ProductsPage,
  "/catalog/variants": ProductVariantsPage,
  "/catalog/bundles": BundlesPage,
  "/catalog/collections": CollectionsPage,
  "/catalog/pricing": PricingPlansPage,
  "/catalog/matrix": InstallmentMatrixPage,
  "/inventory/stock-ops": StockOperationsPage,
  "/inventory/stock": StockOnHandPage,
  "/inventory/warehouses": WarehousesPage,
  "/inventory/transfers": StockTransfersPage,
  "/inventory/serials": SerialsPage,
  "/inventory/barcodes": BarcodeLabelsPage,
  "/inventory/stock-center": StockCenterPage,
  "/inventory/opening": OpeningStockPage,
  "/inventory/adjustments": StockAdjustmentsPage,
  "/inventory/audit": PhysicalAuditPage,
  "/inventory/damaged": DamagedStockPage,
  "/inventory/low-stock": LowStockAlertsPage,
  "/purchases/suppliers": SuppliersPage,
  "/purchases/orders": PurchaseOrdersPage,
  "/purchases/grn": GoodsReceiptNotesPage,
  "/purchases/returns": PurchaseReturnsPage,
  "/purchases/bills": BillsInvoicesPage,
  "/purchases/payments": PaymentsMadePage,
  "/purchases/expenses": ExpensesPage,
  "/purchases/ledger": SupplierLedgerPage,
  "/sales": SalesCenterPage,
  "/sales/center": SalesCenterPage,
  "/sales/cash": CashSalesPage,
  "/sales/targets": SalesTargetsPage,
  "/sales/reports": SalesReportsPage,
  "/sales/gate-pass": GatePassPage,
  "/sales/invoices": SalesInvoicesPage,
  "/logistics/deliveries": DeliveriesPage,
  "/sales/receipts": SalesReceiptsPage,
  "/sales/bike-registration": BikeRegistrationPage,
  "/sales/returns": SalesReturnsPage,
  "/leads": LeadsPage,
  "/payments-received": PaymentsReceivedPage,
  "/installments": InstallmentsPage,
  "/installments/today": InstallmentsTodayPage,
  "/installments/overdue": InstallmentsOverduePage,
  "/installments/plans": InstallmentPlansPage,
  "/recovery/agents": RecoveryAgentsPage,
  "/recovery/daily": DailyRecoveryPage,
  "/recovery/shortfalls": RecoveryShortfallsPage,
  "/accounts/coa": ChartOfAccountsPage,
  "/accounts/tax-center": TaxCenterPage,
  "/accounts/financial-statements": FinancialStatementsPage,
  "/accounts/audit-trail": AuditTrailPage,
  "/accounts/transaction-locking": TransactionLockingPage,
  "/hr/employees": EmployeesPage,
  "/hr/sales-team": SalesTeamPage,
  "/hr/shifts": ShiftsPage,
  "/hr/holidays": HolidayCalendarPage,
  "/hr/settings": HrSettingsPage,
  "/audit-logs": AuditLogsPage,
  "/support/hp-cases": HpCasesSupportPage,
  "/support/tickets": SupportTicketsPage,
  "/support/complaints": CustomerComplaintsPage,
  "/support/warranty": WarrantyClaimsPage,
  "/targets": TargetsPage,
};

const CREATE_EDIT_ROUTE_PATTERN = /\/new$|\/[^/]+\/edit$/;

function renderContractsRoute(pathname) {
  if (pathname === "/contracts") {
    return <LazyPage component={ContractsIndexPage} />;
  }

  const routeMap = {
    "/contracts/under-process": {
      title: "Contracts - Under Process",
      description: "Contracts currently in process.",
      viewKey: "qcrm.contracts.under-process",
      statuses: ["Under Process"],
    },
    "/contracts/under-verification": {
      title: "Contracts - Under Verification",
      description: "Contracts waiting for verification.",
      viewKey: "qcrm.contracts.under-verification",
      statuses: ["Under Verification"],
    },
    "/contracts/under-approval": {
      title: "Contracts - Under Approval",
      description: "Contracts waiting for approval.",
      viewKey: "qcrm.contracts.under-approval",
      statuses: ["Under Approval"],
    },
    "/contracts/approved": {
      title: "Contracts - Approved",
      description: "Approved contracts.",
      viewKey: "qcrm.contracts.approved",
      statuses: ["Approved"],
    },
    "/contracts/rejected": {
      title: "Contracts - Rejected",
      description: "Rejected contracts.",
      viewKey: "qcrm.contracts.rejected",
      statuses: ["Rejected"],
    },
    "/contracts/closed": {
      title: "Contracts - Closed",
      description: "Closed contracts.",
      viewKey: "qcrm.contracts.closed",
      statuses: ["Closed"],
    },
  };

  const route = routeMap[pathname];

  return route ? <LazyPage component={ContractsFunnelView} {...route} /> : null;
}

function renderPaymentsRoute(pathname) {
  const routeMap = {
    "/payments/due-today": {
      title: "Payments - Due Today",
      description: "Installments due today.",
      windowDays: 0,
    },
    "/payments/due-3-days": {
      title: "Payments - Due In 3 Days",
      description: "Installments due within the next 3 days.",
      windowDays: 3,
    },
    "/payments/due-7-days": {
      title: "Payments - Due In 7 Days",
      description: "Installments due within the next 7 days.",
      windowDays: 7,
    },
    "/payments/due-closing": {
      title: "Payments - Due Till Closing",
      description: "All unpaid installments due till closing.",
      windowDays: null,
    },
  };

  const route = routeMap[pathname];

  return route ? <LazyPage component={DueInstallmentsView} {...route} /> : null;
}

function renderCustomerRoute(pathname) {
  if (pathname === "/customers") {
    return <LazyPage component={AllCustomersPage} />;
  }

  return null;
}

function renderSettingsRoute(pathname) {
  const exactRoutes = {
    "/settings": MasterSettingsPage,
    "/settings/master": MasterSettingsPage,
    "/settings/integrations": IntegrationsPage,
    "/settings/notifications": NotificationsPage,
    "/settings/appearance": AppearancePage,
    "/settings/users": UserAccessPage,
    "/security/user-access": UserAccessPage,
    "/branches": BranchesPage,
    "/settings/branches": BranchesPage,
    "/platforms/subscription": SubscriptionPlanPage,
    "/platforms/website": WebsitePlatformPage,
    "/platforms/mobile-apps": MobileAppsPage,
    "/platforms/campaigns": CampaignsPage,
    "/platforms/banners": BannersPage,
  };

  const Component = exactRoutes[pathname];

  return Component ? <LazyPage component={Component} /> : null;
}

function renderHrTabbedRoute(pathname) {
  if (pathname === "/hr/departments" || pathname === "/hr/designations") {
    return <LazyPage component={OrgStructureTabs} initial={pathname === "/hr/designations" ? "desig" : "dept"} />;
  }

  if (pathname === "/hr/attendance" || pathname === "/hr/leaves") {
    return <LazyPage component={TimeOffTabs} initial={pathname === "/hr/leaves" ? "leaves" : "att"} />;
  }

  if (pathname === "/hr/payroll" || pathname === "/hr/commissions" || pathname === "/hr/loans") {
    const initial = pathname === "/hr/commissions" ? "comm" : pathname === "/hr/loans" ? "loans" : "payroll";
    return <LazyPage component={CompensationTabs} initial={initial} />;
  }

  if (pathname === "/hr/assets" || pathname === "/hr/exit") {
    return <LazyPage component={OperationsTabs} initial={pathname === "/hr/exit" ? "exit" : "assets"} />;
  }

  return null;
}

function renderProfileRoute(pathname) {
  const contractMatch = pathname.match(/^\/contracts\/([^/]+)\/?$/);
  if (contractMatch) {
    return <LazyPage component={ContractProfilePage} contractId={contractMatch[1]} />;
  }

  const customerMatch = pathname.match(/^\/customers\/([^/]+)\/?$/);
  if (customerMatch) {
    return <LazyPage component={CustomerProfilePage} customerId={customerMatch[1]} />;
  }

  const employeeMatch = pathname.match(/^\/hr\/employees\/([^/]+)\/?$/);
  if (employeeMatch) {
    return <LazyPage component={EmployeeProfilePage} employeeId={employeeMatch[1]} />;
  }

  const supplierMatch = pathname.match(/^\/purchases\/suppliers\/([^/]+)\/?$/);
  if (supplierMatch) {
    return <LazyPage component={SupplierProfilePage} supplierId={supplierMatch[1]} />;
  }

  return null;
}

function renderDrilldownRoute(pathname) {
  const exactRoutes = {
    "/inventory/stock/drilldown": StockValueDrilldownPage,
    "/inventory/low-stock/drilldown": LowStockDrilldownPage,
    "/inventory/reports/item-ledger": ItemLedgerReportPage,
    "/inventory/reports/stock-movement": StockMovementReportPage,
    "/sales/collections": CollectionsDrilldown,
    "/hr/attendance/drilldown": AttendanceDrilldownPage,
    "/hr/leaves/drilldown": LeavesDrilldownPage,
    "/devices": DeviceManagementPage,
    "/catalog/gallery": GalleryPage,
  };

  const Component = exactRoutes[pathname];

  return Component ? <LazyPage component={Component} /> : null;
}

export default function CreditWiseApp() {
  const { pathname } = useLocation();

  if (pathname === "/") {
        return <CreditWiseDashboard />;
  }

  if (CREATE_EDIT_ROUTE_PATTERN.test(pathname)) {
        return <LazyPage component={CreditWiseRoutePages} pathname={pathname} />;
  }

  const profileRoute = renderProfileRoute(pathname);
  if (profileRoute) {
    return profileRoute;
  }

  const drilldownRoute = renderDrilldownRoute(pathname);
  if (drilldownRoute) {
    return drilldownRoute;
  }

  if (pathname.startsWith("/contracts")) {
    const contractsRoute = renderContractsRoute(pathname);
    if (contractsRoute) {
      return contractsRoute;
    }
  }

  if (pathname.startsWith("/payments/")) {
    const paymentsRoute = renderPaymentsRoute(pathname);
    if (paymentsRoute) {
      return paymentsRoute;
    }
  }

  if (pathname === "/customers") {
    return renderCustomerRoute(pathname);
  }

  if (pathname.startsWith("/settings") || pathname === "/branches" || pathname === "/security/user-access" || pathname.startsWith("/platforms/")) {
    const settingsRoute = renderSettingsRoute(pathname);
    if (settingsRoute) {
      return settingsRoute;
    }
  }

  if (pathname.startsWith("/hr/")) {
    const hrTabbedRoute = renderHrTabbedRoute(pathname);
    if (hrTabbedRoute) {
      return hrTabbedRoute;
    }
  }

  const EntityPageComponent = ENTITY_PAGE_ROUTES[pathname];
  if (EntityPageComponent) {
    return <LazyPage component={EntityPageComponent} />;
  }

  return <RouteNotFoundPage pathname={pathname} />;
}
