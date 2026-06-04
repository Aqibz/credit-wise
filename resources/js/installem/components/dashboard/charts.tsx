import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

// IMPORTANT: design tokens are stored as `oklch(...)` values, not HSL channels.
// So we use `var(--token)` directly — wrapping in hsl(...) would produce
// `hsl(oklch(...))` which is invalid and falls back to black.
const C = {
  primary: "var(--primary)",
  primarySoft: "var(--primary-soft)",
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  muted: "var(--muted)",
  mutedFg: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
};

const PIE = [C.primary, C.info, C.success, C.warning, C.mutedFg];

const tooltipStyle = {
  contentStyle: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 12,
    padding: "6px 10px",
    color: "var(--card-foreground)",
  },
  labelStyle: { fontSize: 11, color: C.mutedFg },
} as const;

export function SalesTrendChart({ data }: { data: { d: string; sales: number; recovery: number; purchase: number; missed?: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.success} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="sales" stroke={C.primary} fill="url(#gSales)" strokeWidth={2.25} />
        <Area type="monotone" dataKey="recovery" stroke={C.success} fill="url(#gRec)" strokeWidth={2} />
        <Line type="monotone" dataKey="purchase" stroke={C.warning} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="missed" stroke={C.destructive} strokeWidth={2} strokeDasharray="4 3" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function InventoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} stroke={C.card}>
          {data.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

const RISK_COLORS: Record<string, string> = {
  Healthy: C.success,
  "Nearing Due": C.warning,
  Defaulters: C.destructive,
};

export function InstallmentRiskChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} stroke={C.card}>
          {data.map((d, i) => <Cell key={i} fill={RISK_COLORS[d.name] ?? PIE[i % PIE.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} accounts`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RevenueExpenseChart({ data }: { data: { m: string; revenue: number; expense: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `Rs. ${v.toLocaleString()}K`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Bar dataKey="revenue" name="Revenue" fill={C.success} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill={C.destructive} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BranchPerfChart({
  data,
}: {
  data: { name: string; sales: number; collections: number; overdue: number; target?: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }} barGap={4} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `Rs. ${v.toLocaleString()}K`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Bar dataKey="sales" name="Sales" fill={C.primary} radius={[4, 4, 0, 0]} />
        <Bar dataKey="collections" name="Collections" fill={C.success} radius={[4, 4, 0, 0]} />
        <Bar dataKey="overdue" name="Overdue" fill={C.destructive} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
