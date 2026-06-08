import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Search, Download, Boxes, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { KpiIcon } from "@/components/kpi-icons";
import { ActivityRefLink } from "@/shared/components/links/ActivityRefLink";

type Movement = {
  id: string; date: string; ref: string; product: string; sku: string;
  warehouse: string; type: "Inward" | "Outward" | "Transfer" | "Adjustment";
  qty: number; source?: string; destination?: string; reason?: string;
};

const SEED: Movement[] = [
  { id: "m1", date: "2026-05-09", ref: "GRN-2210", product: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", warehouse: "Main Warehouse", type: "Inward", qty: 25, source: "Gree Pakistan" },
  { id: "m2", date: "2026-05-09", ref: "INV-9901", product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", warehouse: "Gulberg Outlet", type: "Outward", qty: 2, destination: "Customer Sale" },
  { id: "m3", date: "2026-05-08", ref: "TRF-301", product: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", warehouse: "Model Town Store", type: "Transfer", qty: 5, source: "Main Warehouse", destination: "Model Town Store" },
  { id: "m4", date: "2026-05-08", ref: "ADJ-1002", product: "Gree 1.5 Ton AC", sku: "AC-15-GRE", warehouse: "Main Warehouse", type: "Adjustment", qty: 2, reason: "Found Stock" },
  { id: "m5", date: "2026-05-07", ref: "INV-9890", product: "Samsung Galaxy A55", sku: "MOB-A55", warehouse: "Gulberg Outlet", type: "Outward", qty: 3, destination: "Customer Sale" },
  { id: "m6", date: "2026-05-06", ref: "GRN-2208", product: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", warehouse: "Main Warehouse", type: "Inward", qty: 12, source: "Haier Distributors" },
  { id: "m7", date: "2026-05-06", ref: "ADJ-1001", product: "Samsung Galaxy A55", sku: "MOB-A55", warehouse: "Gulberg Outlet", type: "Adjustment", qty: -1, reason: "Theft" },
  { id: "m8", date: "2026-05-05", ref: "TRF-300", product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", warehouse: "Karachi Transit Hub", type: "Transfer", qty: 8, source: "Main Warehouse", destination: "Karachi Transit Hub" },
];

const TYPE_META = {
  Inward: { icon: ArrowDownLeft, tone: "success" as const, color: "text-success-foreground bg-success/15" },
  Outward: { icon: ArrowUpRight, tone: "warning" as const, color: "text-warning bg-warning/15" },
  Transfer: { icon: ArrowLeftRight, tone: "primary" as const, color: "text-primary bg-primary/10" },
  Adjustment: { icon: Boxes, tone: "muted" as const, color: "text-muted-foreground bg-muted" },
};

function StockMovementReport() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | Movement["type"]>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SEED.filter((m) => {
      if (typeFilter !== "All" && m.type !== typeFilter) return false;
      if (!q) return true;
      return [m.product, m.sku, m.ref, m.warehouse].some((s) => s.toLowerCase().includes(q));
    });
  }, [search, typeFilter]);

  const inward = SEED.filter((m) => m.type === "Inward").reduce((s, x) => s + x.qty, 0);
  const outward = SEED.filter((m) => m.type === "Outward").reduce((s, x) => s + x.qty, 0);
  const transfers = SEED.filter((m) => m.type === "Transfer").reduce((s, x) => s + x.qty, 0);
  const net = inward - outward;

  return (
    <AppShell>
      <PageHeader
        title="Stock Movement"
        description="Every inward, outward, transfer and adjustment movement across warehouses."
        actions={
          <button className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30">
            <Download className="h-4 w-4" strokeWidth={1.75} /> Export
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Inward Units" value={inward} icon={<KpiIcon icon={ArrowDownLeft} />} tone="success" />
        <StatCard label="Outward Units" value={outward} icon={<KpiIcon icon={ArrowUpRight} />} tone="warning" />
        <StatCard label="Transferred" value={transfers} icon={<KpiIcon icon={ArrowLeftRight} />} tone="primary" />
        <StatCard label="Net Movement" value={net} icon={<KpiIcon icon={net >= 0 ? TrendingUp : TrendingDown} />} tone={net >= 0 ? "success" : "warning"} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, ref…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "Inward", "Outward", "Transfer", "Adjustment"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as any)}
              className={`h-9 px-3 rounded-lg text-[12px] font-semibold border transition ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Date</th>
                <th className="text-left px-4 py-3 font-bold">Reference</th>
                <th className="text-left px-4 py-3 font-bold">Product</th>
                <th className="text-left px-4 py-3 font-bold">Warehouse</th>
                <th className="text-left px-4 py-3 font-bold">Type</th>
                <th className="text-right px-4 py-3 font-bold">Qty</th>
                <th className="text-left px-4 py-3 font-bold">Source / Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => {
                const meta = TYPE_META[m.type];
                const Icon = meta.icon;
                return (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">{m.date}</td>
                    <td className="px-4 py-3"><ActivityRefLink type={m.type} ref={m.ref} /></td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{m.product}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{m.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{m.warehouse}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-bold ${meta.color}`}>
                        <Icon className="h-3 w-3" strokeWidth={1.75} /> {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">
                      {m.source && m.destination ? `${m.source} → ${m.destination}` : m.source ?? m.destination ?? m.reason ?? "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No movements found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export { StockMovementReport as StockMovementReportPage };

