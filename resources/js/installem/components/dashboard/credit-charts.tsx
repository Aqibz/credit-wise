import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter, ScatterChart, ZAxis,
} from "recharts";

const C = {
  primary: "var(--primary)",
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  mutedFg: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
};

const tip = {
  contentStyle: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 12, padding: "6px 10px",
    color: "var(--card-foreground)",
  },
  labelStyle: { fontSize: 11, color: C.mutedFg },
} as const;

/** DPD aging buckets — 0-30 / 31-60 / 61-90 / 90+ */
export function DpdAgingChart({
  data,
}: { data: { bucket: string; accounts: number; outstanding: number }[] }) {
  const colors = [C.success, C.warning, "var(--warning)", C.destructive];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip
          {...tip}
          formatter={(v: number, n) =>
            n === "outstanding" ? `Rs. ${(v / 1_000_000).toFixed(1)}M` : `${v} accounts`
          }
        />
        <Bar dataKey="accounts" radius={[6, 6, 0, 0]} animationDuration={700}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Collection efficiency % over time, with NPA % overlay */
export function CollectionEfficiencyChart({
  data,
}: { data: { m: string; efficiency: number; npa: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} domain={[0, 100]} unit="%" />
        <Tooltip {...tip} formatter={(v: number) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Line type="monotone" dataKey="efficiency" name="Collection %" stroke={C.success} strokeWidth={2.5} dot={{ r: 3 }} animationDuration={700} />
        <Line type="monotone" dataKey="npa" name="NPA %" stroke={C.destructive} strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} animationDuration={700} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Cash flow forecast — next 7/30 days expected EMI inflow vs scheduled */
export function CashFlowChart({
  data,
}: { data: { d: string; expected: number; scheduled: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gSch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.info} stopOpacity={0.25} />
            <stop offset="100%" stopColor={C.info} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip {...tip} formatter={(v: number) => `Rs. ${(v / 1000).toFixed(0)}K`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Area type="monotone" dataKey="scheduled" name="Scheduled" stroke={C.info} fill="url(#gSch)" strokeWidth={2} animationDuration={700} />
        <Area type="monotone" dataKey="expected" name="Expected (forecast)" stroke={C.primary} fill="url(#gExp)" strokeWidth={2.5} animationDuration={700} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** New plans booked per period — bar with avg ticket size as line */
export function NewPlansChart({
  data,
}: { data: { d: string; plans: number; avgTicket: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <Tooltip {...tip} formatter={(v: number, n) => n === "avgTicket" ? `Rs. ${(v / 1000).toFixed(0)}K` : v} />
        <Bar dataKey="plans" name="Plans booked" fill={C.primary} radius={[6, 6, 0, 0]} animationDuration={700} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Recovery funnel — assigned → contacted → promised → paid */
export function RecoveryFunnel({
  stages,
}: { stages: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  const palette = [C.info, C.primary, C.warning, C.success];
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const pct = Math.round((s.value / max) * 100);
        const color = s.color ?? palette[i % palette.length];
        const conv =
          i === 0
            ? 100
            : Math.round((s.value / stages[0].value) * 100);
        return (
          <div key={s.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[12px] font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                <span className="font-semibold text-foreground">{s.value.toLocaleString()}</span>
                <span>· {conv}%</span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact radial gauge — used for portfolio health score */
export function HealthGauge({ value, label }: { value: number; label: string }) {
  const data = [{ name: label, value, fill: C.success }];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "var(--muted)" }} animationDuration={900} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

/** Branch KPI scorecard radar — 5 axes, current vs target */
export function BranchScorecardRadar({
  data,
}: { data: { metric: string; current: number; target: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 16 }}>
        <PolarGrid stroke={C.border} />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10.5, fill: C.mutedFg }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: C.mutedFg }} stroke={C.border} />
        <Radar name="Target" dataKey="target" stroke={C.mutedFg} fill={C.mutedFg} fillOpacity={0.08} strokeDasharray="3 3" animationDuration={700} />
        <Radar name="Current" dataKey="current" stroke={C.primary} fill={C.primary} fillOpacity={0.35} animationDuration={900} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Tooltip {...tip} formatter={(v: number) => `${v}%`} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Customer payment behavior scatter — outstanding vs days overdue */
export function PaymentBehaviorScatter({
  data,
}: { data: { x: number; y: number; z: number; name: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis type="number" dataKey="x" name="Days overdue" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis type="number" dataKey="y" name="Outstanding" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <ZAxis type="number" dataKey="z" range={[60, 360]} />
        <Tooltip {...tip} cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, n: string) =>
          n === "y" ? `Rs. ${(v / 1000).toFixed(0)}K` : n === "x" ? `${v}d` : v
        } />
        <Scatter name="Customers" data={data} fill={C.warning} animationDuration={800}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.x >= 30 ? C.destructive : d.x > 0 ? C.warning : C.success} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}


/** Hourly collections — collected vs target bar, today's day */
export function HourlyCollectionsChart({
  data,
}: { data: { h: string; collected: number; target: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="h" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip {...tip} formatter={(v: number) => `Rs. ${(v / 1000).toFixed(1)}K`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Bar dataKey="collected" name="Collected" fill={C.success} radius={[5, 5, 0, 0]} animationDuration={700}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.collected >= d.target ? C.success : C.warning} />
          ))}
        </Bar>
        <Line type="monotone" dataKey="target" name="Target" stroke={C.mutedFg} strokeDasharray="4 3" strokeWidth={1.75} dot={false} animationDuration={700} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Receipts (in) vs Payments Made (out) — last 7 days */
export function ReceiptsVsPaymentsChart({
  data,
}: { data: { d: string; receipts: number; paymentsMade: number }[] }) {
  const chartData = data.map((row) => ({
    ...row,
    net: row.receipts - row.paymentsMade,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
        <defs>
          <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity={0.4} />
            <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} />
        <YAxis tick={{ fontSize: 11, fill: C.mutedFg }} stroke={C.border} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip {...tip} formatter={(v: number) => `Rs. ${(v / 1000).toFixed(0)}K`} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.mutedFg }} iconSize={8} />
        <Bar dataKey="receipts" name="Receipts" fill={C.success} radius={[4, 4, 0, 0]} animationDuration={700} />
        <Bar dataKey="paymentsMade" name="Payments Made" fill={C.destructive} radius={[4, 4, 0, 0]} animationDuration={700} />
        <Area
          type="monotone"
          dataKey="net"
          name="Net"
          stroke={C.primary}
          fill="url(#gNet)"
          strokeWidth={2}
          animationDuration={800}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
