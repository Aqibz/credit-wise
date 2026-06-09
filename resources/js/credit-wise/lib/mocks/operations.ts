// Shared mock data for the HR + Inventory drilldown pages.

export const BRANCHES = ["Model Town", "Gulberg", "DHA 5", "Johar Town"] as const;
export type Branch = (typeof BRANCHES)[number];

export const DEPARTMENTS = ["Sales", "Recovery", "Warehouse", "Accounts", "HR", "IT"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const ATTENDANCE_STATUSES = ["Present", "Late", "Absent", "Leave", "Holiday"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendanceRow = {
  id: string;
  employee: string;
  empCode: string;
  department: Department;
  branch: Branch;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hours: number;
};

export const ATTENDANCE: AttendanceRow[] = [
  { id: "a1", employee: "Bilal Ahmed", empCode: "EMP-001", department: "Sales", branch: "Model Town", date: "2026-05-09", status: "Present", checkIn: "09:02", checkOut: "18:14", hours: 9.2 },
  { id: "a2", employee: "Sana Khan", empCode: "EMP-002", department: "Recovery", branch: "Gulberg", date: "2026-05-09", status: "Late", checkIn: "10:18", checkOut: "18:30", hours: 8.2 },
  { id: "a3", employee: "Usman Tariq", empCode: "EMP-003", department: "Sales", branch: "DHA 5", date: "2026-05-09", status: "Present", checkIn: "08:55", checkOut: "18:01", hours: 9.1 },
  { id: "a4", employee: "Hira Tariq", empCode: "EMP-004", department: "Accounts", branch: "Model Town", date: "2026-05-09", status: "Leave", hours: 0 },
  { id: "a5", employee: "Adnan Pervaiz", empCode: "EMP-005", department: "Warehouse", branch: "Johar Town", date: "2026-05-09", status: "Present", checkIn: "09:10", checkOut: "18:00", hours: 8.8 },
  { id: "a6", employee: "Nida Aslam", empCode: "EMP-006", department: "HR", branch: "Gulberg", date: "2026-05-09", status: "Absent", hours: 0 },
  { id: "a7", employee: "Rashid Mehmood", empCode: "EMP-007", department: "IT", branch: "Model Town", date: "2026-05-09", status: "Present", checkIn: "09:00", checkOut: "18:20", hours: 9.3 },
  { id: "a8", employee: "Sadia Shah", empCode: "EMP-008", department: "Sales", branch: "Johar Town", date: "2026-05-09", status: "Late", checkIn: "10:45", checkOut: "18:30", hours: 7.7 },
  { id: "a9", employee: "Imran Sheikh", empCode: "EMP-009", department: "Warehouse", branch: "DHA 5", date: "2026-05-09", status: "Present", checkIn: "08:48", checkOut: "18:00", hours: 9.2 },
  { id: "a10", employee: "Fatima Noor", empCode: "EMP-010", department: "Recovery", branch: "Gulberg", date: "2026-05-09", status: "Present", checkIn: "09:05", checkOut: "18:10", hours: 9.1 },
  { id: "a11", employee: "Ahmed Yar", empCode: "EMP-011", department: "Accounts", branch: "Model Town", date: "2026-05-09", status: "Leave", hours: 0 },
  { id: "a12", employee: "Ali Raza", empCode: "EMP-012", department: "Sales", branch: "DHA 5", date: "2026-05-09", status: "Present", checkIn: "09:00", checkOut: "18:00", hours: 9.0 },
];

export const LEAVE_TYPES = ["Annual", "Sick", "Casual", "Unpaid", "Maternity"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export type LeaveRow = {
  id: string;
  employee: string;
  empCode: string;
  department: Department;
  branch: Branch;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  reason: string;
};

export const LEAVES: LeaveRow[] = [
  { id: "l1", employee: "Hira Tariq", empCode: "EMP-004", department: "Accounts", branch: "Model Town", type: "Annual", from: "2026-05-09", to: "2026-05-13", days: 5, status: "Approved", reason: "Family wedding" },
  { id: "l2", employee: "Ahmed Yar", empCode: "EMP-011", department: "Accounts", branch: "Model Town", type: "Sick", from: "2026-05-09", to: "2026-05-10", days: 2, status: "Approved", reason: "Flu" },
  { id: "l3", employee: "Sana Khan", empCode: "EMP-002", department: "Recovery", branch: "Gulberg", type: "Casual", from: "2026-05-12", to: "2026-05-12", days: 1, status: "Pending", reason: "Personal errand" },
  { id: "l4", employee: "Imran Sheikh", empCode: "EMP-009", department: "Warehouse", branch: "DHA 5", type: "Annual", from: "2026-05-15", to: "2026-05-22", days: 8, status: "Pending", reason: "Vacation" },
  { id: "l5", employee: "Fatima Noor", empCode: "EMP-010", department: "Recovery", branch: "Gulberg", type: "Maternity", from: "2026-06-01", to: "2026-09-01", days: 92, status: "Approved", reason: "Maternity leave" },
  { id: "l6", employee: "Adnan Pervaiz", empCode: "EMP-005", department: "Warehouse", branch: "Johar Town", type: "Sick", from: "2026-05-04", to: "2026-05-05", days: 2, status: "Approved", reason: "Back pain" },
  { id: "l7", employee: "Rashid Mehmood", empCode: "EMP-007", department: "IT", branch: "Model Town", type: "Unpaid", from: "2026-05-20", to: "2026-05-25", days: 6, status: "Rejected", reason: "Out of country" },
  { id: "l8", employee: "Bilal Ahmed", empCode: "EMP-001", department: "Sales", branch: "Model Town", type: "Casual", from: "2026-05-11", to: "2026-05-11", days: 1, status: "Pending", reason: "Doctor appointment" },
];

export const CATEGORIES = ["Mobiles", "Appliances", "Electronics", "Furniture", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];

export type StockRow = {
  id: string;
  sku: string;
  name: string;
  category: Category;
  branch: Branch;
  onHand: number;
  reorder: number;
  unitCost: number;
  unitPrice: number;
};

export const STOCK: StockRow[] = [
  { id: "s1", sku: "MOB-IPH15P-256", name: "iPhone 15 Pro 256GB", category: "Mobiles", branch: "Model Town", onHand: 12, reorder: 8, unitCost: 320_000, unitPrice: 380_000 },
  { id: "s2", sku: "MOB-INF-HOT40", name: "Infinix Hot 40", category: "Mobiles", branch: "Gulberg", onHand: 22, reorder: 10, unitCost: 32_000, unitPrice: 39_999 },
  { id: "s3", sku: "MOB-VIVO-Y28", name: "Vivo Y28 5G", category: "Mobiles", branch: "Johar Town", onHand: 18, reorder: 10, unitCost: 52_000, unitPrice: 64_500 },
  { id: "s4", sku: "TV-SAM-55QLED", name: "Samsung 55\" QLED", category: "Electronics", branch: "Model Town", onHand: 4, reorder: 10, unitCost: 175_000, unitPrice: 210_000 },
  { id: "s5", sku: "TV-SAM-LED55", name: "Samsung LED TV 55\"", category: "Electronics", branch: "DHA 5", onHand: 9, reorder: 8, unitCost: 120_000, unitPrice: 149_999 },
  { id: "s6", sku: "AUD-SONY-WH1000", name: "Sony Headphones WH-1000", category: "Accessories", branch: "DHA 5", onHand: 2, reorder: 8, unitCost: 60_000, unitPrice: 78_000 },
  { id: "s7", sku: "AC-DAW-INV15", name: "Dawlance Inverter AC 1.5T", category: "Appliances", branch: "Gulberg", onHand: 6, reorder: 12, unitCost: 175_000, unitPrice: 220_000 },
  { id: "s8", sku: "AC-GREE-15T", name: "Gree 1.5 Ton AC", category: "Appliances", branch: "Gulberg", onHand: 11, reorder: 10, unitCost: 132_000, unitPrice: 168_000 },
  { id: "s9", sku: "AC-ORI-15T", name: "Orient 1.5 Ton AC", category: "Appliances", branch: "DHA 5", onHand: 7, reorder: 8, unitCost: 138_000, unitPrice: 175_000 },
  { id: "s10", sku: "WSH-HAI-18KG", name: "Haier 18kg Washer", category: "Appliances", branch: "Johar Town", onHand: 8, reorder: 10, unitCost: 95_000, unitPrice: 120_000 },
  { id: "s11", sku: "MWO-PEL-30L", name: "PEL Microwave 30L", category: "Appliances", branch: "Gulberg", onHand: 14, reorder: 8, unitCost: 42_000, unitPrice: 58_000 },
  { id: "s12", sku: "MWO-HAI-30L", name: "Haier Microwave 30L", category: "Appliances", branch: "Johar Town", onHand: 3, reorder: 10, unitCost: 38_000, unitPrice: 52_000 },
  { id: "s13", sku: "REF-LG-18CU", name: "LG Refrigerator 18cu", category: "Appliances", branch: "DHA 5", onHand: 5, reorder: 6, unitCost: 155_000, unitPrice: 195_000 },
  { id: "s14", sku: "FUR-SOFA-L7", name: "L-Shaped Sofa 7-Seater", category: "Furniture", branch: "Model Town", onHand: 3, reorder: 5, unitCost: 95_000, unitPrice: 135_000 },
  { id: "s15", sku: "FUR-BED-KING", name: "King Size Bed Set", category: "Furniture", branch: "Johar Town", onHand: 6, reorder: 4, unitCost: 78_000, unitPrice: 110_000 },
];

export function fmtRs(n: number) {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}K`;
  return `Rs. ${Math.round(n).toLocaleString()}`;
}
export function fmtRsExact(n: number) {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
