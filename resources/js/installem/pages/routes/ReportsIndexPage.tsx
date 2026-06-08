import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { usePersistentState } from "@/hooks/usePersistentState";

const REPORT_ROUTES: Record<string, Record<string, string>> = {
  inventory: {
    "item-ledger": "/inventory/reports/item-ledger",
    "stock-movement": "/inventory/reports/stock-movement",
  },
};
import {
  Download, FileText, ShoppingBag, Boxes, CreditCard, Wallet, Briefcase, Users,
  HandCoins, ShoppingCart, Building2, Calendar, Filter, Folder, FolderOpen,
  CalendarClock, Send, Mail, MessageSquare, Phone, Pause, Play, Trash2, Pencil, Zap,
  FileSpreadsheet, Printer, ShieldCheck, Lock, Truck, MoreHorizontal,
  Star, Search, LayoutGrid, TrendingUp, Sparkles,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui-kit";
import { useToast } from "@/components/Toaster";
import { useEntityStore } from "@/lib/useEntityStore";
import { type ReportSchedule, recomputeNextRun } from "@/components/reports/schedule-types";
const ScheduleDialog = lazy(() =>
  import("@/components/reports/ScheduleDialog").then((m) => ({ default: m.ScheduleDialog }))
);
import { useCurrentUser, type Role } from "@/lib/useCurrentUser";

const reportsSearchSchema = z.object({
  tab: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/reports/")({
  validateSearch: zodValidator(reportsSearchSchema),
  component: ReportsPage,
});

export type Report = { id: string; name: string; description: string; frequency: string };
export type ModuleTab = { id: string; label: string; icon: any; reports: Report[] };

export const MODULES: ModuleTab[] = [
  { id: "overview", label: "Business Overview", icon: TrendingUp, reports: [
    { id: "biz-snapshot", name: "Business Snapshot", description: "One-page summary: sales, recovery, stock value, cash position.", frequency: "Daily" },
    { id: "exec-dashboard", name: "Executive Dashboard", description: "C-suite KPIs across all branches with MoM trends.", frequency: "Weekly" },
    { id: "branch-comparison", name: "Branch Comparison", description: "Side-by-side sales, collections and stock per branch.", frequency: "Monthly" },
    { id: "portfolio-health", name: "Portfolio Health", description: "Active plans, NPA %, collection efficiency, ageing.", frequency: "Weekly" },
    { id: "cashflow-overview", name: "Cash Flow Overview", description: "Inflow vs outflow with 7-day forecast.", frequency: "Weekly" },
    { id: "growth-metrics", name: "Growth Metrics", description: "New customers, new plans, avg ticket size, tenure.", frequency: "Monthly" },
    { id: "risk-overview", name: "Risk & Defaulter Overview", description: "Defaulter count, write-offs, legal escalations.", frequency: "Monthly" },
    { id: "tax-overview", name: "Tax & Compliance Snapshot", description: "GST, withholding, FBR submission status.", frequency: "Monthly" },
  ]},
  { id: "sales", label: "Sales", icon: ShoppingBag, reports: [
    { id: "daily-sales", name: "Daily Sales Summary", description: "Total invoices, units and revenue per day.", frequency: "Daily" },
    { id: "salesman", name: "Salesman Performance", description: "Per-salesman invoices, value and conversions.", frequency: "Weekly" },
    { id: "team-performance", name: "Sales Team Performance", description: "Team-wise targets, achievement and ranking.", frequency: "Weekly" },
    { id: "product-sales", name: "Product-wise Sales", description: "Top products by quantity and value.", frequency: "Monthly" },
    { id: "category-sales", name: "Category Sales", description: "Sales grouped by category and sub-category.", frequency: "Monthly" },
    { id: "brand-sales", name: "Brand-wise Sales", description: "Revenue and units sold per brand.", frequency: "Monthly" },
    { id: "branch-sales", name: "Branch-wise Sales", description: "Compare sales across branches.", frequency: "Monthly" },
    { id: "customer-buying", name: "Customer Buying Pattern", description: "Repeat customers and basket analysis.", frequency: "Monthly" },
    { id: "invoice-register", name: "Invoice Register", description: "All invoices with status and payment mode.", frequency: "Daily" },
    { id: "cash-sales", name: "Cash Sales Register", description: "Walk-in cash sales by branch and shift.", frequency: "Daily" },
    { id: "installment-sales", name: "Installment Sales", description: "Plans booked, advance taken, balance financed.", frequency: "Weekly" },
    { id: "hp-cases", name: "HP / Hire Purchase Cases", description: "Status of all hire-purchase cases.", frequency: "Weekly" },
    { id: "deliveries", name: "Delivery Status", description: "Pending, in-transit and completed deliveries.", frequency: "Daily" },
    { id: "collections", name: "Sales Collections", description: "Receipts collected against invoices.", frequency: "Daily" },
    { id: "returns", name: "Sales Returns", description: "All sales returns with reasons.", frequency: "Weekly" },
    { id: "discount-report", name: "Discount & Promo Usage", description: "Discounts applied with approval trail.", frequency: "Weekly" },
    { id: "target-vs-actual", name: "Target vs Actual", description: "Set targets compared to achieved sales.", frequency: "Monthly" },
  ]},
  { id: "purchases", label: "Purchases", icon: ShoppingCart, reports: [
    { id: "po-status", name: "Purchase Order Status", description: "Open, partial and closed POs.", frequency: "Weekly" },
    { id: "po-register", name: "Purchase Order Register", description: "All POs raised in the period.", frequency: "Monthly" },
    { id: "supplier-ledger", name: "Supplier Ledger", description: "Outstanding payables per supplier.", frequency: "Monthly" },
    { id: "supplier-aging", name: "Supplier Payables Ageing", description: "0-30 / 31-60 / 61-90 / 90+ buckets.", frequency: "Monthly" },
    { id: "grn-summary", name: "GRN Summary", description: "All goods received with discrepancies.", frequency: "Weekly" },
    { id: "purchase-returns", name: "Purchase Returns", description: "Goods returned to suppliers with reasons.", frequency: "Monthly" },
    { id: "bills-register", name: "Bills Register", description: "Supplier bills booked with due dates.", frequency: "Monthly" },
    { id: "payments-made", name: "Payments to Suppliers", description: "All payments by mode and bank.", frequency: "Weekly" },
    { id: "expense-report", name: "Expense Report", description: "Expenses by category and branch.", frequency: "Monthly" },
    { id: "purchase-by-category", name: "Purchase by Category", description: "Spend grouped by category and sub-category.", frequency: "Monthly" },
    { id: "top-suppliers", name: "Top Suppliers", description: "Highest spend suppliers in the period.", frequency: "Monthly" },
  ]},
  { id: "inventory", label: "Inventory", icon: Boxes, reports: [
    { id: "stock-value", name: "Stock Valuation", description: "Live stock value per warehouse and product.", frequency: "On-demand" },
    { id: "stock-on-hand", name: "Stock on Hand", description: "Live stock per warehouse and product.", frequency: "On-demand" },
    { id: "stock-movement", name: "Stock Movement", description: "Inward / outward / transfers timeline.", frequency: "Weekly" },
    { id: "item-ledger", name: "Item Ledger", description: "Per-item transactions with running balance.", frequency: "On-demand" },
    { id: "adjustment-history", name: "Adjustment History", description: "All stock adjustments with reasons and approvals.", frequency: "Monthly" },
    { id: "transfer-history", name: "Transfer History", description: "Inter-warehouse transfers with status.", frequency: "Monthly" },
    { id: "low-stock", name: "Low Stock Alert", description: "Products at or below reorder level.", frequency: "Daily" },
    { id: "out-of-stock", name: "Out of Stock", description: "All zero-stock products by warehouse.", frequency: "Daily" },
    { id: "dead-stock", name: "Dead / Slow-Moving Stock", description: "Items with no movement in 90+ days.", frequency: "Monthly" },
    { id: "fast-moving", name: "Fast Moving Items", description: "Highest turnover SKUs.", frequency: "Monthly" },
    { id: "audit-variance", name: "Physical Audit Variance", description: "System vs counted variance.", frequency: "Monthly" },
    { id: "damaged-stock", name: "Damaged Stock", description: "Damaged units logged with reasons.", frequency: "Monthly" },
    { id: "serial-tracking", name: "Serial / IMEI Tracking", description: "Trace any serial across the lifecycle.", frequency: "On-demand" },
    { id: "barcode-print", name: "Barcode Print Log", description: "Batches of barcodes printed.", frequency: "Monthly" },
    { id: "gate-pass", name: "Gate Pass Register", description: "Inward and outward gate passes.", frequency: "Weekly" },
    { id: "opening-stock", name: "Opening Stock Report", description: "Opening balances per period.", frequency: "On-demand" },
  ]},
  { id: "installments", label: "Installments", icon: CreditCard, reports: [
    { id: "active-plans", name: "Active Installment Plans", description: "All running plans with balance.", frequency: "Daily" },
    { id: "today-collection", name: "Today's Collections", description: "Cash collected today by branch.", frequency: "Daily" },
    { id: "due-today", name: "Instalments Due Today", description: "All EMIs due today.", frequency: "Daily" },
    { id: "upcoming-due", name: "Upcoming Dues (7 days)", description: "EMIs falling due in next 7 days.", frequency: "Daily" },
    { id: "defaulters", name: "Defaulter Report", description: "Customers past grace period.", frequency: "Weekly" },
    { id: "ageing", name: "Receivables Ageing", description: "0-30, 31-60, 61-90, 90+ buckets.", frequency: "Monthly" },
    { id: "closed-plans", name: "Closed / Settled Plans", description: "Plans completed or settled early.", frequency: "Monthly" },
    { id: "rescheduled", name: "Rescheduled Plans", description: "Plans whose schedule was modified.", frequency: "Monthly" },
    { id: "markup-earned", name: "Markup / Profit Earned", description: "Finance markup earned per plan.", frequency: "Monthly" },
  ]},
  { id: "recovery", label: "Recovery", icon: HandCoins, reports: [
    { id: "agent-perf", name: "Agent Performance", description: "Recovery per agent vs target.", frequency: "Daily" },
    { id: "daily-recovery", name: "Daily Recovery Sheet", description: "Cash collected per agent per day.", frequency: "Daily" },
    { id: "shortfall", name: "Recovery Shortfalls", description: "Pending and short collections.", frequency: "Weekly" },
    { id: "field-visit", name: "Field Visits Log", description: "All visits with outcomes.", frequency: "Weekly" },
    { id: "ptp", name: "Promise-to-Pay Tracker", description: "Customer PTPs and follow-up status.", frequency: "Weekly" },
    { id: "legal-cases", name: "Legal Action Cases", description: "Customers escalated to legal.", frequency: "Monthly" },
  ]},
  { id: "finance", label: "Finance", icon: Wallet, reports: [
    { id: "pl", name: "Profit & Loss", description: "Income vs expenses for the period.", frequency: "Monthly" },
    { id: "balance-sheet", name: "Balance Sheet", description: "Assets, liabilities and equity.", frequency: "Monthly" },
    { id: "trial-balance", name: "Trial Balance", description: "All ledger balances.", frequency: "Monthly" },
    { id: "cash-flow", name: "Cash Flow Statement", description: "Operating, investing and financing flows.", frequency: "Monthly" },
    { id: "branch-pl", name: "Branch-wise P&L", description: "Profit per branch.", frequency: "Monthly" },
    { id: "tax-summary", name: "Tax Summary", description: "GST, withholding and FED summary.", frequency: "Monthly" },
    { id: "fbr-invoice", name: "FBR Invoice Report", description: "Invoices reported to FBR with IRN.", frequency: "Daily" },
    { id: "cash-bank", name: "Cash & Bank Balances", description: "Live balances per cash and bank account.", frequency: "Daily" },
    { id: "bank-recon", name: "Bank Reconciliation", description: "Book vs bank statement variance.", frequency: "Monthly" },
    { id: "vouchers", name: "Voucher Register", description: "Cash, bank, journal vouchers list.", frequency: "Monthly" },
    { id: "general-ledger", name: "General Ledger", description: "Account-wise transactions with running balance.", frequency: "On-demand" },
    { id: "day-book", name: "Day Book", description: "All entries posted for the day.", frequency: "Daily" },
    { id: "receivables", name: "Receivables Summary", description: "Total customer receivables snapshot.", frequency: "Weekly" },
    { id: "payables", name: "Payables Summary", description: "Total supplier payables snapshot.", frequency: "Weekly" },
  ]},
  { id: "hr", label: "HR", icon: Briefcase, reports: [
    { id: "attendance", name: "Attendance Register", description: "Daily presence and lateness.", frequency: "Monthly" },
    { id: "late-absent", name: "Late & Absent Report", description: "Employees late or absent in period.", frequency: "Weekly" },
    { id: "overtime", name: "Overtime Report", description: "Approved overtime hours per employee.", frequency: "Monthly" },
    { id: "shift-roster", name: "Shift Roster", description: "Assigned shifts per employee.", frequency: "Weekly" },
    { id: "payroll", name: "Payroll Register", description: "Salary, deductions and net pay.", frequency: "Monthly" },
    { id: "salary-slips", name: "Salary Slips Batch", description: "Generate slips for all employees.", frequency: "Monthly" },
    { id: "commissions", name: "Sales Commissions", description: "Commission earned per salesman.", frequency: "Monthly" },
    { id: "leaves", name: "Leave Balance", description: "Leaves used and remaining per employee.", frequency: "Monthly" },
    { id: "leaves-applied", name: "Leaves Applied", description: "Pending and approved leave requests.", frequency: "Weekly" },
    { id: "loans", name: "Employee Loans", description: "Outstanding loan balances.", frequency: "Monthly" },
    { id: "advances", name: "Salary Advances", description: "Advances given and recovery status.", frequency: "Monthly" },
    { id: "assets-allocated", name: "Assets Allocated", description: "Company assets issued to employees.", frequency: "Monthly" },
    { id: "exit-employees", name: "Exit / Final Settlement", description: "Resigned employees and final dues.", frequency: "Monthly" },
    { id: "headcount", name: "Headcount by Dept", description: "Active employees per department / branch.", frequency: "Monthly" },
  ]},
  { id: "customers", label: "Customers", icon: Users, reports: [
    { id: "customer-list", name: "Customer Master List", description: "All customers with KYC status.", frequency: "On-demand" },
    { id: "new-customers", name: "New Customers Acquired", description: "Customers onboarded in the period.", frequency: "Weekly" },
    { id: "kyc-pending", name: "KYC Pending", description: "Customers with incomplete KYC documents.", frequency: "Weekly" },
    { id: "blacklist", name: "Blacklisted Customers", description: "Defaulters and risky customers.", frequency: "Weekly" },
    { id: "guarantor", name: "Guarantor Report", description: "Active guarantors and their exposure.", frequency: "Monthly" },
    { id: "customer-ledger", name: "Customer Ledger", description: "Per-customer transactions and balance.", frequency: "On-demand" },
    { id: "top-customers", name: "Top Customers", description: "Customers by lifetime revenue.", frequency: "Monthly" },
    { id: "inactive-customers", name: "Inactive Customers", description: "No purchase in last 90+ days.", frequency: "Monthly" },
  ]},
  { id: "logistics", label: "Logistics", icon: Truck, reports: [
    { id: "vehicles", name: "Vehicle Register", description: "Owned and rented vehicles with status.", frequency: "Monthly" },
    { id: "trip-log", name: "Trip Log", description: "Deliveries dispatched per vehicle.", frequency: "Daily" },
    { id: "fuel-expense", name: "Fuel & Maintenance", description: "Fuel and repair expense per vehicle.", frequency: "Monthly" },
    { id: "gate-pass-log", name: "Logistics Gate Pass", description: "Vehicle gate passes (in / out).", frequency: "Weekly" },
    { id: "delivery-perf", name: "Delivery Performance", description: "On-time vs delayed delivery KPI.", frequency: "Weekly" },
  ]},
  { id: "branches", label: "Branches", icon: Building2, reports: [
    { id: "branch-list", name: "Branch Master List", description: "All branches with manager and status.", frequency: "On-demand" },
    { id: "branch-kpi", name: "Branch KPIs", description: "Sales, recovery and stock KPIs per branch.", frequency: "Monthly" },
    { id: "branch-cash", name: "Branch Cash Position", description: "Live cash balance per branch.", frequency: "Daily" },
    { id: "branch-staff", name: "Branch Staffing", description: "Active staff count and roles per branch.", frequency: "Monthly" },
  ]},
  { id: "audit", label: "Audit & Security", icon: ShieldCheck, reports: [
    { id: "audit-logs", name: "Audit Logs", description: "All user actions across the system.", frequency: "Daily" },
    { id: "user-access", name: "User Access Report", description: "Roles and permissions per user.", frequency: "Monthly" },
    { id: "login-history", name: "Login History", description: "Successful and failed logins.", frequency: "Weekly" },
    { id: "deleted-records", name: "Deleted Records", description: "All soft-deleted records and by whom.", frequency: "Weekly" },
    { id: "approval-trail", name: "Approval Trail", description: "Discounts, returns and edits approval log.", frequency: "Monthly" },
    { id: "notifications", name: "Notifications Log", description: "System notifications sent to users.", frequency: "Weekly" },
  ]},
];

const BRANCHES = ["All Branches", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"];
const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom Range"];
const WAREHOUSES = ["All Warehouses", "Main WH — Lahore", "Gulberg WH", "DHA WH", "Karachi WH", "Islamabad WH"];
const PRODUCTS = ["All Products", "Samsung A55", "iPhone 15", "Haier AC 1.5T", "Dawlance Fridge", "LG TV 55\"", "Honda 125"];

function ReportsPage() {
  const navigate = useNavigate();
  const { user, setUser, can, scopeBranches } = useCurrentUser();

  // Branch-level scope: restrict the visible branch list to user's allowed branches
  const allowedBranches = useMemo(() => {
    const list = scopeBranches(BRANCHES);
    return list.length ? list : [user.branches[0] ?? BRANCHES[1]];
  }, [scopeBranches, user.branches]);

  // RBAC: filter modules user is allowed to view
  const allowedModules = useMemo(
    () => MODULES.filter((m) => can("reports.view") && (m.id !== "inventory" || can("inventory.reports.view"))),
    [can],
  );

  const { tab: tabSearch } = Route.useSearch();
  const initialTab = useMemo(() => {
    if (tabSearch && allowedModules.find((m) => m.id === tabSearch)) return tabSearch;
    return allowedModules[0]?.id ?? MODULES[0].id;
  }, [tabSearch, allowedModules]);
  const [tab, setTabState] = useState(initialTab);
  const setTab = (next: string) => {
    setTabState(next);
    navigate({ to: "/reports", search: { tab: next }, replace: true });
  };
  // Keep state in sync if URL search changes externally (back/forward, deep link)
  if (tabSearch && tabSearch !== tab && allowedModules.find((m) => m.id === tabSearch)) {
    setTabState(tabSearch);
  }
  const [branch, setBranch] = useState(allowedBranches[0]);
  const [period, setPeriod] = useState(PERIODS[3]);
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = usePersistentState<string[]>(
    "qcrm.report-favorites",
    [],
    (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );
  const isFavorite = (id: string) => favorites.includes(id);
  const toggleFavorite = (id: string) =>
    setFavorites(favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]);
  const isFavoritesView = tab === "__favorites";
  const toast = useToast();

  // Auto-correct selections that fall outside RBAC scope (e.g. role switch)
  if (tab !== "__favorites" && !allowedModules.find((m) => m.id === tab) && allowedModules[0]) {
    setTabState(allowedModules[0].id);
  }
  if (!allowedBranches.includes(branch)) {
    setBranch(allowedBranches[0]);
  }

  const favoriteReports = useMemo(() => {
    const all: { report: Report; module: ModuleTab }[] = [];
    for (const m of allowedModules) for (const r of m.reports) if (favorites.includes(`${m.id}:${r.id}`)) all.push({ report: r, module: m });
    return all;
  }, [favorites, allowedModules]);

  const active = useMemo(() => {
    if (isFavoritesView) {
      return {
        id: "__favorites",
        label: "Favorites",
        icon: Star,
        reports: favoriteReports.map((f) => f.report),
      } as ModuleTab;
    }
    return allowedModules.find((m) => m.id === tab) ?? allowedModules[0];
  }, [tab, allowedModules, isFavoritesView, favoriteReports]);

  const visibleReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return active.reports;
    return active.reports.filter((r) =>
      r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }, [active.reports, search]);

  const isInventory = tab === "inventory";
  const isCustom = period === "Custom Range";

  const canExportInv = can("inventory.reports.export");
  const canScheduleInv = can("inventory.reports.schedule");
  const canExportGeneric = can("reports.export");
  const canScheduleGeneric = can("reports.schedule");
  const canExport = isInventory ? canExportInv : canExportGeneric;
  const canSchedule = isInventory ? canScheduleInv : canScheduleGeneric;

  const schedulesStore = useEntityStore<ReportSchedule>("qcrm.report-schedules", []);
  const moduleSchedules = useMemo(
    () => schedulesStore.items.filter((s) => s.moduleId === tab).sort((a, b) => String(a.nextRun).localeCompare(String(b.nextRun))),
    [schedulesStore.items, tab],
  );

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<{ report: Report; existing?: ReportSchedule } | null>(null);

  function openSchedule(report: Report, existing?: ReportSchedule) {
    if (!canSchedule) {
      toast.error("Access denied", `Your role (${user.role}) cannot schedule ${active.label} reports.`);
      return;
    }
    setScheduleFor({ report, existing });
    setScheduleOpen(true);
  }

  function saveSchedule(data: Omit<ReportSchedule, "id">) {
    if (scheduleFor?.existing) {
      schedulesStore.update(scheduleFor.existing.id, data);
      toast.success("Schedule updated", `${data.reportName} — next run ${formatNext(data.nextRun)}`);
    } else {
      schedulesStore.create(data);
      toast.success("Schedule created", `${data.reportName} will be delivered ${data.frequency.toLowerCase()} at ${data.time}.`);
    }
  }

  function runNow(s: ReportSchedule) {
    const recipients = s.recipients.split(",").map((r) => r.trim()).filter(Boolean).length || "configured";
    schedulesStore.update(s.id, { lastRun: new Date().toISOString(), nextRun: recomputeNextRun(s) });
    toast.success(`Sent: ${s.reportName}`, `Delivered via ${s.channels.join(", ")} to ${recipients} recipient(s).`);
  }

  function togglePause(s: ReportSchedule) {
    const status: ReportSchedule["status"] = s.status === "Active" ? "Paused" : "Active";
    schedulesStore.update(s.id, { status, nextRun: status === "Active" ? recomputeNextRun(s) : s.nextRun });
    toast.success(`Schedule ${status.toLowerCase()}`, s.reportName);
  }

  function removeSchedule(s: ReportSchedule) {
    schedulesStore.remove(s.id);
    toast.success("Schedule deleted", s.reportName);
  }

  function openReport(report: Report, autoPrint: boolean) {
    const extras = isInventory ? { warehouse, product, fromDate, toDate } : undefined;
    const html = buildReportHtml(report, active, branch, period, extras);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w && autoPrint) {
      w.addEventListener("load", () => setTimeout(() => w.print(), 400));
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return w;
  }

  function guardExport(report: Report): boolean {
    if (!canExport) {
      toast.error("Access denied", `Your role (${user.role}) cannot export ${active.label} reports.`);
      return false;
    }
    return true;
  }

  function downloadPdf(report: Report) {
    if (!guardExport(report)) return;
    openReport(report, true);
    toast.success("Report ready", `${report.name} opened — use Save as PDF in the print dialog.`);
  }

  function printReport(report: Report) {
    if (!guardExport(report)) return;
    openReport(report, true);
    toast.success("Print dialog opened", report.name);
  }

  function downloadCsv(report: Report) {
    if (!guardExport(report)) return;
    const rows = buildReportRows(report, active);
    const meta: string[][] = [
      ["Report", report.name],
      ["Module", active.label],
      ["Branch", branch],
      ["Period", isCustom && fromDate && toDate ? `${fromDate} to ${toDate}` : period],
      ["Generated by", `${user.name} (${user.role})`],
    ];
    if (isInventory) {
      meta.push(["Warehouse", warehouse]);
      meta.push(["Product", product]);
    }
    meta.push(["Generated", new Date().toLocaleString()], []);
    const all = [...meta, ...rows];
    const csv = all.map((r) => r.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success("CSV downloaded", report.name);
  }

  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="Operational and financial reports — pick a module, choose a branch and download as PDF."
      />

      {/* RBAC banner — current role + branch scope */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/5 p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 grid place-items-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Signed in as</div>
            <div className="text-[13px] font-bold text-foreground">{user.name}</div>
          </div>
        </div>
        <RoleSelect value={user.role} onChange={(role) => setUser({ ...user, role })} />
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
          <Building2 className="h-3.5 w-3.5" />
          Branch scope:
          <span className="text-foreground">
            {user.branches.includes("*") ? "All Branches" : user.branches.join(", ") || "—"}
          </span>
        </div>
        <div className="ml-auto text-[11px] text-muted-foreground font-semibold">
          {allowedModules.length} of {MODULES.length} modules accessible
        </div>
      </div>

      {/* 2-column layout: category sidebar + report grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* ─── Category Sidebar ─── */}
        <aside className="rounded-xl border border-border bg-card overflow-hidden h-fit lg:sticky lg:top-4">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports…"
                className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Favorites */}
          <button
            type="button"
            onClick={() => setTab("__favorites")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium border-b border-border transition-colors ${
              isFavoritesView
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted/60"
            }`}
          >
            <Star className={`h-4 w-4 ${isFavoritesView ? "fill-primary text-primary" : ""}`} strokeWidth={1.75} />
            <span className="flex-1 text-left">Favorites</span>
            {favorites.length > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isFavoritesView ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                {favorites.length}
              </span>
            )}
          </button>

          {/* Categories */}
          <div className="px-3 pt-3 pb-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Report Category</div>
          </div>
          <nav className="pb-2">
            {allowedModules.map((m) => {
              const activeCat = !isFavoritesView && tab === m.id;
              const FolderIcon = activeCat ? FolderOpen : Folder;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTab(m.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors group ${
                    activeCat
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <FolderIcon className={`h-4 w-4 shrink-0 ${activeCat ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} strokeWidth={1.75} />
                  <span className="flex-1 text-left truncate">{m.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCat ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/80"}`}>
                    {m.reports.length}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ─── Main content ─── */}
        <div className="min-w-0 space-y-4">
          {/* Active category header */}
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-lg bg-primary/10 text-primary">
                {(() => { const Icon = active.icon; return <Icon className="h-5 w-5" strokeWidth={1.75} />; })()}
              </div>
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight leading-tight">{active.label}</h2>
                <p className="text-[12px] text-muted-foreground">
                  {visibleReports.length} {visibleReports.length === 1 ? "report" : "reports"}
                  {search && ` matching "${search}"`}
                </p>
              </div>
            </div>
          </div>

          {/* Active Schedules for current module */}
          {!isFavoritesView && moduleSchedules.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h2 className="font-semibold text-foreground tracking-tight text-sm">Scheduled Deliveries</h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{moduleSchedules.length}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Auto-delivered via Email / SMS / WhatsApp</span>
              </div>
              <ul className="divide-y divide-border">
                {moduleSchedules.map((s) => {
                  const report = active.reports.find((r) => r.id === s.reportId);
                  return (
                    <li key={s.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-[13px] truncate">{s.reportName}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${s.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {s.frequency}{s.dayOfWeek ? ` • ${s.dayOfWeek}` : ""}{s.dayOfMonth ? ` • day ${s.dayOfMonth}` : ""} at {s.time}
                          {" • next: "}{formatNext(s.nextRun)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {s.channels.includes("Email") && <span className="h-7 w-7 grid place-items-center rounded-md bg-primary/10 text-primary" title="Email"><Mail className="h-3.5 w-3.5" /></span>}
                        {s.channels.includes("SMS") && <span className="h-7 w-7 grid place-items-center rounded-md bg-info/10 text-info" title="SMS"><MessageSquare className="h-3.5 w-3.5" /></span>}
                        {s.channels.includes("WhatsApp") && <span className="h-7 w-7 grid place-items-center rounded-md bg-success/15 text-success" title="WhatsApp"><Phone className="h-3.5 w-3.5" /></span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => runNow(s)} title="Send now" className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90">
                          <Zap className="h-3 w-3" /> Run Now
                        </button>
                        <button onClick={() => togglePause(s)} title={s.status === "Active" ? "Pause" : "Resume"} className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted">
                          {s.status === "Active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        {report && (
                          <button onClick={() => openSchedule(report, s)} title="Edit" className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => removeSchedule(s)} title="Delete" className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Empty state */}
          {visibleReports.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted text-muted-foreground grid place-items-center mb-3">
                {isFavoritesView ? <Star className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </div>
              <h3 className="font-semibold text-[14px]">
                {isFavoritesView ? "No favorites yet" : "No reports match your search"}
              </h3>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-sm mx-auto">
                {isFavoritesView
                  ? "Star any report to pin it here for one-click access."
                  : "Try a different keyword or pick a category from the sidebar."}
              </p>
            </div>
          )}

          {/* Report cards — "catalog ticket" style */}
          {visibleReports.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 animate-fade-in">
              {visibleReports.map((r, idx) => {
                const cardModule = isFavoritesView
                  ? favoriteReports.find((f) => f.report.id === r.id)?.module ?? active
                  : active;
                const favKey = `${cardModule.id}:${r.id}`;
                const fav = isFavorite(favKey);
                const scheduled = schedulesStore.items.filter((s) => s.moduleId === cardModule.id && s.reportId === r.id).length;
                const customRoute = REPORT_ROUTES[cardModule.id]?.[r.id];
                const targetRoute = customRoute ?? `/reports/${cardModule.id}/${r.id}`;
                const freqTone =
                  r.frequency === "Daily" ? "bg-primary" :
                  r.frequency === "Weekly" ? "bg-info" :
                  r.frequency === "Monthly" ? "bg-warning" :
                  "bg-muted-foreground/40";
                const freqText =
                  r.frequency === "Daily" ? "text-primary" :
                  r.frequency === "Weekly" ? "text-info" :
                  r.frequency === "Monthly" ? "text-warning-foreground" :
                  "text-muted-foreground";
                const seq = String(idx + 1).padStart(2, "0");
                return (
                  <div
                    key={`${cardModule.id}-${r.id}`}
                    role={targetRoute ? "button" : undefined}
                    tabIndex={targetRoute ? 0 : undefined}
                    title={r.description}
                    onClick={targetRoute ? () => navigate({ to: targetRoute }) : undefined}
                    onKeyDown={targetRoute ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate({ to: targetRoute }); } } : undefined}
                    className={`group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.18)] ${targetRoute ? "cursor-pointer" : ""}`}
                  >
                    {/* Visual header — icon tile + sparkline */}
                    <div className="relative h-16 bg-gradient-to-br from-muted/40 to-muted/10 border-b border-border/60 overflow-hidden">
                      <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-[3px] ${freqTone}`} />
                      {/* mini bars — deterministic from id */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-end gap-[3px] px-3 pb-2 h-full pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => {
                          const seed = (r.id.charCodeAt(i % r.id.length) + i * 13) % 100;
                          const h = 18 + (seed % 28);
                          return (
                            <span
                              key={i}
                              className={`w-[3px] rounded-sm ${freqTone} opacity-25 group-hover:opacity-60 transition-opacity`}
                              style={{ height: `${h}%` }}
                            />
                          );
                        })}
                      </div>
                      <span className={`absolute left-3 top-3 h-8 w-8 grid place-items-center rounded-md bg-card border border-border shadow-sm ${freqText}`}>
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span aria-hidden className="absolute -right-3 -top-2 text-[44px] font-black leading-none tabular-nums text-foreground/[0.06] select-none tracking-tighter">
                        {seq}
                      </span>
                      {/* Favorite */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(favKey); }}
                        title={fav ? "Unpin" : "Pin to favorites"}
                        className={`absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded transition-all ${
                          fav ? "text-warning opacity-100" : "text-muted-foreground/50 hover:text-warning opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${fav ? "fill-warning" : ""}`} strokeWidth={2} />
                      </button>
                    </div>

                    {/* Body — title only + meta dot */}
                    <div className="relative px-3 py-2.5 flex flex-col gap-1.5">
                      <h3 className="font-semibold text-[12.5px] text-foreground tracking-tight leading-snug line-clamp-2 min-h-[2.2em]">
                        {r.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground/70 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${freqTone}`} />
                          <span className="truncate">{r.frequency}</span>
                        </div>
                        {(isFavoritesView || scheduled > 0) && (
                          <div className="flex items-center gap-1 shrink-0">
                            {isFavoritesView && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[80px]">
                                {cardModule.label}
                              </span>
                            )}
                            {scheduled > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-success/15 text-success">
                                <CalendarClock className="h-2.5 w-2.5" /> {scheduled}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span aria-hidden className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {scheduleFor && (
        <Suspense fallback={null}>
          <ScheduleDialog
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            onSave={saveSchedule}
            initial={scheduleFor.existing}
            reportId={scheduleFor.report.id}
            reportName={scheduleFor.report.name}
            moduleId={active.id}
            moduleLabel={active.label}
            defaultBranch={branch}
            defaultPeriod={period}
          />
        </Suspense>
      )}
    </AppShell>
  );
}

function formatNext(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function FilterSelect({ icon, value, onChange, options }: { icon: any; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-9 pr-8 appearance-none rounded-lg border border-border bg-background text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const ROLES: Role[] = ["Owner", "Admin", "Branch Manager", "Inventory Officer", "Sales Officer", "Viewer"];
function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-[12px] font-bold">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        className="bg-transparent text-[12px] font-bold focus:outline-none cursor-pointer"
      >
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange, min, max }: { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  return (
    <label className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-background text-sm font-semibold">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold focus:outline-none"
      />
    </label>
  );
}

function buildReportHtml(r: Report, mod: ModuleTab, branch: string, period: string, extras?: { warehouse?: string; product?: string; fromDate?: string; toDate?: string }) {
  const generated = new Date().toLocaleString();
  return `<!doctype html><html><head><meta charset="utf-8"><title>${r.name}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: 'Montserrat', system-ui, sans-serif; color: #0f172a; }
  header { display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #4f46e5; padding-bottom:14px; margin-bottom:22px; }
  .brand { font-size: 24px; font-weight: 800; color:#4f46e5; letter-spacing:-0.5px; }
  .meta { text-align:right; font-size:11px; color:#475569; line-height:1.6; }
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing:-0.4px; }
  .sub { color:#475569; font-size:12.5px; margin-bottom:18px; }
  .filters { display:flex; gap:12px; flex-wrap:wrap; background:#f1f5f9; padding:12px 14px; border-radius:10px; margin-bottom:20px; font-size:12px; }
  .filters span b { color:#0f172a; }
  table { width:100%; border-collapse: collapse; font-size: 12px; }
  th { text-align:left; background:#f8fafc; color:#475569; font-weight:700; text-transform:uppercase; letter-spacing:.5px; font-size:10.5px; padding:10px 12px; border-bottom:2px solid #e2e8f0; }
  td { padding:10px 12px; border-bottom:1px solid #e2e8f0; color:#0f172a; }
  tr:nth-child(even) td { background:#fafbfc; }
  .totals { margin-top:16px; padding:14px; background:#eef2ff; border-radius:10px; font-weight:700; display:flex; justify-content:space-between; }
  footer { margin-top:30px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:10.5px; color:#64748b; display:flex; justify-content:space-between; }
</style></head><body>
<header>
  <div class="brand">CreditWise</div>
  <div class="meta">
    <div><b>Generated:</b> ${generated}</div>
    <div><b>Module:</b> ${mod.label}</div>
  </div>
</header>
<h1>${r.name}</h1>
<div class="sub">${r.description}</div>
<div class="filters">
  <span><b>Branch:</b> ${branch}</span>
  ${extras?.warehouse ? `<span><b>Warehouse:</b> ${extras.warehouse}</span>` : ""}
  ${extras?.product ? `<span><b>Product:</b> ${extras.product}</span>` : ""}
  <span><b>Period:</b> ${extras?.fromDate && extras?.toDate ? `${extras.fromDate} → ${extras.toDate}` : period}</span>
  <span><b>Frequency:</b> ${r.frequency}</span>
</div>
<table>
  <thead><tr>${buildReportRows(r, mod)[0].map((h) => `<th${/Amount/i.test(h) ? ' style="text-align:right"' : ""}>${h}</th>`).join("")}</tr></thead>
  <tbody>
    ${buildReportRows(r, mod).slice(1).map((row) => `<tr>${row.map((c, i) => `<td${i === row.length - 1 ? ' style="text-align:right"' : ""}>${c}</td>`).join("")}</tr>`).join("")}
  </tbody>
</table>
<footer>
  <span>CreditWise — Confidential</span>
  <span>Page 1 of 1</span>
</footer>
</body></html>`;
}

export function buildReportRows(r: Report, mod: ModuleTab): string[][] {
  const header = ["SR#", "Date", "Reference", "Description", "Amount (Rs.)"];
  const rows: string[][] = [header];
  const seed = (r.id + mod.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 12; i++) {
    const amt = ((seed * (i + 7)) % 50000) + 5000;
    rows.push([
      String(i + 1),
      `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
      `${mod.label.slice(0, 3).toUpperCase()}-${1000 + i}`,
      `Sample line item ${i + 1}`,
      amt.toLocaleString(),
    ]);
  }
  return rows;
}

export function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
