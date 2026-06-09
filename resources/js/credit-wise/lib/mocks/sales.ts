// Shared mock data for the Sales drilldown pages.
// Kept in a separate module so both invoices + collections share the same
// universe of customers/branches and the numbers stay internally consistent.

export const BRANCHES = ["Model Town", "Gulberg", "DHA 5", "Johar Town"] as const;
export type Branch = (typeof BRANCHES)[number];

export const SALE_TYPES = ["Cash", "Installment"] as const;
export type SaleType = (typeof SALE_TYPES)[number];

export const INVOICE_STATUSES = ["Paid", "Partially Paid", "Overdue", "Void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Per-customer installment-pool status (only meaningful for installment sales).
export const INSTALLMENT_STATUSES = ["On Track", "Due Soon", "Overdue", "Closed"] as const;
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];

export const COLLECTION_METHODS = ["Cash", "Bank Transfer", "Cheque", "Card"] as const;
export type CollectionMethod = (typeof COLLECTION_METHODS)[number];

export type Invoice = {
  id: string;
  invoice: string;
  date: string;
  customer: string;
  branch: Branch;
  salesman: string;
  type: SaleType;
  product: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  installmentStatus?: InstallmentStatus;
  tenureMonths?: number;
  monthsPaid?: number;
};

export type Collection = {
  id: string;
  receipt: string;
  date: string;
  invoice: string;
  customer: string;
  branch: Branch;
  agent: string;
  method: CollectionMethod;
  amount: number;
  installmentStatus?: InstallmentStatus;
};

export const INVOICES: Invoice[] = [
  { id: "1", invoice: "INV-7001", date: "2026-05-07", customer: "Imran Ali", branch: "Model Town", salesman: "Bilal", type: "Cash", product: "Samsung LED TV 55\"", amount: 149_999, paid: 149_999, status: "Paid" },
  { id: "2", invoice: "INV-7002", date: "2026-05-07", customer: "Sara Khan", branch: "Gulberg", salesman: "Usman", type: "Installment", product: "Gree 1.5 Ton AC", amount: 168_000, paid: 42_000, status: "Partially Paid", installmentStatus: "On Track", tenureMonths: 12, monthsPaid: 3 },
  { id: "3", invoice: "INV-7003", date: "2026-05-06", customer: "Ali Raza", branch: "DHA 5", salesman: "Bilal", type: "Installment", product: "iPhone 15 Pro 256GB", amount: 380_000, paid: 95_000, status: "Partially Paid", installmentStatus: "Due Soon", tenureMonths: 18, monthsPaid: 4 },
  { id: "4", invoice: "INV-7004", date: "2026-05-05", customer: "Hira Tariq", branch: "Johar Town", salesman: "Sana", type: "Installment", product: "Haier 18kg Washer", amount: 120_000, paid: 35_000, status: "Overdue", installmentStatus: "Overdue", tenureMonths: 10, monthsPaid: 2 },
  { id: "5", invoice: "INV-7005", date: "2026-05-05", customer: "Adnan Pervaiz", branch: "Model Town", salesman: "Usman", type: "Cash", product: "Sony Headphones WH-1000", amount: 78_000, paid: 78_000, status: "Paid" },
  { id: "6", invoice: "INV-7006", date: "2026-05-04", customer: "Fatima Noor", branch: "Gulberg", salesman: "Sana", type: "Installment", product: "Dawlance Inverter AC 1.5T", amount: 220_000, paid: 220_000, status: "Paid", installmentStatus: "Closed", tenureMonths: 8, monthsPaid: 8 },
  { id: "7", invoice: "INV-7007", date: "2026-05-04", customer: "Bilal Khan", branch: "DHA 5", salesman: "Bilal", type: "Installment", product: "LG Refrigerator 18cu", amount: 195_000, paid: 48_750, status: "Partially Paid", installmentStatus: "On Track", tenureMonths: 12, monthsPaid: 3 },
  { id: "8", invoice: "INV-7008", date: "2026-05-03", customer: "Sadia Shah", branch: "Johar Town", salesman: "Usman", type: "Cash", product: "Infinix Hot 40", amount: 39_999, paid: 39_999, status: "Paid" },
  { id: "9", invoice: "INV-7009", date: "2026-05-03", customer: "Imran Sheikh", branch: "Model Town", salesman: "Sana", type: "Installment", product: "Samsung 55\" QLED", amount: 210_000, paid: 0, status: "Void", installmentStatus: "Closed", tenureMonths: 12, monthsPaid: 0 },
  { id: "10", invoice: "INV-7010", date: "2026-05-02", customer: "Ahmed Yar", branch: "Gulberg", salesman: "Bilal", type: "Installment", product: "PEL Microwave 30L", amount: 58_000, paid: 14_500, status: "Partially Paid", installmentStatus: "Due Soon", tenureMonths: 6, monthsPaid: 1 },
  { id: "11", invoice: "INV-7011", date: "2026-05-02", customer: "Nida Aslam", branch: "DHA 5", salesman: "Sana", type: "Installment", product: "Orient 1.5 Ton AC", amount: 175_000, paid: 21_875, status: "Overdue", installmentStatus: "Overdue", tenureMonths: 16, monthsPaid: 1 },
  { id: "12", invoice: "INV-7012", date: "2026-05-01", customer: "Rashid Mehmood", branch: "Johar Town", salesman: "Usman", type: "Cash", product: "Vivo Y28 5G", amount: 64_500, paid: 64_500, status: "Paid" },
];

export const COLLECTIONS: Collection[] = [
  { id: "c1", receipt: "RCP-3201", date: "2026-05-08", invoice: "INV-7002", customer: "Sara Khan", branch: "Gulberg", agent: "Sana Khan", method: "Cash", amount: 14_000, installmentStatus: "On Track" },
  { id: "c2", receipt: "RCP-3202", date: "2026-05-08", invoice: "INV-7003", customer: "Ali Raza", branch: "DHA 5", agent: "Bilal Ahmed", method: "Bank Transfer", amount: 23_750, installmentStatus: "Due Soon" },
  { id: "c3", receipt: "RCP-3203", date: "2026-05-07", invoice: "INV-7007", customer: "Bilal Khan", branch: "DHA 5", agent: "Sana Khan", method: "Cash", amount: 18_500, installmentStatus: "On Track" },
  { id: "c4", receipt: "RCP-3204", date: "2026-05-07", invoice: "INV-7004", customer: "Hira Tariq", branch: "Johar Town", agent: "Usman Tariq", method: "Cheque", amount: 12_000, installmentStatus: "Overdue" },
  { id: "c5", receipt: "RCP-3205", date: "2026-05-06", invoice: "INV-7010", customer: "Ahmed Yar", branch: "Gulberg", agent: "Bilal Ahmed", method: "Card", amount: 9_700, installmentStatus: "Due Soon" },
  { id: "c6", receipt: "RCP-3206", date: "2026-05-05", invoice: "INV-7011", customer: "Nida Aslam", branch: "DHA 5", agent: "Usman Tariq", method: "Cash", amount: 7_800, installmentStatus: "Overdue" },
  { id: "c7", receipt: "RCP-3207", date: "2026-05-05", invoice: "INV-7006", customer: "Fatima Noor", branch: "Gulberg", agent: "Sana Khan", method: "Bank Transfer", amount: 27_500, installmentStatus: "Closed" },
  { id: "c8", receipt: "RCP-3208", date: "2026-05-04", invoice: "INV-7002", customer: "Sara Khan", branch: "Gulberg", agent: "Sana Khan", method: "Cash", amount: 14_000, installmentStatus: "On Track" },
  { id: "c9", receipt: "RCP-3209", date: "2026-05-04", invoice: "INV-7007", customer: "Bilal Khan", branch: "DHA 5", agent: "Sana Khan", method: "Cheque", amount: 16_250, installmentStatus: "On Track" },
  { id: "c10", receipt: "RCP-3210", date: "2026-05-03", invoice: "INV-7003", customer: "Ali Raza", branch: "DHA 5", agent: "Bilal Ahmed", method: "Cash", amount: 21_100, installmentStatus: "Due Soon" },
];

export function fmtRs(n: number) {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}
