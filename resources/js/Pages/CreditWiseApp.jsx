import { Suspense, lazy } from "react";
import CreditWiseDashboard from "../installem/pages/dashboard/CreditWiseDashboard";
import { useLocation } from "@tanstack/react-router";
import { LazyEntityRoute } from "@/pages/routes/LazyEntityRoute";
import { RouteNotFoundPage } from "@/pages/routes/RouteNotFoundPage";

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));

const CreditWiseRoutePages = lazyNamed(() => import("./CreditWiseRoutePages"), "CreditWiseRoutePages");
const ContractsFunnelView = lazyNamed(() => import("@/pages/contracts/ContractsFunnelView"), "ContractsFunnelView");
const DueInstallmentsView = lazyNamed(() => import("@/pages/payments/DueInstallmentsView"), "DueInstallmentsView");
const AllCustomersPage = lazyNamed(() => import("@/pages/customers/CustomerRouteViews"), "AllCustomersPage");
const ActiveCustomersPage = lazyNamed(() => import("@/pages/customers/CustomerRouteViews"), "ActiveCustomersPage");
const GuarantorsPage = lazyNamed(() => import("@/pages/customers/CustomerRouteViews"), "GuarantorsPage");
const BlacklistPage = lazyNamed(() => import("@/pages/customers/CustomerRouteViews"), "BlacklistPage");
const MasterSettingsPage = lazyNamed(() => import("@/pages/settings/MasterSettingsPage"), "MasterSettingsPage");
const IntegrationsPage = lazyNamed(() => import("@/pages/settings/IntegrationsPage"), "IntegrationsPage");
const BranchesPage = lazyNamed(() => import("@/pages/settings/BranchesPage"), "BranchesPage");
const UserAccessPage = lazyNamed(() => import("@/pages/settings/UserAccessPage"), "UserAccessPage");
const NotificationsPage = lazyNamed(() => import("@/pages/settings/NotificationsPage"), "NotificationsPage");
const AppearancePage = lazyNamed(() => import("@/pages/settings/AppearancePage"), "AppearancePage");
const SubscriptionPlanPage = lazyNamed(() => import("@/pages/settings/SubscriptionPlanPage"), "SubscriptionPlanPage");
const WebsitePlatformPage = lazyNamed(() => import("@/pages/settings/WebsitePlatformPage"), "WebsitePlatformPage");
const MobileAppsPage = lazyNamed(() => import("@/pages/settings/MobileAppsPage"), "MobileAppsPage");
const CampaignsPage = lazyNamed(() => import("@/pages/settings/CampaignsPage"), "CampaignsPage");
const BannersPage = lazyNamed(() => import("@/pages/settings/BannersPage"), "BannersPage");
const OrgStructureTabs = lazyNamed(() => import("@/components/hr/OrgStructureTabs"), "OrgStructureTabs");
const TimeOffTabs = lazyNamed(() => import("@/components/hr/TimeOffTabs"), "TimeOffTabs");
const CompensationTabs = lazyNamed(() => import("@/components/hr/CompensationTabs"), "CompensationTabs");
const OperationsTabs = lazyNamed(() => import("@/components/hr/OperationsTabs"), "OperationsTabs");
const CustomerProfilePage = lazyNamed(() => import("@/pages/routes/CustomerProfilePage"), "CustomerProfilePage");
const EmployeeProfilePage = lazyNamed(() => import("@/pages/routes/EmployeeProfilePage"), "EmployeeProfilePage");
const SupplierProfilePage = lazyNamed(() => import("@/pages/routes/SupplierProfilePage"), "SupplierProfilePage");
const StockValueDrilldownPage = lazyNamed(() => import("@/pages/routes/StockValueDrilldownPage"), "StockValueDrilldownPage");
const LowStockDrilldownPage = lazyNamed(() => import("@/pages/routes/LowStockDrilldownPage"), "LowStockDrilldownPage");
const ItemLedgerReportPage = lazyNamed(() => import("@/pages/routes/ItemLedgerReportPage"), "ItemLedgerReportPage");
const StockMovementReportPage = lazyNamed(() => import("@/pages/routes/StockMovementReportPage"), "StockMovementReportPage");
const CollectionsDrilldown = lazyNamed(() => import("@/pages/routes/CollectionsDrilldownPage"), "CollectionsDrilldown");
const AttendanceDrilldownPage = lazyNamed(() => import("@/pages/routes/AttendanceDrilldownPage"), "AttendanceDrilldownPage");
const LeavesDrilldownPage = lazyNamed(() => import("@/pages/routes/LeavesDrilldownPage"), "LeavesDrilldownPage");
const DeviceManagementPage = lazyNamed(() => import("@/pages/routes/DeviceManagementPage"), "DeviceManagementPage");
const GalleryPage = lazyNamed(() => import("@/pages/routes/GalleryPage"), "GalleryPage");

function RouteLoadingState() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-6">
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        Loading page...
      </div>
    </div>
  );
}

function LazyPage({ component: Component, ...props }) {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Component {...props} />
    </Suspense>
  );
}

const ENTITY_ROUTES = {
  "/catalog/brands": () => import("@/lib/entities/catalog").then((m) => m.brandsConfig),
  "/catalog/categories": () => import("@/lib/entities/catalog").then((m) => m.categoriesConfig),
  "/catalog/sub-categories": () => import("@/lib/entities/catalog").then((m) => m.subCategoriesConfig),
  "/catalog/attributes": () => import("@/lib/entities/catalog").then((m) => m.variantAttributesConfig),
  "/catalog/products": () => import("@/lib/entities/catalog").then((m) => m.productsConfig),
  "/catalog/variants": () => import("@/lib/entities/catalog").then((m) => m.productVariantsConfig),
  "/catalog/bundles": () => import("@/lib/entities/catalog").then((m) => m.bundlesConfig),
  "/catalog/collections": () => import("@/lib/entities/catalog").then((m) => m.collectionsConfig),
  "/catalog/pricing": () => import("@/lib/entities/catalog").then((m) => m.pricingPlansConfig),
  "/catalog/matrix": () => import("@/lib/entities/catalog").then((m) => m.installmentMatrixConfig),
  "/inventory/stock-ops": () => import("@/lib/entities/inventory").then((m) => m.stockConfig),
  "/inventory/stock": () => import("@/lib/entities/inventory").then((m) => m.stockConfig),
  "/inventory/warehouses": () => import("@/lib/entities/inventory").then((m) => m.warehousesConfig),
  "/inventory/transfers": () => import("@/lib/entities/inventory").then((m) => m.transfersConfig),
  "/inventory/serials": () => import("@/lib/entities/inventory").then((m) => m.serialsConfig),
  "/inventory/barcodes": () => import("@/lib/entities/inventory").then((m) => m.barcodeLabelsConfig),
  "/inventory/stock-center": () => import("@/lib/entities/inventory").then((m) => m.openingStockConfig),
  "/inventory/opening": () => import("@/lib/entities/inventory").then((m) => m.openingStockConfig),
  "/inventory/adjustments": () => import("@/lib/entities/inventory").then((m) => m.stockAdjustmentConfig),
  "/inventory/audit": () => import("@/lib/entities/inventory").then((m) => m.physicalAuditConfig),
  "/inventory/damaged": () => import("@/lib/entities/inventory").then((m) => m.damagedStockConfig),
  "/inventory/low-stock": () => import("@/lib/entities/inventory").then((m) => m.lowStockAlertsConfig),
  "/purchases/suppliers": () => import("@/lib/entities/purchases").then((m) => m.suppliersConfig),
  "/purchases/orders": () => import("@/lib/entities/purchases").then((m) => m.purchaseOrdersConfig),
  "/purchases/grn": () => import("@/lib/entities/purchases").then((m) => m.grnConfig),
  "/purchases/returns": () => import("@/lib/entities/purchases").then((m) => m.purchaseReturnsConfig),
  "/purchases/bills": () => import("@/lib/entities/purchases").then((m) => m.billsConfig),
  "/purchases/payments": () => import("@/lib/entities/purchases").then((m) => m.paymentsMadeConfig),
  "/purchases/expenses": () => import("@/lib/entities/purchases").then((m) => m.expensesConfig),
  "/purchases/ledger": () => import("@/lib/entities/purchases").then((m) => m.suppliersConfig),
  "/sales": () => import("@/lib/entities/sales").then((m) => m.salesConfig),
  "/sales/center": () => import("@/lib/entities/sales").then((m) => m.salesConfig),
  "/sales/cash": () => import("@/lib/entities/sales").then((m) => m.cashSaleConfig),
  "/sales/targets": () => import("@/lib/entities/sales").then((m) => m.salesTargetsConfig),
  "/sales/reports": () => import("@/lib/entities/sales").then((m) => m.reportsListConfig),
  "/sales/gate-pass": () => import("@/lib/entities/inventory").then((m) => m.gatePassConfig),
  "/sales/invoices": () => import("@/lib/entities/sales").then((m) => m.salesConfig),
  "/sales/receipts": () => import("@/lib/entities/sales").then((m) => m.receiptsConfig),
  "/sales/bike-registration": () => import("@/lib/entities/inventory").then((m) => m.vehicleRegistrationConfig),
  "/sales/returns": () => import("@/lib/entities/sales").then((m) => m.salesReturnsConfig),
  "/payments-received": () => import("@/lib/entities/sales").then((m) => m.paymentsReceivedConfig),
  "/installments": () => import("@/lib/entities/sales").then((m) => m.installmentsActiveConfig),
  "/installments/today": () => import("@/lib/entities/sales").then((m) => m.installmentsTodayConfig),
  "/installments/overdue": () => import("@/lib/entities/sales").then((m) => m.installmentsOverdueConfig),
  "/installments/plans": () => import("@/lib/entities/sales").then((m) => m.installmentPlansConfig),
  "/recovery/agents": () => import("@/lib/entities/sales").then((m) => m.recoveryAgentsConfig),
  "/recovery/daily": () => import("@/lib/entities/sales").then((m) => m.recoveryDailyConfig),
  "/recovery/shortfalls": () => import("@/lib/entities/sales").then((m) => m.recoveryShortfallsConfig),
  "/accounts/coa": () => import("@/lib/entities/accounts").then((m) => m.coaConfig),
  "/accounts/tax-center": () => import("@/lib/entities/accounts").then((m) => m.accountsReportsConfig),
  "/accounts/financial-statements": () => import("@/lib/entities/accounts").then((m) => m.accountsReportsConfig),
  "/accounts/audit-trail": () => import("@/lib/entities/accounts").then((m) => m.vouchersConfig),
  "/accounts/transaction-locking": () => import("@/lib/entities/settings").then((m) => m.settingsConfig),
  "/hr/employees": () => import("@/lib/entities/hr").then((m) => m.employeesConfig),
  "/hr/sales-team": () => import("@/lib/entities/sales").then((m) => m.salesTeamConfig),
  "/hr/shifts": () => import("@/lib/entities/hr").then((m) => m.shiftsConfig),
  "/hr/holidays": () => import("@/lib/entities/hr").then((m) => m.holidayCalendarConfig),
  "/hr/settings": () => import("@/lib/entities/hr").then((m) => m.hrSettingsConfig),
  "/reports": () => import("@/lib/entities/sales").then((m) => m.reportsListConfig),
  "/audit-logs": () => import("@/lib/entities/settings").then((m) => m.settingsConfig),
  "/support/hp-cases": () =>
    import("@/lib/entities/sales").then((m) => ({
      ...m.hpCasesConfig,
      addHref: "/support/hp-cases/new",
      addLabel: "Add HP Case",
    })),
  "/support/tickets": () => import("@/lib/entities/support").then((m) => m.supportTicketsConfig),
  "/support/complaints": () => import("@/lib/entities/support").then((m) => m.customerComplaintsConfig),
  "/support/warranty": () => import("@/lib/entities/support").then((m) => m.warrantyClaimsConfig),
  "/targets": () => import("@/lib/entities/sales").then((m) => m.targetsConfig),
};

const CREATE_EDIT_ROUTE_PATTERN = /\/new$|\/[^/]+\/edit$/;

function renderContractsRoute(pathname) {
  if (pathname === "/contracts") {
    return <LazyEntityRoute loadConfig={() => import("@/lib/entities/sales").then((m) => m.hpCasesConfig)} />;
  }

  const routeMap = {
    "/contracts/under-process": {
      title: "Contracts · Under Process",
      description: "Contracts currently in process.",
      viewKey: "qcrm.contracts.under-process",
      statuses: ["Under Process"],
    },
    "/contracts/under-verification": {
      title: "Contracts · Under Verification",
      description: "Contracts waiting for verification.",
      viewKey: "qcrm.contracts.under-verification",
      statuses: ["Under Verification"],
    },
    "/contracts/under-approval": {
      title: "Contracts · Under Approval",
      description: "Contracts waiting for approval.",
      viewKey: "qcrm.contracts.under-approval",
      statuses: ["Under Approval"],
    },
    "/contracts/approved": {
      title: "Contracts · Approved",
      description: "Approved contracts.",
      viewKey: "qcrm.contracts.approved",
      statuses: ["Approved"],
    },
    "/contracts/rejected": {
      title: "Contracts · Rejected",
      description: "Rejected contracts.",
      viewKey: "qcrm.contracts.rejected",
      statuses: ["Rejected"],
    },
    "/contracts/closed": {
      title: "Contracts · Closed",
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
      title: "Payments · Due Today",
      description: "Installments due today.",
      windowDays: 0,
    },
    "/payments/due-3-days": {
      title: "Payments · Due In 3 Days",
      description: "Installments due within the next 3 days.",
      windowDays: 3,
    },
    "/payments/due-7-days": {
      title: "Payments · Due In 7 Days",
      description: "Installments due within the next 7 days.",
      windowDays: 7,
    },
    "/payments/due-closing": {
      title: "Payments · Due Till Closing",
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

  if (pathname === "/customers/active") {
    return <LazyPage component={ActiveCustomersPage} />;
  }

  if (pathname === "/customers/guarantors") {
    return <LazyPage component={GuarantorsPage} />;
  }

  if (pathname === "/customers/blacklist") {
    return <LazyPage component={BlacklistPage} />;
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
  const { pathname, search } = useLocation();
  const initialSearch = typeof search?.q === "string" ? search.q : "";

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

  if (pathname === "/customers" || pathname === "/customers/active" || pathname === "/customers/guarantors" || pathname === "/customers/blacklist") {
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

  const loadConfig = ENTITY_ROUTES[pathname];
  if (loadConfig) {
    return <LazyEntityRoute loadConfig={loadConfig} initialSearch={initialSearch} />;
  }

  return <RouteNotFoundPage pathname={pathname} />;
}
