import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  Target, AlertCircle, Phone, MessageSquare, CheckCircle2, Download,
  TrendingUp, ArrowUpRight, Clock,
  Wallet, Truck, ShoppingCart, PackageCheck, FileSignature, LifeBuoy,
  HandCoins,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { WidgetCard, StatCardSkeleton, type WidgetStatus } from "@/components/WidgetState";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";
import { useCurrentUser } from "@/lib/useCurrentUser";
import {
  BRANCHES, type BranchKey,
  contractsFunnel, portfolioBuckets, dpdAging, todaysCollectionsByHour,
  collectionEfficiency, cashFlow7d, cashAndBank, branchTargets, salesMix,
  newContracts7d, recoveryAgents, opsPulse, riskAccounts, recentActivity,
  upcomingDeliveries, fmtRs, type RiskBucket,
} from "@/lib/dashboard-mock";

const ChartFallback = ({ h = 220 }: { h?: number }) => (
  <div className="rounded-md bg-muted/40 animate-pulse" style={{ height: h }} />
);

function ChartUnavailable({
  title = "Chart temporarily unavailable",
  h = 220,
}: {
  title?: string;
  h?: number;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-muted-foreground"
      style={{ height: h }}
    >
      <div className="flex h-full items-center justify-center">
        <span className="text-[12px] font-medium">{title}</span>
      </div>
    </div>
  );
}

// Stagger helper — GPU-only transform/opacity, capped delay
const stagger = (i: number, base = 40): React.CSSProperties => ({
  animationDelay: `${Math.min(i, 16) * base}ms`,
  animationFillMode: "both",
});

export default function InstallemDashboard() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}


// ───────────────────────── Filters ─────────────────────────
type RangeKey = "today" | "week" | "month";
const RANGES: { key: RangeKey; label: string; mult: number; periodLabel: string }[] = [
  { key: "today", label: "Today", mult: 1,   periodLabel: "Today" },
  { key: "week",  label: "7D",    mult: 6.4, periodLabel: "Last 7 days" },
  { key: "month", label: "30D",   mult: 26,  periodLabel: "Last 30 days" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

type DemoState = "data" | "loading" | "empty" | "error";

function Dashboard() {
  const { user } = useCurrentUser();
  const isHQ = user.branches.includes("*");
  const defaultBranch: BranchKey = isHQ
    ? "All Branches"
    : ((BRANCHES.find((b) => user.branches.includes(b)) ?? "All Branches") as BranchKey);

  const [range, setRange] = usePersistentState<RangeKey>(
    "dashboard.range", "today",
    (v): v is RangeKey => RANGES.some((r) => r.key === v),
  );
  const [branch, setBranch] = usePersistentState<BranchKey>(
    "dashboard.branch", defaultBranch,
    (v): v is BranchKey => (BRANCHES as readonly string[]).includes(v as string),
  );
  const [demoState] = useState<DemoState>("data");
  const [selectedBucket, setSelectedBucket] = useState<RiskBucket>("Overdue");

  const widgetState = (data?: unknown[]): WidgetStatus => {
    if (demoState === "loading") return "loading";
    if (demoState === "error") return "error";
    if (demoState === "empty") return "empty";
    if (data && data.length === 0) return "empty";
    return "ready";
  };

  const r = RANGES.find((x) => x.key === range)!;
  const branchShare = branch === "All Branches" ? 1 : 0.32;
  const k = r.mult * branchShare;

  // ── Branch-aware KPIs (derived from period * branch share)
  const todaysCollected = useMemo(
    () => todaysCollectionsByHour.reduce((s, x) => s + x.collected, 0) * branchShare,
    [branchShare],
  );
  const todaysTarget = useMemo(
    () => todaysCollectionsByHour.reduce((s, x) => s + x.target, 0) * branchShare,
    [branchShare],
  );

  const kpis = useMemo(() => {
    const portfolioOut = portfolioBuckets.reduce((s, x) => s + x.outstanding, 0) * branchShare;
    const overdueOut   = portfolioBuckets.find((b) => b.name === "Overdue")!.outstanding * branchShare;
    const activePlans  = Math.round(portfolioBuckets.reduce((s, x) => s + x.value, 0) * branchShare);
    const targetPct    = Math.min(100, Math.round(68 + (range === "week" ? 4 : range === "month" ? 9 : 0)));
    const targetTotal  = 470_000 * k;
    const salesPeriod  = 318_000 * k;
    return {
      portfolioOut, overdueOut, activePlans, targetPct, targetTotal, salesPeriod,
      sales: salesPeriod, recovery: 84_500 * k,
      collEff: 92, npaRatio: 3.5,
      newCustomers: Math.max(1, Math.round(6 * r.mult * branchShare / 1.2)),
    };
  }, [k, range, branchShare]);

  // Branch-scoped portfolio buckets for pie / breakdown
  const portfolio = useMemo(
    () => portfolioBuckets.map((b) => ({
      ...b,
      value: Math.max(0, Math.round(b.value * branchShare)),
      outstanding: Math.max(0, Math.round(b.outstanding * branchShare)),
    })),
    [branchShare],
  );

  const branchPerfRows = useMemo(
    () => (branch === "All Branches"
      ? branchTargets.map((b) => ({
          name: b.name,
          sales: Math.round(b.achieved / 1000),
          target: Math.round(b.target / 1000),
          collections: Math.round(b.achieved * 0.72 / 1000),
          overdue: Math.round(b.achieved * 0.18 / 1000),
        }))
      : branchTargets
          .filter((b) => b.name === branch)
          .map((b) => ({
            name: b.name,
            sales: Math.round(b.achieved / 1000),
            target: Math.round(b.target / 1000),
            collections: Math.round(b.achieved * 0.72 / 1000),
            overdue: Math.round(b.achieved * 0.18 / 1000),
          }))),
    [branch],
  );

  // Branch scorecard radar — computed from real-ish ratios
  const branchScorecard = useMemo(() => {
    const target = branchTargets.find((b) => b.name === branch) ?? branchTargets[0];
    const salesPct = Math.round((target.achieved / target.target) * 100);
    return [
      { metric: "Sales",       current: Math.min(100, salesPct),       target: 100 },
      { metric: "Collection",  current: kpis.collEff,                  target: 100 },
      { metric: "Recovery",    current: 64,                            target: 100 },
      { metric: "New Plans",   current: 86,                            target: 100 },
      { metric: "Attendance",  current: opsPulse.attendancePct,        target: 100 },
    ];
  }, [branch, kpis.collEff]);

  const exportRiskCSV = () => {
    const lines: string[] = ["Bucket,Accounts,Outstanding,Note"];
    portfolio.forEach((b) => lines.push(`${b.name},${b.value},${b.outstanding},"${b.hint}"`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `installments_${branch.replace(/\s+/g, "-")}_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title={isHQ ? "Business Overview" : `${defaultBranch} · Branch`}
        description={
          isHQ
            ? `Welcome back, ${user.name.split(" ")[0]} — full pulse across all branches.`
            : `Welcome back, ${user.name.split(" ")[0]} — your branch's daily pulse.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {RANGES.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    range === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {isHQ && (
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchKey)}
                className="h-7 rounded-lg border border-border bg-card px-2 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
            <Badge tone="primary">Live</Badge>
          </div>
        }
      />

      {/* ── Row 1 · Hero KPIs (4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {demoState === "loading"
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : (
            <>
              <div className="animate-fade-in" style={stagger(0)}>
                <StatCard to="/installments" label="Active Portfolio" value={fmtRs(kpis.portfolioOut)} hint={`${kpis.activePlans.toLocaleString()} active plans`} icon={<KpiIcon icon={Wallet} />} tone="primary" />
              </div>
              <div className="animate-fade-in" style={stagger(1)}>
                <StatCard to="/installments/today" label={`Collected · ${r.label}`} value={fmtRs(todaysCollected)} hint={`${Math.round((todaysCollected / todaysTarget) * 100)}% of day target`} icon={<KpiIcon icon={TrendingUp} />} tone="success" />
              </div>
              <div className="animate-fade-in" style={stagger(2)}>
                <StatCard to="/installments/overdue" label="Overdue" value={fmtRs(kpis.overdueOut)} hint={`NPA ${kpis.npaRatio}% · ${portfolio.find(b=>b.name==="Overdue")?.value ?? 0} customers`} icon={<KpiIcon icon={AlertCircle} />} tone="destructive" />
              </div>
              <div className="animate-fade-in" style={stagger(3)}>
                <StatCard to="/sales/targets" label={`Sales Target · ${r.label}`} value={`${kpis.targetPct}%`} hint={`${fmtRs(kpis.sales)} / ${fmtRs(kpis.targetTotal)}`} icon={<KpiIcon icon={Target} />} tone="warning" />
              </div>
            </>
          )}
      </div>

      {/* ── Row 2 · Branch monthly target progress (full width) ── */}
      <div className="animate-fade-in" style={stagger(4)}>
        <BranchTargetCard
          label={branch === "All Branches" ? "All Branches" : `${branch} · Branch`}
          achieved={kpis.sales}
          target={kpis.targetTotal}
          pct={kpis.targetPct}
        />
      </div>

      {/* ── Row 3 · Secondary KPIs (6) — direct links to modules ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
        {[
          <StatCard key="c"  to="/customers"                      label="New Customers" value={kpis.newCustomers} hint={r.periodLabel}                       icon={<KpiIcons.customers />}             tone="primary" />,
          <StatCard key="l"  to="/inventory/low-stock/drilldown"  label="Low Stock"     value={opsPulse.lowStock}  hint="Below reorder"                       icon={<KpiIcon icon={PackageCheck} />}    tone="warning" />,
          <StatCard key="g"  to="/purchases/grn"                  label="Pending GRN"   value={opsPulse.pendingGrn} hint={`${opsPulse.pendingPo} POs open`}  icon={<KpiIcon icon={ShoppingCart} />}    tone="warning" />,
          <StatCard key="d"  to="/logistics/deliveries"           label="Deliveries"    value={opsPulse.deliveriesToday} hint="Scheduled today"               icon={<KpiIcons.delivery />}              tone="primary" />,
          <StatCard key="hp" to="/support/hp-cases"               label="HP Cases"      value={opsPulse.hpCasesOpen} hint={`${opsPulse.ticketsOpen} tickets open`} icon={<KpiIcon icon={LifeBuoy} />}    tone="destructive" />,
          <StatCard key="a"  to="/hr/attendance/drilldown"        label="Attendance"    value={`${opsPulse.attendancePct}%`} hint={`${opsPulse.presentCount} / ${opsPulse.headcount} present`} icon={<KpiIcons.activeUser />} tone="success" />,
        ].map((node, i) => (
          <div key={i} className="animate-fade-in" style={stagger(5 + i)}>{node}</div>
        ))}
      </div>

      {/* ── Symmetric 12-col grid ── */}
      <div className="grid grid-cols-12 gap-4 mt-5">

        {/* GROUP 1 — Contracts Funnel · 4   |   Today's Collections by hour · 8 */}
        <div className="col-span-12 xl:col-span-4 animate-fade-in" style={stagger(11)}>
          <WidgetCard
            state={widgetState(contractsFunnel)}
            title="Contracts Pipeline"
            description={`Live funnel · ${contractsFunnel[0].value} in process`}
            rightSlot={<Badge tone="success">{Math.round((contractsFunnel[3].value / contractsFunnel[0].value) * 100)}% approval</Badge>}
            skeleton="rows"
          >
            <ChartUnavailable title="Pipeline chart unavailable in this build" h={180} />
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <Link to="/contracts/under-process" className="text-primary font-medium hover:underline">Open pipeline</Link>
              <span className="text-muted-foreground inline-flex items-center gap-1"><FileSignature className="h-3 w-3" /> {contractsFunnel.reduce((s, x) => s + x.value, 0)} total</span>
            </div>
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-8 animate-fade-in" style={stagger(12)}>
          <WidgetCard
            state={widgetState(todaysCollectionsByHour)}
            title="Today's Collections by Hour"
            description={`${branch} · vs hourly target`}
            rightSlot={<Badge tone={todaysCollected >= todaysTarget ? "success" : "warning"}>{fmtRs(todaysCollected)} / {fmtRs(todaysTarget)}</Badge>}
            skeleton="chart"
          >
            <ChartUnavailable title="Hourly collections chart unavailable in this build" />
          </WidgetCard>
        </div>

        {/* GROUP 2 — DPD Aging · 8   |   Collection Efficiency · 4 */}
        <div className="col-span-12 xl:col-span-8 animate-fade-in" style={stagger(13)}>
          <WidgetCard
            state={widgetState(dpdAging)}
            title="DPD Aging Analysis"
            description="Days past due — accounts & outstanding by bucket"
            rightSlot={<Badge tone="warning">{dpdAging.slice(1).reduce((s, x) => s + x.accounts, 0)} overdue</Badge>}
            skeleton="chart"
          >
            <ChartUnavailable title="DPD aging chart unavailable in this build" />
            <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-border/60">
              {dpdAging.map((b, i) => {
                const tones = ["text-success", "text-warning-foreground", "text-warning-foreground", "text-destructive", "text-destructive"];
                return (
                  <div key={b.bucket} className="text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.bucket}</div>
                    <div className={`text-sm font-semibold tabular-nums ${tones[i]}`}>{b.accounts}</div>
                    <div className="text-[10.5px] text-muted-foreground tabular-nums">{fmtRs(b.outstanding)}</div>
                  </div>
                );
              })}
            </div>
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-4 animate-fade-in" style={stagger(14)}>
          <WidgetCard
            state={widgetState(collectionEfficiency)}
            title="Collection Efficiency & NPA"
            description="6-month trend"
            rightSlot={<Badge tone="success">{kpis.collEff}%</Badge>}
            skeleton="chart"
          >
            <ChartUnavailable title="Collection efficiency chart unavailable in this build" />
          </WidgetCard>
        </div>

        {/* GROUP 3 — Receipts vs Payments Made · 8   |   Cash & Bank · 4 */}
        <div className="col-span-12 xl:col-span-8 animate-fade-in" style={stagger(15)}>
          <WidgetCard
            state={widgetState(cashFlow7d)}
            title="Receipts vs Payments Made"
            description="Last 7 days · cash inflow vs outflow (with net)"
            rightSlot={
              <Badge tone="primary">
                Net {fmtRs(cashFlow7d.reduce((s, x) => s + (x.receipts - x.paymentsMade), 0))}
              </Badge>
            }
            skeleton="chart"
          >
            <ChartUnavailable title="Receipts vs payments chart unavailable in this build" h={240} />
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-4 animate-fade-in" style={stagger(16)}>
          <WidgetCard
            state={widgetState(cashAndBank)}
            title="Cash & Bank Position"
            description="Across tills & accounts"
            rightSlot={<Link to="/accounts/coa" className="text-[11px] text-primary font-medium hover:underline inline-flex items-center gap-1">Open <ArrowUpRight className="h-3 w-3" /></Link>}
            skeleton="tiles"
          >
            <div className="space-y-2">
              {cashAndBank.map((c) => (
                <CashStat key={c.name} label={c.name} value={fmtRs(c.value)} tone={c.tone} />
              ))}
              <div className="rounded-lg p-3 bg-primary/10 mt-1">
                <div className="text-[11px] text-muted-foreground">Total liquid</div>
                <div className="text-lg font-bold tabular-nums text-primary">
                  {fmtRs(cashAndBank.reduce((s, x) => s + x.value, 0))}
                </div>
              </div>
            </div>
          </WidgetCard>
        </div>

        {/* GROUP 4 — Sales target gauge · 4   |   New contracts trend · 4   |   Sales mix · 4 */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 animate-fade-in" style={stagger(17)}>
          <WidgetCard
            state={widgetState(branchTargets)}
            title="Sales Target Progress"
            description={`${branch} · ${MONTHS[new Date().getMonth()]}`}
            skeleton="tiles"
          >
            <SalesTargetGauge pct={kpis.targetPct} achieved={kpis.sales} target={kpis.targetTotal} />
          </WidgetCard>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4 animate-fade-in" style={stagger(18)}>
          <WidgetCard
            state={widgetState(newContracts7d)}
            title="New Contracts Booked"
            description={`${newContracts7d.reduce((s, x) => s + x.contracts, 0)} contracts · 7D`}
            rightSlot={<Badge tone="primary">avg {fmtRs(Math.round(newContracts7d.reduce((s, x) => s + x.avgTicket * x.contracts, 0) / newContracts7d.reduce((s, x) => s + x.contracts, 0)))}</Badge>}
            skeleton="chart"
          >
            <ChartUnavailable title="New plans chart unavailable in this build" />
          </WidgetCard>
        </div>
        <div className="col-span-12 md:col-span-12 xl:col-span-4 animate-fade-in" style={stagger(19)}>
          <WidgetCard
            state={widgetState(salesMix)}
            title="Sales Mix"
            description="Installment vs Cash · this month"
            skeleton="chart"
          >
            <ChartUnavailable title="Installment risk chart unavailable in this build" h={240} />
          </WidgetCard>
        </div>

        {/* GROUP 5 — Branch Scorecard radar · 4   |   Portfolio breakdown · 8 */}
        <div className="col-span-12 xl:col-span-4 animate-fade-in" style={stagger(20)}>
          <WidgetCard
            state={widgetState(branchScorecard)}
            title="Branch Scorecard"
            description="5 KPIs vs target (0–100)"
            rightSlot={<Badge tone="primary">Radar</Badge>}
            skeleton="chart"
          >
            <ChartUnavailable title="Branch scorecard chart unavailable in this build" h={240} />
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-8 animate-fade-in" style={stagger(21)}>
          <WidgetCard
            state={widgetState(portfolio)}
            title="Installment Portfolio Breakdown"
            description="Click a bucket to drill into accounts"
            rightSlot={
              <button
                type="button"
                onClick={exportRiskCSV}
                className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[11px] font-medium hover:border-primary/50 hover:bg-muted/40"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            }
            skeleton="rows"
          >
            {(() => {
              const totalAcc = portfolio.reduce((s, x) => s + x.value, 0);
              const meta: Record<string, { dot: string; to: string }> = {
                "On Track": { dot: "bg-success",     to: "/installments" },
                "Due Soon": { dot: "bg-warning",     to: "/installments/today" },
                "Overdue":  { dot: "bg-destructive", to: "/installments/overdue" },
              };
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {portfolio.map((b) => {
                      const pct = totalAcc > 0 ? Math.round((b.value / totalAcc) * 100) : 0;
                      const m = meta[b.name];
                      const active = selectedBucket === b.name;
                      return (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => setSelectedBucket(b.name as RiskBucket)}
                          aria-pressed={active}
                          className={`text-left rounded-lg border p-2.5 transition-all duration-200 ${
                            active
                              ? "border-primary bg-primary/5 ring-1 ring-primary/40 scale-[1.01]"
                              : "border-border/60 hover:border-primary/50 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                            <span className="text-[11px] text-muted-foreground truncate">{b.name}</span>
                          </div>
                          <div className="text-lg font-semibold leading-tight tabular-nums">{b.value.toLocaleString()}</div>
                          <div className="text-[11px] text-muted-foreground tabular-nums">{pct}% · {fmtRs(b.outstanding)}</div>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const rows = riskAccounts.filter((a) => a.bucket === selectedBucket);
                    const m = meta[selectedBucket];
                    return (
                      <div className="rounded-lg border border-border/60 overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between px-2.5 py-2 bg-muted/30 border-b border-border/60">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                            <span className="text-[11px] font-semibold">{selectedBucket} · accounts</span>
                            <span className="text-[10.5px] text-muted-foreground">({rows.length} shown)</span>
                          </div>
                          <Link to={m.to} className="text-[11px] text-primary font-medium hover:underline">View all</Link>
                        </div>
                        {rows.length === 0 ? (
                          <div className="px-2.5 py-3 text-[11px] text-muted-foreground">No accounts in this bucket.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11.5px]">
                              <thead className="text-[10.5px] uppercase tracking-wide text-muted-foreground bg-muted/20">
                                <tr>
                                  <th className="text-left font-medium px-2.5 py-1.5">Customer</th>
                                  <th className="text-left font-medium px-2.5 py-1.5">Due date</th>
                                  <th className="text-right font-medium px-2.5 py-1.5">Outstanding</th>
                                  <th className="text-right font-medium px-2.5 py-1.5">Days</th>
                                  <th className="text-right font-medium px-2.5 py-1.5">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((a) => {
                                  const od = a.daysOverdue;
                                  const odClass =
                                    od >= 30 ? "text-destructive font-semibold" :
                                    od > 0 ? "text-warning-foreground font-medium" :
                                    "text-muted-foreground";
                                  const odLabel = od > 0 ? `${od}d late` : od === 0 ? "Due today" : `In ${Math.abs(od)}d`;
                                  return (
                                    <tr key={a.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                                      <td className="px-2.5 py-1.5">
                                        <div className="font-medium leading-tight">{a.customer}</div>
                                        <div className="text-[10.5px] text-muted-foreground">{a.id}</div>
                                      </td>
                                      <td className="px-2.5 py-1.5 text-muted-foreground tabular-nums">{fmtDate(a.dueDate)}</td>
                                      <td className="px-2.5 py-1.5 text-right font-medium tabular-nums">{fmtRs(a.outstanding)}</td>
                                      <td className={`px-2.5 py-1.5 text-right tabular-nums ${odClass}`}>{odLabel}</td>
                                      <td className="px-2.5 py-1.5">
                                        <div className="flex items-center justify-end gap-1">
                                          <a href={`tel:${a.phone.replace(/[^+\d]/g, "")}`} title="Call" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition-colors">
                                            <Phone className="h-3 w-3" />
                                          </a>
                                          <a href={`https://wa.me/${a.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" title="WhatsApp" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition-colors">
                                            <MessageSquare className="h-3 w-3" />
                                          </a>
                                          <Link to={m.to} title="Open" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition-colors">
                                            <CheckCircle2 className="h-3 w-3" />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </WidgetCard>
        </div>

        {/* GROUP 6 — Recovery Agents leaderboard · 6   |   Branch Performance · 6 */}
        <div className="col-span-12 xl:col-span-6 animate-fade-in" style={stagger(22)}>
          <WidgetCard
            state={widgetState(recoveryAgents)}
            title="Recovery Agents · Today"
            description="Assigned vs recovered · top performers"
            rightSlot={<Link to="/recovery/daily" className="text-[11px] text-primary font-medium hover:underline inline-flex items-center gap-1">Daily sheet <ArrowUpRight className="h-3 w-3" /></Link>}
            skeleton="rows"
          >
            <ul className="space-y-2">
              {recoveryAgents.map((a, i) => {
                const pct = Math.round((a.recovered / a.assigned) * 100);
                return (
                  <li key={a.name} className="rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 px-2.5 py-2 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 grid place-items-center rounded-md bg-primary/10 text-primary text-[11px] font-bold">{i + 1}</span>
                        <span className="text-[12.5px] font-medium">{a.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold tabular-nums">{fmtRs(a.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-success transition-[width] duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="tabular-nums w-20 text-right">{a.recovered}/{a.assigned} · {pct}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-6 animate-fade-in" style={stagger(23)}>
          <WidgetCard
            state={widgetState(branchPerfRows)}
            title="Branch Performance"
            description="Sales · Collections · Overdue (Rs. in '000)"
            rightSlot={<Link to="/branches" className="text-[11px] text-primary font-medium hover:underline inline-flex items-center gap-1">All branches <ArrowUpRight className="h-3 w-3" /></Link>}
            skeleton="chart"
          >
            <ChartUnavailable title="Branch performance chart unavailable in this build" h={260} />
          </WidgetCard>
        </div>

        {/* GROUP 7 — Recent Activity · 8   |   Upcoming Deliveries · 4 */}
        <div className="col-span-12 xl:col-span-8 animate-fade-in" style={stagger(24)}>
          <WidgetCard
            state={widgetState(recentActivity)}
            title="Recent Activity"
            description="Live events from across the business"
            skeleton="rows"
          >
            <ul className="space-y-1.5">
              {recentActivity.map((a, i) => {
                const meta: Record<string, { tone: "success" | "primary" | "warning" | "destructive"; icon: React.ReactNode; label: string }> = {
                  receipt:  { tone: "success",     icon: <Wallet className="h-3.5 w-3.5" />,        label: "Receipt" },
                  recovery: { tone: "success",     icon: <HandCoins className="h-3.5 w-3.5" />,     label: "Recovery" },
                  contract: { tone: "primary",     icon: <FileSignature className="h-3.5 w-3.5" />, label: "New Contract" },
                  delivery: { tone: "primary",     icon: <Truck className="h-3.5 w-3.5" />,         label: "Delivery" },
                  hpcase:   { tone: "warning",     icon: <LifeBuoy className="h-3.5 w-3.5" />,      label: "HP Case" },
                  missed:   { tone: "destructive", icon: <AlertCircle className="h-3.5 w-3.5" />,   label: "Missed" },
                };
                const m = meta[a.kind] ?? meta.receipt;
                const toneCls = {
                  success:     "bg-success/15 text-success",
                  primary:     "bg-primary/10 text-primary",
                  warning:     "bg-warning/20 text-warning-foreground",
                  destructive: "bg-destructive/10 text-destructive",
                }[m.tone];
                return (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 px-2.5 py-2 transition-colors">
                    <div className={`h-7 w-7 shrink-0 rounded-lg grid place-items-center ${toneCls}`}>{m.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium leading-tight truncate">{a.who}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{a.detail}</div>
                    </div>
                    {a.amount > 0 && <div className="text-[12px] font-semibold tabular-nums">{fmtRs(a.amount)}</div>}
                    <div className="text-[10.5px] text-muted-foreground tabular-nums w-8 text-right">{a.time}</div>
                  </li>
                );
              })}
            </ul>
          </WidgetCard>
        </div>
        <div className="col-span-12 xl:col-span-4 animate-fade-in" style={stagger(25)}>
          <WidgetCard
            state={widgetState(upcomingDeliveries)}
            title="Upcoming Deliveries"
            description={`${upcomingDeliveries.length} scheduled`}
            rightSlot={<Link to="/logistics/deliveries" className="text-[11px] text-primary font-medium hover:underline inline-flex items-center gap-1">View <ArrowUpRight className="h-3 w-3" /></Link>}
            skeleton="rows"
          >
            <ul className="space-y-1.5">
              {upcomingDeliveries.map((d) => (
                <li key={d.ref} className="rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 px-2.5 py-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-[12.5px] font-medium">{d.customer}</div>
                    <Badge tone="primary">{d.items} item{d.items > 1 ? "s" : ""}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                    <span>{d.ref} · {d.area}</span>
                    <span className="tabular-nums">{d.eta}</span>
                  </div>
                </li>
              ))}
            </ul>
          </WidgetCard>
        </div>
      </div>
    </>
  );
}


// ───────────────────────── Helpers ─────────────────────────

function CashStat({ label, value, tone }: { label: string; value: string; tone: "primary" | "info" | "warning" | "success" }) {
  const dot = { primary: "bg-primary", info: "bg-info", warning: "bg-warning", success: "bg-success" }[tone];
  return (
    <div className="rounded-lg border border-border/60 p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground truncate">{label}</span>
      </div>
      <div className="text-[14px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SalesTargetGauge({ pct, achieved, target }: { pct: number; achieved: number; target: number }) {
  const safe = Math.min(100, Math.max(0, pct));
  const ringTone = safe >= 100 ? "stroke-success" : safe >= 70 ? "stroke-primary" : "stroke-warning";
  const R = 56;
  const C2 = 2 * Math.PI * R;
  const dash = (safe / 100) * C2;
  return (
    <div className="flex flex-col items-center pt-2">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={R} className="stroke-muted" strokeWidth="12" fill="none" />
          <circle
            cx="80" cy="80" r={R}
            className={`${ringTone} transition-[stroke-dasharray] duration-700 ease-out`}
            strokeWidth="12" fill="none" strokeLinecap="round"
            strokeDasharray={`${dash} ${C2}`}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-3xl font-bold tabular-nums">{safe}%</div>
            <div className="text-[10.5px] text-muted-foreground">of target</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-[12px] font-semibold tabular-nums">{fmtRs(achieved)}</div>
        <div className="text-[10.5px] text-muted-foreground tabular-nums">of {fmtRs(target)}</div>
      </div>
    </div>
  );
}

function BranchTargetCard({ label, achieved, target, pct }: { label: string; achieved: number; target: number; pct: number }) {
  // Hydration-safe: defer Date.now()-derived state to client-only effect.
  const [stamp, setStamp] = useState<{ periodLabel: string; daysLeft: number } | null>(null);
  useEffect(() => {
    const now = new Date();
    setStamp({
      periodLabel: now.toLocaleString("en-US", { month: "short", year: "numeric" }).toUpperCase(),
      daysLeft: Math.max(0, Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() - now.getTime()) / 86_400_000)),
    });
  }, []);

  const remaining = Math.max(0, target - achieved);
  const onTrack = stamp ? pct >= ((30 - stamp.daysLeft) / 30) * 100 : true;
  const tone =
    pct >= 100 ? "from-success to-success" :
    onTrack ? "from-primary to-primary" :
    "from-warning to-destructive";

  return (
    <div className="mt-3 rounded-xl border border-border bg-card px-5 py-3.5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          <Target className="h-3.5 w-3.5 text-primary" />
          {label} · Target{stamp ? ` · ${stamp.periodLabel}` : ""}
        </div>
        <div className="text-[12px] font-bold tabular-nums text-foreground">
          {pct}%
          {pct >= 100 && <span className="ml-1 text-success-foreground">✓</span>}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${tone} transition-[width] duration-700 ease-out`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      <div className="flex items-center justify-between mt-2 text-[11.5px] gap-2 flex-wrap">
        <span className="font-semibold text-foreground tabular-nums">
          <span className="text-success-foreground">{fmtRs(achieved)}</span>
          <span className="text-muted-foreground"> of {fmtRs(target)}</span>
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
          <Clock className="h-3 w-3" />
          {remaining > 0 ? <>{fmtRs(remaining)} left{stamp ? ` · ${stamp.daysLeft}d` : ""}</> : <span className="text-success-foreground">Target met</span>}
        </span>
      </div>
    </div>
  );
}
