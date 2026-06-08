import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, ShoppingBag, CreditCard,
  HandCoins, Users, Truck, Wallet, Briefcase, BarChart3,
  Bell, Settings, ChevronRight, ShieldCheck, LogOut, Crown, Globe,
  MonitorSmartphone, LifeBuoy, AlertTriangle, FileSignature, BookOpen,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSidebarState } from "./sidebar-context";
import userLogo from "@/assets/user-logo.png";
import { useActionCounts, ACTION_REQUIRED_ROUTES } from "@/lib/useActionCounts";

type Child = { label: string; to?: string; badge?: number; search?: Record<string, string>; children?: Child[]; header?: boolean };
type Item = { label: string; to?: string; icon: any; badge?: number; children?: Child[] };
type NavSection = { title: string; items: Item[] };

const DASHBOARD: Item = { label: "Dashboard", to: "/", icon: LayoutDashboard };

const CUSTOMERS: Item = {
  label: "Customers", icon: Users, children: [
    { label: "All Customers", to: "/customers" },
    { label: "Active Customers", to: "/customers/active" },
    { label: "Guarantors", to: "/customers/guarantors" },
    { label: "Blacklist", to: "/customers/blacklist" },
  ],
};

const CONTRACTS: Item = {
  label: "Contracts", icon: FileSignature, children: [
    { label: "All Contracts", to: "/contracts" },
    { label: "Funnel", header: true },
    { label: "Under Process", to: "/contracts/under-process" },
    { label: "Under Verification", to: "/contracts/under-verification" },
    { label: "Under Approval", to: "/contracts/under-approval" },
    { label: "Outcomes", header: true },
    { label: "Approved", to: "/contracts/approved" },
    { label: "Rejected", to: "/contracts/rejected" },
    { label: "Closed", to: "/contracts/closed" },
  ],
};

const PAYMENTS: Item = {
  label: "Payments", icon: Wallet, children: [
    { label: "Payments Received", to: "/payments-received" },
    { label: "Due Today", to: "/payments/due-today" },
    { label: "Due in 3 Days", to: "/payments/due-3-days" },
    { label: "Due in 7 Days", to: "/payments/due-7-days" },
    { label: "Due till Closing", to: "/payments/due-closing" },
  ],
};

const GATE_PASS: Item = { label: "Gate Pass", to: "/sales/gate-pass", icon: ShieldCheck };
const DELIVERY_CHALLAN: Item = { label: "Delivery Challan", to: "/logistics/deliveries", icon: Truck };
const INVOICES: Item = { label: "Invoices", to: "/sales/invoices", icon: FileSignature };
const BIKE_REGISTRATION: Item = { label: "Bike Registration", to: "/sales/bike-registration", icon: MonitorSmartphone };
const SALES_RETURN: Item = { label: "Sales Return", to: "/sales/returns", icon: ShoppingBag };

const PRODUCT_CATALOG: Item = {
  label: "Product Catalog", icon: Package, children: [
    { label: "Brands", to: "/catalog/brands" },
    { label: "Categories", to: "/catalog/categories" },
    { label: "Products", to: "/catalog/products" },
    { label: "Image Gallery", to: "/catalog/gallery" },
  ],
};
const INVENTORY: Item = {
  label: "Inventory", icon: Boxes, children: [
    { label: "Stock Operations", to: "/inventory/stock-ops" },
    { label: "Warehouses", to: "/inventory/warehouses" },
    { label: "Stock", to: "/inventory/stock-center", search: { tab: "opening" } },
    { label: "Barcode Labels", to: "/inventory/barcodes" },
  ],
};
const PURCHASE_SUPPLIERS: Item = { label: "Suppliers", to: "/purchases/suppliers", icon: Truck };
const PURCHASE_ORDERS: Item = { label: "Purchase Orders", to: "/purchases/orders", icon: ShoppingCart };
const PURCHASE_GRN: Item = { label: "Goods Receipt Note", to: "/purchases/grn", icon: Package };
const PURCHASE_RETURNS: Item = { label: "Purchase Returns", to: "/purchases/returns", icon: ShoppingBag };
const PURCHASE_BILLS: Item = { label: "Bills / Invoices", to: "/purchases/bills", icon: FileSignature };
const PURCHASE_PAYMENTS: Item = { label: "Payments Made", to: "/purchases/payments", icon: Wallet };
const PURCHASE_EXPENSES: Item = { label: "Expenses", to: "/purchases/expenses", icon: CreditCard };
const LOGISTICS: Item = {
  label: "Logistics", icon: Truck, children: [
    { label: "Deliveries", to: "/logistics/deliveries" },
    { label: "Gate Pass", to: "/sales/gate-pass" },
    { label: "Vehicle Registration", to: "/logistics/vehicles" },
  ],
};
const SALES: Item = {
  label: "Sales", icon: ShoppingBag, children: [
    { label: "Sales Overview", to: "/sales" },
    { label: "Sales Center", to: "/sales/center" },
    { label: "Targets", to: "/sales/targets" },
    { label: "Reports", to: "/sales/reports" },
  ],
};
const INSTALLMENTS: Item = {
  label: "Installments", icon: CreditCard, badge: 8, children: [
    { label: "Active", to: "/installments" },
    { label: "Today's Collections", to: "/installments/today", badge: 5 },
    { label: "Overdue / Defaulters", to: "/installments/overdue", badge: 3 },
  ],
};
const RECOVERY: Item = {
  label: "Recovery", icon: HandCoins, badge: 4, children: [
    { label: "Agents", to: "/recovery/agents" },
    { label: "Daily Sheet", to: "/recovery/daily", badge: 4 },
    { label: "Shortfalls", to: "/recovery/shortfalls" },
  ],
};
const ACCOUNTS_COA: Item = { label: "Chart of Accounts", to: "/accounts/coa", icon: FileSignature };
const ACCOUNTS_TAX_CENTER: Item = { label: "Tax Center", to: "/accounts/tax-center", icon: Wallet };
const ACCOUNTS_FIN_STMT: Item = { label: "Financial Statements", to: "/accounts/financial-statements", icon: BarChart3 };
const ACCOUNTS_AUDIT_TRAIL: Item = { label: "Audit Trail", to: "/accounts/audit-trail", icon: BookOpen };
const ACCOUNTS_TXN_LOCK: Item = { label: "Transaction Locking", to: "/accounts/transaction-locking", icon: ShieldCheck };
const HR_MANAGEMENT: Item = {
  label: "HR Management", icon: Briefcase, children: [
    { label: "Employees", to: "/hr/employees" },
    { label: "Sales Team", to: "/hr/sales-team" },
    { label: "Organization", header: true },
    { label: "Departments", to: "/hr/departments" },
    { label: "Designations", to: "/hr/designations" },
    { label: "Shifts", to: "/hr/shifts" },
    { label: "Workforce", header: true },
    { label: "Attendance", to: "/hr/attendance" },
    { label: "Leaves", to: "/hr/leaves" },
    { label: "Holiday Calendar", to: "/hr/holidays" },
    { label: "Payroll & Benefits", header: true },
    { label: "Payrolls", to: "/hr/payroll" },
    { label: "Commissions", to: "/hr/commissions" },
    { label: "Loan Management", to: "/hr/loans" },
    { label: "Operations", header: true },
    { label: "Assets", to: "/hr/assets" },
    { label: "Exit Management", to: "/hr/exit" },
    { label: "HR Settings", to: "/hr/settings" },
  ],
};
const REPORTS: Item = { label: "Reports", to: "/reports", icon: BarChart3 };

const SECURITY: Item = {
  label: "User Access Control", icon: ShieldCheck, children: [
    { label: "Audit Logs", to: "/audit-logs" },
    { label: "User Accounts", to: "/security/user-access" },
  ],
};
const SETTINGS: Item = {
  label: "Settings", icon: Settings, children: [
    { label: "Overview", to: "/settings" },
    { label: "Master Settings", to: "/settings/master" },
    { label: "Integrations", to: "/settings/integrations" },
    { label: "Appearance", to: "/settings/appearance" },
    { label: "Notifications", to: "/settings/notifications" },
    { label: "Users & Access", to: "/settings/users" },
    { label: "Branches", to: "/settings/branches" },
  ],
};

const SUBSCRIPTION: Item = { label: "Subscription Plan", to: "/platforms/subscription", icon: Crown };
const PLATFORMS: Item = {
  label: "Platforms", icon: Globe, children: [
    { label: "Website", to: "/platforms/website" },
    { label: "Mobile Apps", to: "/platforms/mobile-apps" },
    { label: "Campaigns", to: "/platforms/campaigns" },
    { label: "Banners", to: "/platforms/banners" },
    { label: "Subscription Plan", to: "/platforms/subscription" },
  ],
};
const INSTALLMENT_PLANS: Item = { label: "Installment Plans", to: "/installments/plans", icon: CreditCard };

const SUPPORT: Item = {
  label: "Support", icon: LifeBuoy, children: [
    { label: "HP Cases", to: "/support/hp-cases" },
    { label: "Support Tickets", to: "/support/tickets" },
    { label: "Customer Complaints", to: "/support/complaints" },
    { label: "Warranty Claims", to: "/support/warranty" },
  ],
};

const NAV_SECTIONS: NavSection[] = [
  { title: "Overview", items: [DASHBOARD, REPORTS] },
  { title: "Sales", items: [CUSTOMERS, CONTRACTS, PAYMENTS, GATE_PASS, DELIVERY_CHALLAN, INVOICES, BIKE_REGISTRATION, SALES_RETURN] },
  { title: "Purchases", items: [PRODUCT_CATALOG, INVENTORY, PURCHASE_SUPPLIERS, PURCHASE_ORDERS, PURCHASE_GRN, PURCHASE_RETURNS, PURCHASE_BILLS, PURCHASE_PAYMENTS, PURCHASE_EXPENSES] },
  { title: "Accounts", items: [ACCOUNTS_COA, ACCOUNTS_TAX_CENTER, ACCOUNTS_FIN_STMT, ACCOUNTS_AUDIT_TRAIL, ACCOUNTS_TXN_LOCK] },
  { title: "Workforce", items: [HR_MANAGEMENT] },
  { title: "System", items: [PLATFORMS, INSTALLMENT_PLANS, SUPPORT, SECURITY, SETTINGS] },
];

export function Sidebar() {
  const location = useLocation();
  const { collapsed } = useSidebarState();
  const actionCounts = useActionCounts();
  // SSR-safe initial state — deterministic, based only on current pathname.
  // Restoration from sessionStorage happens in useEffect after hydration.
  // Accordion mode: only one parent group open at a time.
  const findActiveParent = (pathname: string): string | null => {
    for (const s of NAV_SECTIONS) {
      for (const it of s.items) {
        if (!it.children) continue;
        const onActive = it.children.some((c) => {
          if (c.to && (pathname === c.to || pathname.startsWith(`${c.to}/`))) return true;
          return c.children?.some((g) => g.to && (pathname === g.to || pathname.startsWith(`${g.to}/`))) ?? false;
        });
        if (onActive) return it.label;
      }
    }
    return null;
  };

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const active = findActiveParent(location.pathname);
    return active ? { [active]: true } : {};
  });

  // Auto-collapse other groups whenever the active route belongs to a different group.
  useEffect(() => {
    const active = findActiveParent(location.pathname);
    if (!active) return;
    setOpen((prev) => (prev[active] ? prev : { [active]: true }));
  }, [location.pathname]);

  // Persist & restore scroll position so sidebar doesn't "jump" between pages
  const navRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = Number(sessionStorage.getItem("qcrm.sidebar.scroll") || "0");
    if (saved > 0) el.scrollTop = saved;
    const onScroll = () => sessionStorage.setItem("qcrm.sidebar.scroll", String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside
      aria-hidden={collapsed}
      style={{ willChange: "width" }}
      className={`hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 overflow-hidden transition-[width] duration-200 ease-out ${
        collapsed ? "w-0 border-r-0 pointer-events-none" : "w-64"
      }`}
    >
      <div className="px-4 py-3 border-b border-sidebar-border bg-muted/60 dark:bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-card grid place-items-center shadow-sm ring-1 ring-border overflow-hidden">
            <img src={userLogo} alt="CreditWise logo" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <div className="font-semibold text-foreground leading-tight tracking-tight">CreditWise</div>
            <div className="text-[11px] text-muted-foreground">Installment Suite</div>
          </div>
        </div>
      </div>
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const hasActive = item.children.some((c) => {
                  if (c.to && (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`))) return true;
                  return c.children?.some((g) => g.to && (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`))) ?? false;
                });
                const isOpen = Boolean(open[item.label]);
                // Sum of dynamic action counts across this item's children
                const dynChildSum = item.children.reduce((sum, c) => sum + (c.to && actionCounts[c.to] ? actionCounts[c.to] : 0), 0);
                const parentBadge = dynChildSum || item.badge || 0;
                const parentNeedsAction = dynChildSum > 0;
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen((s) => (s[item.label] ? {} : { [item.label]: true }));
                      }}
                      className={`group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                        hasActive
                          ? "text-sidebar-foreground bg-sidebar-accent/60"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      }`}
                    >
                      <span className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${hasActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {parentBadge ? (
                        <span className={`h-5 min-w-[20px] px-1.5 inline-flex items-center justify-center gap-0.5 rounded-full text-[10px] font-bold ${parentNeedsAction ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}`}>
                          {parentNeedsAction ? <AlertTriangle className="h-2.5 w-2.5" /> : null}
                          {parentBadge}
                        </span>
                      ) : null}
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-[22px] mt-1 mb-1 space-y-0.5 border-l border-sidebar-border/70 pl-3">
                        {item.children.map((c, idx) => {
                          if (c.header) {
                            return (
                              <div
                                key={`hdr-${c.label}-${idx}`}
                                className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70"
                              >
                                {c.label}
                              </div>
                            );
                          }
                          if (c.children) {
                            const groupKey = `${item.label}::${c.label}`;
                            const groupActive = c.children.some((g) => g.to && (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`)));
                            const groupOpen = open[groupKey] ?? groupActive;
                            return (
                              <div key={groupKey}>
                                <button
                                  type="button"
                                  onClick={() => setOpen((s) => ({ ...s, [groupKey]: !(s[groupKey] ?? groupActive) }))}
                                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                                    groupActive ? "text-primary bg-primary-soft/70" : "text-muted-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                                  }`}
                                >
                                  <span className="flex-1 text-left">{c.label}</span>
                                  <ChevronRight className={`h-3 w-3 transition-transform ${groupOpen ? "rotate-90" : ""}`} />
                                </button>
                                {groupOpen && (
                                  <div className="ml-2 mt-0.5 mb-1 space-y-0.5 border-l border-sidebar-border/60 pl-3">
                                    {c.children.map((g, gi) => {
                                      const gActive = g.to ? (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`)) : false;
                                      return (
                                        <Link
                                          key={`${g.to}-${gi}`}
                                          to={g.to as any}
                                          search={(g.search as any) ?? undefined}
                                          className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                            gActive
                                              ? "text-primary font-semibold"
                                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                          }`}
                                        >
                                          <span className="flex-1">{g.label}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          const pathMatch = c.to ? (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)) : false;
                          // If a sibling has a more specific (longer) `to` that also matches, defer to it
                          const moreSpecificSibling = c.to
                            ? item.children!.some((s) => s.to && s.to !== c.to &&
                                s.to.length > (c.to as string).length &&
                                (location.pathname === s.to || location.pathname.startsWith(`${s.to}/`)))
                            : false;
                          const currentTab = (location.search as any)?.tab as string | undefined;
                          const tabSiblings = item.children!.filter((s) => s.to && s.to === c.to && s.search?.tab);
                          const myTab = c.search?.tab;
                          let active = false;
                          if (pathMatch && !moreSpecificSibling) {
                            if (tabSiblings.length > 0) {
                              active = myTab ? currentTab === myTab : !currentTab;
                            } else {
                              active = true;
                            }
                          }
                          const dynCount = c.to ? actionCounts[c.to] : 0;
                          const childBadge = dynCount || c.badge || 0;
                          const childWarn = !!dynCount && c.to ? ACTION_REQUIRED_ROUTES.has(c.to) : false;
                          return (
                            <Link
                              key={`${c.to}-${myTab ?? idx}`}
                              to={c.to as any}
                              search={(c.search as any) ?? undefined}
                              className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                active
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                              }`}
                            >
                              <span className="flex-1">{c.label}</span>
                              {childBadge ? (
                                <span className={`h-4 min-w-[18px] px-1 inline-flex items-center justify-center gap-0.5 rounded-full text-[9px] font-bold ${childWarn ? "bg-warning text-warning-foreground" : "bg-destructive/90 text-destructive-foreground"}`}>
                                  {childWarn ? <AlertTriangle className="h-2.5 w-2.5" /> : null}
                                  {childBadge}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                    active
                      ? "text-primary font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  }`}
                >
                  <span className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="h-5 min-w-[20px] px-1.5 grid place-items-center rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
