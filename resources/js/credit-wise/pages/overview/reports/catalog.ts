import {
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  HandCoins,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import type { ModuleTab, Report } from "./types";

export const REPORT_ROUTES: Record<string, Record<string, string>> = {
  inventory: {
    "item-ledger": "/inventory/reports/item-ledger",
    "stock-movement": "/inventory/reports/stock-movement",
  },
};

export const BRANCHES = ["All Branches", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"];
export const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom Range"];
export const PREVIEW_PERIODS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Last 90 Days", "This Quarter", "Custom Range"];
export const WAREHOUSES = ["All Warehouses", "Main WH — Lahore", "Gulberg WH", "DHA WH", "Karachi WH", "Islamabad WH"];
export const PRODUCTS = ["All Products", "Samsung A55", "iPhone 15", "Haier AC 1.5T", "Dawlance Fridge", "LG TV 55\"", "Honda 125"];
export const REPORT_ROLES = ["Owner", "Admin", "Branch Manager", "Inventory Officer", "Sales Officer", "Viewer"] as const;

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

export function findReport(moduleId: string, reportId: string): { module?: ModuleTab; report?: Report } {
  const module = MODULES.find((item) => item.id === moduleId);
  const report = module?.reports.find((item) => item.id === reportId);

  return { module, report };
}
