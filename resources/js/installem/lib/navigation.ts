import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Briefcase,
  CreditCard,
  Crown,
  FileSignature,
  HandCoins,
  LayoutDashboard,
  LifeBuoy,
  MonitorSmartphone,
  Package,
  Plug,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  BookOpen,
} from "lucide-react";

export type NavigationBadge = "new" | "beta" | "none";

export type NavigationItem = {
  label: string;
  to?: string;
  icon: LucideIcon;
  badge?: number;
  statusBadge?: NavigationBadge;
  search?: Record<string, string>;
  children?: NavigationChild[];
};

export type NavigationChild = {
  label: string;
  to?: string;
  badge?: number;
  statusBadge?: NavigationBadge;
  search?: Record<string, string>;
  children?: NavigationChild[];
  header?: boolean;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const NAV_SECTIONS: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Reports", to: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Customers",
        icon: Users,
        children: [
          { label: "All Customers", to: "/customers" },
          { label: "Active Customers", to: "/customers/active" },
          { label: "Guarantors", to: "/customers/guarantors" },
          { label: "Blacklist", to: "/customers/blacklist" },
        ],
      },
      {
        label: "Contracts",
        icon: FileSignature,
        children: [
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
      },
      {
        label: "Payments",
        icon: Wallet,
        children: [
          { label: "Payments Received", to: "/payments-received" },
          { label: "Due Today", to: "/payments/due-today" },
          { label: "Due in 3 Days", to: "/payments/due-3-days" },
          { label: "Due in 7 Days", to: "/payments/due-7-days" },
          { label: "Due till Closing", to: "/payments/due-closing" },
        ],
      },
      { label: "Gate Pass", to: "/sales/gate-pass", icon: ShieldCheck },
      { label: "Delivery Challan", to: "/logistics/deliveries", icon: Truck },
      { label: "Invoices", to: "/sales/invoices", icon: FileSignature },
      { label: "Bike Registration", to: "/sales/bike-registration", icon: MonitorSmartphone },
      { label: "Sales Return", to: "/sales/returns", icon: ShoppingBag },
    ],
  },
  {
    title: "Purchases",
    items: [
      {
        label: "Product Catalog",
        icon: Package,
        children: [
          { label: "Brands", to: "/catalog/brands" },
          { label: "Categories", to: "/catalog/categories" },
          { label: "Products", to: "/catalog/products" },
          { label: "Image Gallery", to: "/catalog/gallery" },
        ],
      },
      {
        label: "Inventory",
        icon: Boxes,
        children: [
          { label: "Stock Operations", to: "/inventory/stock-ops" },
          { label: "Warehouses", to: "/inventory/warehouses" },
          { label: "Stock", to: "/inventory/stock-center", search: { tab: "opening" } },
          { label: "Barcode Labels", to: "/inventory/barcodes" },
        ],
      },
      { label: "Suppliers", to: "/purchases/suppliers", icon: Truck },
      { label: "Purchase Orders", to: "/purchases/orders", icon: ShoppingCart },
      { label: "Goods Receipt Note", to: "/purchases/grn", icon: Package },
      { label: "Purchase Returns", to: "/purchases/returns", icon: ShoppingBag },
      { label: "Bills / Invoices", to: "/purchases/bills", icon: FileSignature },
      { label: "Payments Made", to: "/purchases/payments", icon: Wallet },
      { label: "Expenses", to: "/purchases/expenses", icon: CreditCard },
    ],
  },
  {
    title: "Accounts",
    items: [
      { label: "Chart of Accounts", to: "/accounts/coa", icon: FileSignature },
      { label: "Tax Center", to: "/accounts/tax-center", icon: Wallet },
      { label: "Financial Statements", to: "/accounts/financial-statements", icon: BarChart3 },
      { label: "Audit Trail", to: "/accounts/audit-trail", icon: BookOpen },
      { label: "Transaction Locking", to: "/accounts/transaction-locking", icon: ShieldCheck },
    ],
  },
  {
    title: "Workforce",
    items: [
      {
        label: "HR Management",
        icon: Briefcase,
        children: [
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
      },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Subscription Plan", to: "/platforms/subscription", icon: Crown },
      { label: "Installment Plans", to: "/installments/plans", icon: CreditCard },
      {
        label: "Support",
        icon: LifeBuoy,
        children: [
          { label: "HP Cases", to: "/support/hp-cases" },
          { label: "Support Tickets", to: "/support/tickets" },
          { label: "Customer Complaints", to: "/support/complaints" },
          { label: "Warranty Claims", to: "/support/warranty" },
        ],
      },
      {
        label: "User Access Control",
        icon: ShieldCheck,
        children: [
          { label: "Audit Logs", to: "/audit-logs" },
          { label: "User Accounts", to: "/security/user-access" },
        ],
      },
      { label: "Integration Hub", to: "/settings/integrations", icon: Plug },
      {
        label: "Settings",
        icon: Settings,
        children: [
          { label: "Branches", to: "/branches" },
          { label: "Master Settings", to: "/settings/master" },
        ],
      },
    ],
  },
];
