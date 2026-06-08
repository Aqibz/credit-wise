import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, lazy, Suspense } from "react";
import {
  ArrowLeft, Download, Printer, Share2, CalendarClock, Star, RefreshCw,
  Filter, Search, ChevronDown, FileSpreadsheet, FileText, Mail,
  TrendingUp, TrendingDown, Calendar, MapPin, MoreHorizontal, Maximize2,
  Sparkles, ArrowUpRight, ArrowDownLeft, Eye, ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { KpiIcon } from "@/components/kpi-icons";
import { MODULES, type Report, type ModuleTab } from "./reports.index";
import { useToast } from "@/components/Toaster";
import { usePersistentState } from "@/hooks/usePersistentState";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { type ReportSchedule } from "@/components/reports/schedule-types";
import { useEntityStore } from "@/lib/useEntityStore";

const ScheduleDialog = lazy(() =>
  import("@/components/reports/ScheduleDialog").then((m) => ({ default: m.ScheduleDialog }))
);

export const Route = createFileRoute("/reports/$moduleId/$reportId")({
  head: ({ params }) => ({
    meta: [
      { title: `Report Preview — ${params.reportId}` },
      { name: "description", content: "SaaS-grade report preview with KPIs, trends, breakdowns and export." },
    ],
  }),
  component: ReportPreviewPage,
});

const BRANCHES = ["All Branches", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"];
const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Last 90 Days", "This Quarter", "Custom Range"];

// ---------- Deterministic mock helpers ----------
function seedFrom(str: string): number {
  let s = 0;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
  return s;
}
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 8) / 0xffffff;
  };
}
function money(n: number) {
  return "PKR " + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}
function num(n: number) {
  return n.toLocaleString("en-PK");
}

// ---------- Module-aware KPI / column shape ----------
type Kpi = { label: string; value: string; delta: number; tone: "primary" | "success" | "warning" | "muted" };
type Col = { key: string; label: string; align?: "left" | "right"; tone?: "money" | "qty" | "status" | "muted" };
type Row = Record<string, string | number>;

function buildKpis(moduleId: string, report: Report): Kpi[] {
  const r = rng(seedFrom(moduleId + report.id));
  const base = Math.floor(r() * 9_000_000) + 1_000_000;
  const orders = Math.floor(r() * 1400) + 120;
  const trend = (r() * 30 - 10);
  const avg = Math.floor(base / Math.max(orders, 1));

  // sensible mapping per module
  switch (moduleId) {
    case "sales":
      return [
        { label: "Revenue", value: money(base), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Invoices", value: num(orders), delta: +((r() * 20 - 5).toFixed(1)), tone: "success" },
        { label: "Avg Ticket", value: money(avg), delta: +((r() * 14 - 4).toFixed(1)), tone: "warning" },
        { label: "Returns", value: num(Math.floor(orders * 0.06)), delta: -+((r() * 10).toFixed(1)), tone: "muted" },
      ];
    case "purchases":
      return [
        { label: "Spend", value: money(base), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "POs", value: num(orders), delta: +((r() * 18 - 5).toFixed(1)), tone: "success" },
        { label: "Open POs", value: num(Math.floor(orders * 0.22)), delta: +((r() * 12 - 4).toFixed(1)), tone: "warning" },
        { label: "Avg Lead Time", value: `${Math.floor(r() * 8) + 3} d`, delta: -+((r() * 6).toFixed(1)), tone: "muted" },
      ];
    case "inventory":
      return [
        { label: "Stock Value", value: money(base), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "SKUs Tracked", value: num(orders * 4), delta: +((r() * 6 - 2).toFixed(1)), tone: "success" },
        { label: "Low Stock", value: num(Math.floor(orders * 0.08)), delta: +((r() * 10 - 3).toFixed(1)), tone: "warning" },
        { label: "Dead Stock", value: num(Math.floor(orders * 0.03)), delta: +((r() * 5 - 2).toFixed(1)), tone: "muted" },
      ];
    case "installments":
      return [
        { label: "Active Plans", value: num(orders * 2), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Receivables", value: money(base * 3), delta: +((r() * 12 - 3).toFixed(1)), tone: "success" },
        { label: "Overdue", value: money(base * 0.18), delta: +((r() * 14 - 2).toFixed(1)), tone: "warning" },
        { label: "Collection %", value: `${(82 + r() * 12).toFixed(1)}%`, delta: +((r() * 6 - 2).toFixed(1)), tone: "muted" },
      ];
    case "recovery":
      return [
        { label: "Collected", value: money(base * 0.4), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Visits", value: num(orders), delta: +((r() * 18 - 4).toFixed(1)), tone: "success" },
        { label: "PTPs Open", value: num(Math.floor(orders * 0.3)), delta: +((r() * 8 - 2).toFixed(1)), tone: "warning" },
        { label: "Shortfall", value: money(base * 0.07), delta: -+((r() * 10).toFixed(1)), tone: "muted" },
      ];
    case "finance":
      return [
        { label: "Net Result", value: money(base * 0.6), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Inflow", value: money(base * 1.4), delta: +((r() * 12 - 2).toFixed(1)), tone: "success" },
        { label: "Outflow", value: money(base * 0.9), delta: +((r() * 12 - 2).toFixed(1)), tone: "warning" },
        { label: "Cash on Hand", value: money(base * 0.55), delta: +((r() * 6 - 2).toFixed(1)), tone: "muted" },
      ];
    case "hr":
      return [
        { label: "Headcount", value: num(220 + Math.floor(r() * 90)), delta: +((r() * 4).toFixed(1)), tone: "primary" },
        { label: "Present Today", value: `${(88 + r() * 9).toFixed(1)}%`, delta: +((r() * 4 - 2).toFixed(1)), tone: "success" },
        { label: "On Leave", value: num(8 + Math.floor(r() * 18)), delta: -+((r() * 6).toFixed(1)), tone: "warning" },
        { label: "Overtime Hrs", value: num(Math.floor(r() * 600) + 120), delta: +((r() * 12 - 4).toFixed(1)), tone: "muted" },
      ];
    case "customers":
      return [
        { label: "Customers", value: num(orders * 6), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "New This Period", value: num(orders), delta: +((r() * 22 - 4).toFixed(1)), tone: "success" },
        { label: "KYC Pending", value: num(Math.floor(orders * 0.18)), delta: -+((r() * 8).toFixed(1)), tone: "warning" },
        { label: "Blacklisted", value: num(Math.floor(orders * 0.02)), delta: +((r() * 3).toFixed(1)), tone: "muted" },
      ];
    case "logistics":
      return [
        { label: "Trips", value: num(orders), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "On-Time", value: `${(86 + r() * 10).toFixed(1)}%`, delta: +((r() * 6 - 2).toFixed(1)), tone: "success" },
        { label: "Vehicles Active", value: num(28 + Math.floor(r() * 14)), delta: +((r() * 4 - 2).toFixed(1)), tone: "warning" },
        { label: "Fuel Spend", value: money(base * 0.08), delta: +((r() * 10 - 2).toFixed(1)), tone: "muted" },
      ];
    case "branches":
      return [
        { label: "Branches", value: num(8 + Math.floor(r() * 6)), delta: 0, tone: "primary" },
        { label: "Sales / Day", value: money(base * 0.04), delta: +((r() * 10 - 2).toFixed(1)), tone: "success" },
        { label: "Top Branch", value: BRANCHES[1 + Math.floor(r() * 4)], delta: 0, tone: "warning" },
        { label: "Avg Footfall", value: num(Math.floor(r() * 380) + 120), delta: +((r() * 8 - 2).toFixed(1)), tone: "muted" },
      ];
    case "audit":
      return [
        { label: "Events", value: num(orders * 10), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Critical", value: num(Math.floor(orders * 0.03)), delta: -+((r() * 4).toFixed(1)), tone: "warning" },
        { label: "Users Active", value: num(40 + Math.floor(r() * 80)), delta: +((r() * 6 - 2).toFixed(1)), tone: "success" },
        { label: "Failed Logins", value: num(Math.floor(r() * 30)), delta: -+((r() * 4).toFixed(1)), tone: "muted" },
      ];
    case "overview": {
      switch (report.id) {
        case "branch-comparison":
          return [
            { label: "Total Sales", value: money(base * 1.6), delta: +(trend.toFixed(1)), tone: "primary" },
            { label: "Total Collections", value: money(base * 1.1), delta: +((r() * 12 - 2).toFixed(1)), tone: "success" },
            { label: "Stock Value", value: money(base * 2.4), delta: +((r() * 8 - 3).toFixed(1)), tone: "warning" },
            { label: "Top Branch", value: BRANCHES[1 + Math.floor(r() * 4)], delta: 0, tone: "muted" },
          ];
        case "cashflow-overview":
          return [
            { label: "Net Cash Flow", value: money(base * 0.5), delta: +(trend.toFixed(1)), tone: "primary" },
            { label: "Inflow", value: money(base * 1.4), delta: +((r() * 12 - 2).toFixed(1)), tone: "success" },
            { label: "Outflow", value: money(base * 0.9), delta: +((r() * 12 - 2).toFixed(1)), tone: "warning" },
            { label: "7-Day Forecast", value: money(base * 0.35), delta: +((r() * 8 - 2).toFixed(1)), tone: "muted" },
          ];
        case "risk-overview":
          return [
            { label: "Defaulters", value: num(Math.floor(orders * 0.12)), delta: +(trend.toFixed(1)), tone: "warning" },
            { label: "Write-offs", value: money(base * 0.05), delta: -+((r() * 6).toFixed(1)), tone: "primary" },
            { label: "Legal Cases", value: num(Math.floor(orders * 0.04)), delta: +((r() * 4).toFixed(1)), tone: "muted" },
            { label: "Recovery %", value: `${(72 + r() * 18).toFixed(1)}%`, delta: +((r() * 6 - 2).toFixed(1)), tone: "success" },
          ];
        case "tax-overview":
          return [
            { label: "GST Collected", value: money(base * 0.17), delta: +(trend.toFixed(1)), tone: "primary" },
            { label: "Withholding", value: money(base * 0.04), delta: +((r() * 6 - 2).toFixed(1)), tone: "success" },
            { label: "FBR Submitted", value: "On Time", delta: 0, tone: "success" },
            { label: "Pending Returns", value: num(Math.floor(r() * 4)), delta: 0, tone: "warning" },
          ];
      }
      return [
        { label: "Revenue", value: money(base), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "Orders", value: num(orders), delta: +((r() * 12 - 2).toFixed(1)), tone: "success" },
        { label: "Margin %", value: `${(18 + r() * 14).toFixed(1)}%`, delta: +((r() * 4 - 2).toFixed(1)), tone: "warning" },
        { label: "Avg Ticket", value: money(avg), delta: +((r() * 6 - 2).toFixed(1)), tone: "muted" },
      ];
    }
    default:
      return [
        { label: "Total", value: num(orders * 3), delta: +(trend.toFixed(1)), tone: "primary" },
        { label: "This Period", value: num(orders), delta: +((r() * 12 - 2).toFixed(1)), tone: "success" },
        { label: "Variance", value: `${(r() * 12 - 4).toFixed(1)}%`, delta: +((r() * 4 - 2).toFixed(1)), tone: "warning" },
        { label: "Avg", value: num(avg), delta: +((r() * 6 - 2).toFixed(1)), tone: "muted" },
      ];
  }
}

const SAMPLE_PRODUCTS = ["Samsung A55", "Gree 1.5T Inverter AC", "Haier Refrigerator", "Dawlance Microwave", "LG 55\" 4K TV", "Honda CD 70", "Sony Headphones", "Apple iPhone 15", "Toshiba Washing Machine", "Phillips Iron"];
const SAMPLE_CUSTOMERS = ["Ahmed Raza", "Sara Khan", "Bilal Hussain", "Aisha Malik", "Usman Ali", "Hina Tariq", "Faisal Iqbal", "Mehwish Akhtar", "Omar Sheikh", "Zainab Mir"];
const SAMPLE_SUPPLIERS = ["Gree Pakistan", "Haier Distributors", "Samsung PK", "Dawlance Ltd.", "LG Electronics", "PEL Distribution"];
const SAMPLE_AGENTS = ["Talha Ahmed", "Imran Yousaf", "Nasir Khan", "Adeel Bhatti", "Saqib Mehmood"];

function buildTable(moduleId: string, report: Report): { columns: Col[]; rows: Row[] } {
  const r = rng(seedFrom(moduleId + report.id + "table"));
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const dateAt = (i: number) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  };

  switch (moduleId) {
    case "sales": {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "ref", label: "Invoice", tone: "muted" },
        { key: "customer", label: "Customer" },
        { key: "branch", label: "Branch" },
        { key: "items", label: "Items", align: "right", tone: "qty" },
        { key: "amount", label: "Amount", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        ref: `INV-${9000 + Math.floor(r() * 999)}`,
        customer: pick(SAMPLE_CUSTOMERS),
        branch: pick(BRANCHES.slice(1)),
        items: Math.floor(r() * 8) + 1,
        amount: money(Math.floor(r() * 280000) + 15000),
        status: pick(["Paid", "Partial", "Pending"]),
      }));
      return { columns, rows };
    }
    case "purchases": {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "ref", label: "PO #", tone: "muted" },
        { key: "supplier", label: "Supplier" },
        { key: "items", label: "Items", align: "right", tone: "qty" },
        { key: "amount", label: "Amount", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        ref: `PO-${2200 + Math.floor(r() * 800)}`,
        supplier: pick(SAMPLE_SUPPLIERS),
        items: Math.floor(r() * 18) + 2,
        amount: money(Math.floor(r() * 1_400_000) + 80_000),
        status: pick(["Open", "Partial", "Closed", "Closed"]),
      }));
      return { columns, rows };
    }
    case "inventory": {
      const columns: Col[] = [
        { key: "sku", label: "SKU", tone: "muted" },
        { key: "product", label: "Product" },
        { key: "warehouse", label: "Warehouse" },
        { key: "onHand", label: "On Hand", align: "right", tone: "qty" },
        { key: "reorder", label: "Reorder", align: "right", tone: "qty" },
        { key: "value", label: "Stock Value", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map(() => {
        const onHand = Math.floor(r() * 80);
        const reorder = Math.floor(r() * 30) + 5;
        return {
          sku: `SKU-${1000 + Math.floor(r() * 9000)}`,
          product: pick(SAMPLE_PRODUCTS),
          warehouse: pick(["Main WH", "Gulberg WH", "DHA WH", "Karachi WH"]),
          onHand,
          reorder,
          value: money(onHand * (Math.floor(r() * 50000) + 5000)),
          status: onHand === 0 ? "Out" : onHand < reorder ? "Low" : "OK",
        };
      });
      return { columns, rows };
    }
    case "installments": {
      const columns: Col[] = [
        { key: "plan", label: "Plan #", tone: "muted" },
        { key: "customer", label: "Customer" },
        { key: "product", label: "Product" },
        { key: "due", label: "Next Due" },
        { key: "emi", label: "EMI", align: "right", tone: "money" },
        { key: "balance", label: "Balance", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        plan: `HP-${3300 + Math.floor(r() * 700)}`,
        customer: pick(SAMPLE_CUSTOMERS),
        product: pick(SAMPLE_PRODUCTS),
        due: dateAt(-(Math.floor(r() * 14))),
        emi: money(Math.floor(r() * 18000) + 4000),
        balance: money(Math.floor(r() * 220000) + 20000),
        status: pick(["Current", "Current", "Overdue", "Closed"]),
      }));
      return { columns, rows };
    }
    case "recovery": {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "agent", label: "Agent" },
        { key: "customer", label: "Customer" },
        { key: "branch", label: "Branch" },
        { key: "collected", label: "Collected", align: "right", tone: "money" },
        { key: "outcome", label: "Outcome", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        agent: pick(SAMPLE_AGENTS),
        customer: pick(SAMPLE_CUSTOMERS),
        branch: pick(BRANCHES.slice(1)),
        collected: money(Math.floor(r() * 95000) + 5000),
        outcome: pick(["Paid", "PTP", "No Contact", "Visited"]),
      }));
      return { columns, rows };
    }
    case "finance": {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "voucher", label: "Voucher", tone: "muted" },
        { key: "account", label: "Account" },
        { key: "narration", label: "Narration" },
        { key: "debit", label: "Debit", align: "right", tone: "money" },
        { key: "credit", label: "Credit", align: "right", tone: "money" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => {
        const isDr = r() > 0.5;
        const amt = Math.floor(r() * 320000) + 5000;
        return {
          date: dateAt(i),
          voucher: `JV-${500 + Math.floor(r() * 500)}`,
          account: pick(["Sales", "Cash in Hand", "Bank — HBL", "Receivables", "Salaries", "Rent"]),
          narration: pick(["Sale receipt", "Bank deposit", "Vendor payment", "Salary expense", "EMI receipt"]),
          debit: isDr ? money(amt) : "—",
          credit: isDr ? "—" : money(amt),
        };
      });
      return { columns, rows };
    }
    case "hr": {
      const columns: Col[] = [
        { key: "emp", label: "Employee #", tone: "muted" },
        { key: "name", label: "Name" },
        { key: "dept", label: "Department" },
        { key: "branch", label: "Branch" },
        { key: "metric", label: "Metric", align: "right", tone: "qty" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map(() => ({
        emp: `EMP-${1000 + Math.floor(r() * 900)}`,
        name: pick(SAMPLE_CUSTOMERS),
        dept: pick(["Sales", "Recovery", "Operations", "Finance", "Warehouse"]),
        branch: pick(BRANCHES.slice(1)),
        metric: Math.floor(r() * 100),
        status: pick(["Present", "Present", "Leave", "Late"]),
      }));
      return { columns, rows };
    }
    case "customers": {
      const columns: Col[] = [
        { key: "id", label: "Customer #", tone: "muted" },
        { key: "name", label: "Name" },
        { key: "cnic", label: "CNIC" },
        { key: "branch", label: "Branch" },
        { key: "plans", label: "Plans", align: "right", tone: "qty" },
        { key: "balance", label: "Balance", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map(() => ({
        id: `CUS-${5000 + Math.floor(r() * 4000)}`,
        name: pick(SAMPLE_CUSTOMERS),
        cnic: `35202-${Math.floor(r() * 9000000 + 1000000)}-${Math.floor(r() * 9 + 1)}`,
        branch: pick(BRANCHES.slice(1)),
        plans: Math.floor(r() * 4) + 1,
        balance: money(Math.floor(r() * 280000) + 5000),
        status: pick(["Active", "Active", "KYC Pending", "Blacklisted"]),
      }));
      return { columns, rows };
    }
    case "logistics": {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "trip", label: "Trip #", tone: "muted" },
        { key: "vehicle", label: "Vehicle" },
        { key: "driver", label: "Driver" },
        { key: "drops", label: "Drops", align: "right", tone: "qty" },
        { key: "fuel", label: "Fuel", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        trip: `TRP-${800 + Math.floor(r() * 200)}`,
        vehicle: pick(["LEA-2204", "LEB-9080", "LXP-1133", "LEH-5511"]),
        driver: pick(SAMPLE_AGENTS),
        drops: Math.floor(r() * 14) + 2,
        fuel: money(Math.floor(r() * 14000) + 2000),
        status: pick(["Completed", "Completed", "In-Transit", "Delayed"]),
      }));
      return { columns, rows };
    }
    case "audit": {
      const columns: Col[] = [
        { key: "ts", label: "Timestamp" },
        { key: "user", label: "User" },
        { key: "action", label: "Action" },
        { key: "entity", label: "Entity", tone: "muted" },
        { key: "ip", label: "IP" },
        { key: "severity", label: "Severity", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        ts: `${dateAt(i)} ${String(Math.floor(r() * 24)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
        user: pick(SAMPLE_AGENTS),
        action: pick(["LOGIN", "UPDATE", "DELETE", "EXPORT", "APPROVE"]),
        entity: pick(["Invoice", "Customer", "Product", "Plan", "Payment"]),
        ip: `10.0.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
        severity: pick(["Info", "Info", "Warn", "Critical"]),
      }));
      return { columns, rows };
    }
    case "overview": {
      if (report.id === "branch-comparison") {
        const columns: Col[] = [
          { key: "branch", label: "Branch" },
          { key: "invoices", label: "Invoices", align: "right", tone: "qty" },
          { key: "sales", label: "Sales", align: "right", tone: "money" },
          { key: "collections", label: "Collections", align: "right", tone: "money" },
          { key: "stock", label: "Stock Value", align: "right", tone: "money" },
          { key: "variance", label: "vs Target", align: "right" },
          { key: "status", label: "Status", tone: "status" },
        ];
        const rows: Row[] = BRANCHES.slice(1).map((b) => {
          const invoices = Math.floor(r() * 320) + 40;
          const sales = Math.floor(r() * 8_000_000) + 800_000;
          const collections = Math.floor(sales * (0.6 + r() * 0.35));
          const stock = Math.floor(r() * 12_000_000) + 1_500_000;
          const variance = +((r() * 30 - 10).toFixed(1));
          return {
            branch: b,
            invoices,
            sales: money(sales),
            collections: money(collections),
            stock: money(stock),
            variance: `${variance >= 0 ? "+" : ""}${variance}%`,
            status: variance >= 5 ? "On Track" : variance >= -2 ? "Review" : "Overdue",
          };
        });
        return { columns, rows };
      }
      if (report.id === "cashflow-overview") {
        const columns: Col[] = [
          { key: "date", label: "Date" },
          { key: "category", label: "Category" },
          { key: "inflow", label: "Inflow", align: "right", tone: "money" },
          { key: "outflow", label: "Outflow", align: "right", tone: "money" },
          { key: "net", label: "Net", align: "right", tone: "money" },
        ];
        const rows: Row[] = Array.from({ length: 12 }).map((_, i) => {
          const inf = Math.floor(r() * 800_000) + 50_000;
          const out = Math.floor(r() * 600_000) + 30_000;
          return {
            date: dateAt(i),
            category: pick(["Sales", "EMI Receipts", "Vendor Payment", "Salaries", "Rent", "Utilities"]),
            inflow: money(inf),
            outflow: money(out),
            net: money(inf - out),
          };
        });
        return { columns, rows };
      }
      // fallthrough default for other overview reports
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "ref", label: "Reference", tone: "muted" },
        { key: "subject", label: "Subject" },
        { key: "value", label: "Value", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        ref: `REF-${100 + Math.floor(r() * 900)}`,
        subject: pick(["GST Return", "WHT Filing", "Defaulter Notice", "Legal Escalation", "Write-off"]),
        value: money(Math.floor(r() * 200000) + 5000),
        status: pick(["Submitted", "Pending", "Review"]),
      }));
      return { columns, rows };
    }
    default: {
      const columns: Col[] = [
        { key: "date", label: "Date" },
        { key: "ref", label: "Reference", tone: "muted" },
        { key: "subject", label: "Subject" },
        { key: "value", label: "Value", align: "right", tone: "money" },
        { key: "status", label: "Status", tone: "status" },
      ];
      const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
        date: dateAt(i),
        ref: `REF-${100 + Math.floor(r() * 900)}`,
        subject: pick(SAMPLE_PRODUCTS),
        value: money(Math.floor(r() * 200000) + 5000),
        status: pick(["OK", "Pending", "Review"]),
      }));
      return { columns, rows };
    }
  }
}

function statusTone(s: string): string {
  const v = s.toLowerCase();
  if (["paid", "closed", "completed", "ok", "current", "active", "present", "info"].some((k) => v.includes(k)))
    return "bg-success/15 text-success border border-success/20";
  if (["pending", "partial", "open", "review", "ptp", "in-transit", "leave", "kyc"].some((k) => v.includes(k)))
    return "bg-warning/15 text-warning border border-warning/20";
  if (["overdue", "delayed", "critical", "blacklisted", "out", "low", "no contact"].some((k) => v.includes(k)))
    return "bg-destructive/10 text-destructive border border-destructive/20";
  return "bg-muted text-muted-foreground border border-border";
}

function ReportPreviewPage() {
  const { moduleId, reportId } = Route.useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const moduleDef: ModuleTab | undefined = MODULES.find((m) => m.id === moduleId);
  const report: Report | undefined = moduleDef?.reports.find((r) => r.id === reportId);

  const [favorites, setFavorites] = usePersistentState<string[]>(
    "qcrm.report-favorites",
    [],
    (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );
  const favKey = `${moduleId}:${reportId}`;
  const isFav = favorites.includes(favKey);
  const toggleFav = () =>
    setFavorites(isFav ? favorites.filter((x) => x !== favKey) : [...favorites, favKey]);

  const [branch, setBranch] = useState(BRANCHES[0]);
  const [period, setPeriod] = useState(PERIODS[3]);
  const [search, setSearch] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const schedulesStore = useEntityStore<ReportSchedule>("qcrm.report-schedules", []);
  const scheduleCount = schedulesStore.items.filter((s) => s.moduleId === moduleId && s.reportId === reportId).length;

  if (!moduleDef || !report) {
    return (
      <AppShell>
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <h2 className="font-bold text-lg">Report not found</h2>
          <p className="text-sm text-muted-foreground mt-1">The report you're looking for doesn't exist.</p>
          <Link to="/reports" className="mt-4 inline-flex h-9 px-4 items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Link>
        </div>
      </AppShell>
    );
  }

  const Icon = moduleDef.icon;
  const kpis = useMemo(() => buildKpis(moduleId, report), [moduleId, report, refreshTick]);
  const { columns, rows } = useMemo(() => buildTable(moduleId, report), [moduleId, report, refreshTick]);

  // Trend series for chart
  const series = useMemo(() => {
    const r = rng(seedFrom(moduleId + reportId + "chart" + refreshTick));
    return Array.from({ length: 14 }).map(() => Math.floor(r() * 80) + 20);
  }, [moduleId, reportId, refreshTick]);
  const max = Math.max(...series);
  const min = Math.min(...series);

  // Breakdown segments
  const breakdown = useMemo(() => {
    const r = rng(seedFrom(moduleId + reportId + "br"));
    const labels = moduleId === "sales" ? ["Cash", "Card", "Installment", "Online"]
      : moduleId === "inventory" ? ["Main WH", "Gulberg", "DHA", "Karachi"]
      : moduleId === "purchases" ? ["Gree", "Haier", "Samsung", "Dawlance"]
      : moduleId === "overview" ? BRANCHES.slice(1, 5)
      : ["Segment A", "Segment B", "Segment C", "Segment D"];
    const raw = labels.map(() => Math.floor(r() * 100) + 20);
    const total = raw.reduce((a, b) => a + b, 0);
    return labels.map((l, i) => ({ label: l, pct: Math.round((raw[i] / total) * 100) }));
  }, [moduleId, reportId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const exportAs = (kind: "CSV" | "Excel" | "PDF") => {
    toast.success(`${kind} export queued`, `${report.name} — ${period}, ${branch}`);
  };

  return (
    <AppShell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
        <Link to="/reports" className="hover:text-foreground">Reports</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/reports" search={{ tab: moduleId } as any} className="hover:text-foreground">{moduleDef.label}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold">{report.name}</span>
      </nav>

      {/* Single-row toolbar: filters + actions */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 pl-8 pr-7 appearance-none rounded-md border border-border bg-background text-[12px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            {PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="h-9 pl-8 pr-7 appearance-none rounded-md border border-border bg-background text-[12px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-semibold text-muted-foreground hover:bg-muted">
          <Filter className="h-3.5 w-3.5" /> More filters
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within report…"
            className="h-9 w-56 pl-8 pr-3 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          <button
            onClick={toggleFav}
            title={isFav ? "Unpin" : "Pin to favorites"}
            className={`h-9 w-9 grid place-items-center rounded-md border transition ${
              isFav ? "bg-warning/10 border-warning/30 text-warning" : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Star className={`h-4 w-4 ${isFav ? "fill-warning" : ""}`} />
          </button>
          <button
            onClick={() => { setRefreshTick((t) => t + 1); toast.success("Refreshed", report.name); }}
            title="Refresh"
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-muted text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.print()}
            title="Print"
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-muted text-muted-foreground"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={() => setScheduleOpen(true)}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border hover:bg-muted text-[12px] font-semibold text-foreground"
          >
            <CalendarClock className="h-4 w-4" /> Schedule
            {scheduleCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-success/15 text-success text-[10px] font-bold">{scheduleCount}</span>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30">
                <Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => exportAs("CSV")}><FileText className="h-3.5 w-3.5 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("Excel")}><FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("PDF")}><FileText className="h-3.5 w-3.5 mr-2" /> PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success("Share link copied", report.name)}>
                <Share2 className="h-3.5 w-3.5 mr-2" /> Copy share link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <span className={`h-7 w-7 grid place-items-center rounded-md ${
                k.tone === "primary" ? "bg-primary/10 text-primary" :
                k.tone === "success" ? "bg-success/15 text-success" :
                k.tone === "warning" ? "bg-warning/15 text-warning" :
                "bg-muted text-muted-foreground"
              }`}>
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{k.value}</div>
            {k.delta !== 0 && (
              <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold ${k.delta >= 0 ? "text-success" : "text-destructive"}`}>
                {k.delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                {Math.abs(k.delta)}% <span className="text-muted-foreground font-medium">vs prev period</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground text-[14px]">Trend</h3>
              <p className="text-[11px] text-muted-foreground">Last 14 periods</p>
            </div>
            <button title="Expand" className="h-7 w-7 grid place-items-center rounded-md border border-border hover:bg-muted text-muted-foreground">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-48">
            <svg viewBox="0 0 560 180" className="w-full h-full text-primary" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((p) => (
                <line key={p} x1="0" x2="560" y1={180 * p} y2={180 * p} stroke="currentColor" className="text-border" strokeDasharray="3 3" />
              ))}
              {(() => {
                const pts = series.map((v, i) => {
                  const x = (i / (series.length - 1)) * 560;
                  const y = 180 - ((v - min) / Math.max(max - min, 1)) * 160 - 10;
                  return { x, y };
                });
                const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                const area = `${line} L560,180 L0,180 Z`;
                return (
                  <>
                    <path d={area} fill="url(#rp-area)" />
                    <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-bold text-foreground text-[14px] mb-3">Breakdown</h3>
          <ul className="space-y-3">
            {breakdown.map((b, i) => (
              <li key={b.label}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-semibold text-foreground">{b.label}</span>
                  <span className="font-bold tabular-nums text-muted-foreground">{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      i === 0 ? "bg-primary" : i === 1 ? "bg-success" : i === 2 ? "bg-warning" : "bg-info"
                    }`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-[14px]">Records</h3>
            <span className="text-[11px] text-muted-foreground">{filteredRows.length} of {rows.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-7 px-2 inline-flex items-center gap-1 rounded-md border border-border text-[11px] font-semibold text-muted-foreground hover:bg-muted">
              <Eye className="h-3 w-3" /> Columns
            </button>
            <button className="h-7 w-7 grid place-items-center rounded-md border border-border hover:bg-muted text-muted-foreground">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 font-bold ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  {columns.map((c) => {
                    const v = row[c.key];
                    if (c.tone === "status") {
                      return (
                        <td key={c.key} className="px-4 py-2.5">
                          <span className={`inline-flex h-5 px-2 py-0.5 rounded text-[10.5px] font-bold ${statusTone(String(v))}`}>
                            {String(v)}
                          </span>
                        </td>
                      );
                    }
                    if (c.tone === "muted") {
                      return <td key={c.key} className="px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">{String(v)}</td>;
                    }
                    if (c.tone === "money" || c.tone === "qty") {
                      return <td key={c.key} className={`px-4 py-2.5 tabular-nums font-semibold text-foreground ${c.align === "right" ? "text-right" : ""}`}>{String(v)}</td>;
                    }
                    return <td key={c.key} className={`px-4 py-2.5 text-foreground ${c.align === "right" ? "text-right" : ""}`}>{String(v)}</td>;
                  })}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={columns.length} className="text-center py-12 text-muted-foreground text-sm">No records match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span>Showing 1–{filteredRows.length} of {rows.length}</span>
          <div className="flex items-center gap-1">
            <button className="h-7 px-2 rounded-md border border-border hover:bg-muted">Prev</button>
            <span className="px-2 font-semibold">1 / 1</span>
            <button className="h-7 px-2 rounded-md border border-border hover:bg-muted">Next</button>
          </div>
        </div>
      </div>

      {scheduleOpen && (
        <Suspense fallback={null}>
          <ScheduleDialog
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            onSave={(data) => {
              schedulesStore.create(data);
              toast.success("Schedule created", `${data.reportName} will be delivered ${data.frequency.toLowerCase()} at ${data.time}.`);
            }}
            reportId={report.id}
            reportName={report.name}
            moduleId={moduleDef.id}
            moduleLabel={moduleDef.label}
            defaultBranch={branch}
            defaultPeriod={period}
          />
        </Suspense>
      )}
    </AppShell>
  );
}
