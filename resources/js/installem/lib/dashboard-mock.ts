// Dashboard mock data, realigned to match the modules/pages that exist in
// this app: Contracts funnel, Installments (Active/Today/Overdue), Recovery
// (Agents/Daily/Shortfalls), Sales (targets/invoices), Purchases (GRN/POs),
// Inventory (low stock), Accounts (receipts/payments-made, cash & bank),
// HR (attendance), Support (HP cases).
//
// Numbers are deliberately tuned so the dashboard tells the same story as
// the seeded entity pages — labels, statuses and bucket names mirror
// src/lib/entities.tsx, src/lib/sales-mock.ts and src/lib/ops-mock.ts.

export const BRANCHES = ["All Branches", "Model Town", "Gulberg", "DHA 5", "Johar Town"] as const;
export type BranchKey = typeof BRANCHES[number];

// ── Contracts funnel (mirrors /contracts/under-process → /approved)
export const contractsFunnel = [
  { label: "Under Process",      value: 84 },
  { label: "Under Verification", value: 62 },
  { label: "Under Approval",     value: 41 },
  { label: "Approved",           value: 28 },
];

// ── Installment portfolio (mirrors installmentsActive/Today/Overdue configs)
export const portfolioBuckets: { name: "On Track" | "Due Soon" | "Overdue"; value: number; outstanding: number; hint: string }[] = [
  { name: "On Track", value: 842, outstanding: 38_400_000, hint: "No overdue EMI" },
  { name: "Due Soon", value: 186, outstanding: 12_750_000, hint: "EMI due within 7 days" },
  { name: "Overdue",  value:  64, outstanding:  8_920_000, hint: "30+ days past due" },
];

// ── DPD aging (matches Payments / Installments overdue buckets)
export const dpdAging = [
  { bucket: "Current", accounts: 842, outstanding: 38_400_000 },
  { bucket: "1-30",    accounts: 124, outstanding:  9_650_000 },
  { bucket: "31-60",   accounts:  62, outstanding:  5_120_000 },
  { bucket: "61-90",   accounts:  38, outstanding:  3_280_000 },
  { bucket: "90+",     accounts:  26, outstanding:  5_640_000 },
];

// ── Today's collections — branch's day, by hour (matches /installments/today)
export const todaysCollectionsByHour = [
  { h: "9a",  collected:  18_400, target:  25_000 },
  { h: "10a", collected:  46_200, target:  35_000 },
  { h: "11a", collected:  61_800, target:  45_000 },
  { h: "12p", collected:  38_500, target:  40_000 },
  { h: "1p",  collected:  21_900, target:  30_000 },
  { h: "2p",  collected:  52_400, target:  45_000 },
  { h: "3p",  collected:  68_700, target:  55_000 },
  { h: "4p",  collected:  74_200, target:  60_000 },
  { h: "5p",  collected:  41_300, target:  45_000 },
  { h: "6p",  collected:  12_600, target:  20_000 },
];

// ── 6-month collection efficiency vs NPA (drives the line chart)
export const collectionEfficiency = [
  { m: "Jan", efficiency: 88, npa: 4.2 },
  { m: "Feb", efficiency: 90, npa: 3.9 },
  { m: "Mar", efficiency: 86, npa: 4.6 },
  { m: "Apr", efficiency: 91, npa: 3.7 },
  { m: "May", efficiency: 93, npa: 3.4 },
  { m: "Jun", efficiency: 92, npa: 3.5 },
];

// ── Cash position: receipts (from /payments-received) vs payments-made (/purchases/payments)
export const cashFlow7d = [
  { d: "Mon", receipts: 412_000, paymentsMade: 268_000 },
  { d: "Tue", receipts: 538_000, paymentsMade: 192_000 },
  { d: "Wed", receipts: 471_000, paymentsMade: 340_000 },
  { d: "Thu", receipts: 612_000, paymentsMade: 280_000 },
  { d: "Fri", receipts: 695_000, paymentsMade: 410_000 },
  { d: "Sat", receipts: 502_000, paymentsMade: 188_000 },
  { d: "Sun", receipts: 312_000, paymentsMade:  96_000 },
];

// ── Cash & Bank snapshot (matches /accounts/cash-bank)
export const cashAndBank = [
  { name: "Cash in Hand · Tills",  value: 1_840_000, tone: "primary" as const },
  { name: "HBL · Current 0123",    value: 3_120_000, tone: "info"    as const },
  { name: "Meezan · Current 9981", value: 1_460_000, tone: "success" as const },
];

// ── Branch sales targets (matches /sales/targets)
export const branchTargets = [
  { name: "Model Town", achieved: 4_280_000, target: 5_000_000 },
  { name: "Gulberg",    achieved: 3_120_000, target: 3_500_000 },
  { name: "DHA 5",      achieved: 2_640_000, target: 4_000_000 },
  { name: "Johar Town", achieved: 1_980_000, target: 2_000_000 },
];

// Sales mix (Cash vs Installment) — matches SALE_TYPES in sales-mock
export const salesMix = [
  { name: "Installment", value: 78 },
  { name: "Cash",        value: 22 },
];

// New contracts booked + avg ticket (last 7 days)
export const newContracts7d = [
  { d: "Mon", contracts: 14, avgTicket: 42_000 },
  { d: "Tue", contracts: 18, avgTicket: 38_000 },
  { d: "Wed", contracts: 12, avgTicket: 51_000 },
  { d: "Thu", contracts: 22, avgTicket: 44_000 },
  { d: "Fri", contracts: 27, avgTicket: 47_000 },
  { d: "Sat", contracts: 21, avgTicket: 39_000 },
  { d: "Sun", contracts: 11, avgTicket: 36_000 },
];

// ── Recovery agent leaderboard (matches /recovery/agents + /recovery/daily)
export const recoveryAgents = [
  { name: "Sana Khan",   assigned: 42, recovered: 31, amount: 384_500 },
  { name: "Bilal Ahmed", assigned: 38, recovered: 26, amount: 312_200 },
  { name: "Hassan Ali",  assigned: 35, recovered: 21, amount: 248_900 },
  { name: "Maryam Iqbal",assigned: 28, recovered: 19, amount: 196_400 },
];

// ── Operations pulse — counts that live on real module pages
export const opsPulse = {
  lowStock:        14,  // /inventory/low-stock
  pendingGrn:       6,  // /purchases/grn
  pendingPo:        9,  // /purchases/orders
  deliveriesToday: 11,  // /logistics/deliveries
  hpCasesOpen:      7,  // /support/hp-cases
  ticketsOpen:     12,  // /support/tickets
  attendancePct:   92,  // /hr/attendance
  presentCount:    46,
  headcount:       50,
};

// ── Drilldown accounts for the Risk Breakdown table (mirrors columns on
//    installments/overdue and customers pages)
export type RiskBucket = "On Track" | "Due Soon" | "Overdue";
export const riskAccounts: {
  id: string; customer: string; phone: string;
  bucket: RiskBucket; dueDate: string; outstanding: number; daysOverdue: number;
}[] = [
  { id: "AC-1042", customer: "Ali Raza",       phone: "0301-1234567", bucket: "Overdue",  dueDate: "2026-04-05", outstanding: 142_500, daysOverdue: 36 },
  { id: "AC-1108", customer: "Hira Tariq",     phone: "0322-7654321", bucket: "Overdue",  dueDate: "2026-03-28", outstanding:  98_700, daysOverdue: 44 },
  { id: "AC-1190", customer: "Nida Aslam",     phone: "0333-9988776", bucket: "Overdue",  dueDate: "2026-03-15", outstanding: 215_300, daysOverdue: 57 },
  { id: "AC-1305", customer: "Sara Khan",      phone: "0300-5566778", bucket: "Due Soon", dueDate: "2026-05-14", outstanding:  48_900, daysOverdue: -3 },
  { id: "AC-1322", customer: "Ahmed Yar",      phone: "0312-4433221", bucket: "Due Soon", dueDate: "2026-05-16", outstanding:  62_100, daysOverdue: -5 },
  { id: "AC-1501", customer: "Imran Sheikh",   phone: "0321-2233445", bucket: "On Track", dueDate: "2026-05-28", outstanding: 124_000, daysOverdue: -17 },
];

// Recent activity — labels match modules
export const recentActivity = [
  { kind: "receipt",  who: "Bilal Khan",     detail: "Receipt · RCP-2041",      amount: 18_500, time: "10m" },
  { kind: "contract", who: "Adnan Pervaiz",  detail: "iPhone 15 Pro · 12mo",    amount: 504_000, time: "32m" },
  { kind: "delivery", who: "Fatima Noor",    detail: "DEL-2042 dispatched",     amount: 0,       time: "1h" },
  { kind: "recovery", who: "Sadia Shah",     detail: "Agent: Sana Khan",        amount: 22_400, time: "2h" },
  { kind: "hpcase",   who: "Hira Tariq",     detail: "HP case opened · HP-118", amount: 0,       time: "2h" },
  { kind: "missed",   who: "Nida Aslam",     detail: "Refused · INV-7011",      amount: 10_900, time: "3h" },
];

// Upcoming deliveries
export const upcomingDeliveries = [
  { ref: "DEL-2041", customer: "Ali Raza",      items: 2, eta: "Today, 4:30 PM",     area: "Gulberg" },
  { ref: "DEL-2042", customer: "Fatima Noor",   items: 1, eta: "Today, 6:00 PM",     area: "DHA 5" },
  { ref: "DEL-2043", customer: "Imran Sheikh",  items: 3, eta: "Tomorrow, 11:00 AM", area: "Model Town" },
];

export function fmtRs(n: number) {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}K`;
  return `Rs. ${Math.round(n).toLocaleString()}`;
}
