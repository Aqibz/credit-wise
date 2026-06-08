import InstallemDashboard from "../installem/InstallemDashboard";
import { useLocation } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { EntityPage } from "@/components/EntityPage";
import { ComingSoon } from "@/components/ComingSoon";
import { ContractsFunnelView } from "@/components/ContractsFunnelView";
import { DueInstallmentsView } from "@/components/DueInstallmentsView";
import { CompensationTabs } from "@/components/hr/CompensationTabs";
import { OperationsTabs } from "@/components/hr/OperationsTabs";
import { OrgStructureTabs } from "@/components/hr/OrgStructureTabs";
import { TimeOffTabs } from "@/components/hr/TimeOffTabs";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { MasterSettingsPage } from "@/components/settings/MasterSettingsPage";
import { IntegrationsPage } from "@/components/settings/IntegrationsPage";
import { BranchesPage } from "@/components/settings/BranchesPage";
import { SubscriptionPlanPage } from "@/components/settings/SubscriptionPlanPage";
import { UserAccessPage } from "@/components/settings/UserAccessPage";
import { WebsitePlatformPage } from "@/components/settings/WebsitePlatformPage";
import { MobileAppsPage } from "@/components/settings/MobileAppsPage";
import { CampaignsPage } from "@/components/settings/CampaignsPage";
import { BannersPage } from "@/components/settings/BannersPage";
import { AllCustomersPage, ActiveCustomersPage, GuarantorsPage, BlacklistPage } from "@/components/customers/CustomerRouteViews";
import { InstallemRoutePages } from "./InstallemRoutePages";
import * as entities from "@/lib/entities";

const entityRoutes = {
    "/catalog/brands": entities.brandsConfig,
    "/catalog/categories": entities.categoriesConfig,
    "/catalog/products": entities.productsConfig,
    "/inventory/stock-ops": entities.stockConfig,
    "/inventory/warehouses": entities.warehousesConfig,
    "/inventory/barcodes": entities.barcodeLabelsConfig,
    "/inventory/stock-center": entities.openingStockConfig,
    "/purchases/suppliers": entities.suppliersConfig,
    "/purchases/orders": entities.purchaseOrdersConfig,
    "/purchases/grn": entities.grnConfig,
    "/purchases/returns": entities.purchaseReturnsConfig,
    "/purchases/bills": entities.billsConfig,
    "/purchases/payments": entities.paymentsMadeConfig,
    "/purchases/expenses": entities.expensesConfig,
    "/sales": entities.salesConfig,
    "/sales/center": entities.salesConfig,
    "/sales/targets": entities.salesTargetsConfig,
    "/sales/reports": entities.reportsListConfig,
    "/sales/gate-pass": entities.gatePassConfig,
    "/sales/invoices": entities.salesConfig,
    "/sales/bike-registration": entities.vehicleRegistrationConfig,
    "/sales/returns": entities.salesReturnsConfig,
    "/payments-received": entities.paymentsReceivedConfig,
    "/installments": entities.installmentsActiveConfig,
    "/installments/today": entities.installmentsTodayConfig,
    "/installments/overdue": entities.installmentsOverdueConfig,
    "/installments/plans": entities.installmentPlansConfig,
    "/recovery/agents": entities.recoveryAgentsConfig,
    "/recovery/daily": entities.recoveryDailyConfig,
    "/recovery/shortfalls": entities.recoveryShortfallsConfig,
    "/customers": entities.customersConfig,
    "/customers/active": entities.customersConfig,
    "/customers/guarantors": entities.guarantorsConfig,
    "/customers/blacklist": entities.blacklistConfig,
    "/accounts/coa": entities.coaConfig,
    "/accounts/tax-center": entities.accountsReportsConfig,
    "/accounts/financial-statements": entities.accountsReportsConfig,
    "/accounts/audit-trail": entities.vouchersConfig,
    "/accounts/transaction-locking": entities.settingsConfig,
    "/hr/employees": entities.employeesConfig,
    "/hr/sales-team": entities.salesTeamConfig,
    "/hr/departments": entities.departmentsConfig,
    "/hr/designations": entities.designationsConfig,
    "/hr/shifts": entities.shiftsConfig,
    "/hr/attendance": entities.attendanceConfig,
    "/hr/leaves": entities.leavesConfig,
    "/hr/holidays": entities.holidayCalendarConfig,
    "/hr/payroll": entities.payrollConfig,
    "/hr/commissions": entities.commissionsConfig,
    "/hr/loans": entities.loanManagementConfig,
    "/hr/assets": entities.hrAssetsConfig,
    "/hr/exit": entities.exitManagementConfig,
    "/hr/settings": entities.hrSettingsConfig,
    "/reports": entities.reportsListConfig,
    "/audit-logs": entities.settingsConfig,
    "/security/user-access": entities.settingsConfig,
    "/branches": entities.branchesConfig,
    "/settings": entities.masterSettingsConfig,
    "/settings/master": entities.masterSettingsConfig,
    "/settings/integrations": entities.integrationSettingsConfig,
    "/support/hp-cases": {
        ...entities.hpCasesConfig,
        addHref: "/support/hp-cases/new",
        addLabel: "Add HP Case",
    },
    "/support/tickets": entities.supportTicketsConfig,
    "/support/complaints": entities.customerComplaintsConfig,
    "/support/warranty": entities.warrantyClaimsConfig,
};

function titleFromPath(pathname) {
    const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";

    return segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function ContractsRoute({ pathname }) {
    if (pathname === "/contracts") {
        return <EntityPage {...entities.hpCasesConfig} />;
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

    return route ? <ContractsFunnelView {...route} /> : null;
}

function PaymentsRoute({ pathname }) {
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

    return route ? <DueInstallmentsView {...route} /> : null;
}

function SettingsRoute({ pathname }) {
    if (pathname === "/security/user-access" || pathname === "/settings/users") {
        return (
            <AppShell>
                <UserAccessPage />
            </AppShell>
        );
    }

    if (pathname === "/settings" || pathname === "/settings/master" || pathname === "/settings/notifications") {
        return (
            <AppShell>
                <MasterSettingsPage />
            </AppShell>
        );
    }

    if (pathname === "/settings/integrations") {
        return (
            <AppShell>
                <IntegrationsPage />
            </AppShell>
        );
    }

    if (pathname === "/branches" || pathname === "/settings/branches") {
        return (
            <AppShell>
                <BranchesPage />
            </AppShell>
        );
    }

    const settingsMap = {
        "/settings/appearance": "appearance",
    };

    const initial = settingsMap[pathname];

    if (!initial) {
        return null;
    }

    return (
        <AppShell>
            <SettingsTabs initial={initial} />
        </AppShell>
    );
}

function CustomerRoute({ pathname }) {
    if (pathname === "/customers") {
        return <AllCustomersPage />;
    }

    if (pathname === "/customers/active") {
        return <ActiveCustomersPage />;
    }

    if (pathname === "/customers/guarantors") {
        return <GuarantorsPage />;
    }

    if (pathname === "/customers/blacklist") {
        return <BlacklistPage />;
    }

    return null;
}

function HrTabbedRoute({ pathname }) {
    if (pathname === "/hr/departments" || pathname === "/hr/designations") {
        return <OrgStructureTabs initial={pathname === "/hr/designations" ? "desig" : "dept"} />;
    }

    if (pathname === "/hr/attendance" || pathname === "/hr/leaves") {
        return <TimeOffTabs initial={pathname === "/hr/leaves" ? "leaves" : "att"} />;
    }

    if (pathname === "/hr/payroll" || pathname === "/hr/commissions" || pathname === "/hr/loans") {
        const initial = pathname === "/hr/commissions" ? "comm" : pathname === "/hr/loans" ? "loans" : "payroll";
        return <CompensationTabs initial={initial} />;
    }

    if (pathname === "/hr/assets" || pathname === "/hr/exit") {
        return <OperationsTabs initial={pathname === "/hr/exit" ? "exit" : "assets"} />;
    }

    return null;
}

export default function InstallemApp() {
    const { pathname, search } = useLocation();
    const initialSearch = typeof search?.q === "string" ? search.q : "";

    if (pathname === "/") {
        return <InstallemDashboard />;
    }

    const routedPage = InstallemRoutePages({ pathname });

    if (routedPage) {
        return routedPage;
    }

    const contractsRoute = pathname.startsWith("/contracts/") || pathname === "/contracts"
        ? ContractsRoute({ pathname })
        : null;

    if (contractsRoute) {
        return contractsRoute;
    }

    const paymentsRoute = pathname.startsWith("/payments/")
        ? PaymentsRoute({ pathname })
        : null;

    if (paymentsRoute) {
        return paymentsRoute;
    }

    const customerRoute = pathname === "/customers" || pathname.startsWith("/customers/")
        ? CustomerRoute({ pathname })
        : null;

    if (customerRoute) {
        return customerRoute;
    }

    const settingsRoute = (pathname.startsWith("/settings") || pathname === "/branches" || pathname === "/security/user-access")
        ? SettingsRoute({ pathname })
        : null;

    if (settingsRoute) {
        return settingsRoute;
    }

    const hrTabbedRoute = pathname.startsWith("/hr/")
        ? HrTabbedRoute({ pathname })
        : null;

    if (hrTabbedRoute) {
        return hrTabbedRoute;
    }

    if (pathname === "/platforms/subscription") {
        return (
            <AppShell>
                <SubscriptionPlanPage />
            </AppShell>
        );
    }

    if (pathname === "/platforms/website") {
        return (
            <AppShell>
                <WebsitePlatformPage />
            </AppShell>
        );
    }

    if (pathname === "/platforms/mobile-apps") {
        return (
            <AppShell>
                <MobileAppsPage />
            </AppShell>
        );
    }

    if (pathname === "/platforms/campaigns") {
        return (
            <AppShell>
                <CampaignsPage />
            </AppShell>
        );
    }

    if (pathname === "/platforms/banners") {
        return (
            <AppShell>
                <BannersPage />
            </AppShell>
        );
    }

    const prefixRoutes = [
        ["/purchases/suppliers/", entities.suppliersConfig],
        ["/support/", null],
    ];

    for (const [prefix, config] of prefixRoutes) {
        if (pathname.startsWith(prefix) && config) {
            return <EntityPage {...config} initialSearch={initialSearch} />;
        }
    }

    const config = entityRoutes[pathname];

    if (config) {
        return <EntityPage {...config} initialSearch={initialSearch} />;
    }

    return (
        <ComingSoon
            title={titleFromPath(pathname)}
            description="This route is not wired yet. The module shell exists, but this exact page still needs route mapping."
        />
    );
}
