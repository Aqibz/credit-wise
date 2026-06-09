import { useMemo, useState } from "react";
import { Search, Download, AlertCircle, AlertTriangle, Boxes, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import {
  STOCK, BRANCHES, CATEGORIES,
  type Branch, type Category,
  fmtRsExact, downloadCSV,
} from "@/lib/mocks/operations";
import { KpiIcons } from "@/components/kpi-icons";

type AnyOpt<T extends string> = "All" | T;
type Severity = "All" | "Critical" | "Low" | "Reorder Soon";

function severityOf(onHand: number, reorder: number): "Critical" | "Low" | "Reorder Soon" | "OK" {
  if (onHand === 0) return "Critical";
  if (onHand <= reorder * 0.4) return "Critical";
  if (onHand < reorder) return "Low";
  if (onHand < reorder * 1.2) return "Reorder Soon";
  return "OK";
}
function severityBadge(s: ReturnType<typeof severityOf>) {
  const tone = s === "Critical" ? "destructive" : s === "Low" ? "warning" : s === "Reorder Soon" ? "primary" : "muted";
  return <Badge tone={tone}>{s}</Badge>;
}

function LowStockDrilldown() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<AnyOpt<Branch>>("All");
  const [category, setCategory] = useState<AnyOpt<Category>>("All");
  const [severity, setSeverity] = useState<Severity>("All");

  // Only items below or near reorder point qualify for the low-stock view.
  const flagged = useMemo(
    () => STOCK
      .map((s) => ({ ...s, severity: severityOf(s.onHand, s.reorder) }))
      .filter((s) => s.severity !== "OK"),
    [],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return flagged.filter((r) => {
      if (branch !== "All" && r.branch !== branch) return false;
      if (category !== "All" && r.category !== category) return false;
      if (severity !== "All" && r.severity !== severity) return false;
      if (needle && !`${r.name} ${r.sku}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [flagged, q, branch, category, severity]);

  const totals = useMemo(() => {
    const critical = filtered.filter((r) => r.severity === "Critical").length;
    const low = filtered.filter((r) => r.severity === "Low").length;
    const reorderSoon = filtered.filter((r) => r.severity === "Reorder Soon").length;
    const reorderUnits = filtered.reduce((s, r) => s + Math.max(0, r.reorder - r.onHand), 0);
    return { critical, low, reorderSoon, reorderUnits, count: filtered.length };
  }, [filtered]);

  const anyFilter = q || branch !== "All" || category !== "All" || severity !== "All";
  const reset = () => { setQ(""); setBranch("All"); setCategory("All"); setSeverity("All"); };

  function exportCSV() {
    downloadCSV(`low-stock-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["SKU", "Product", "Category", "Branch", "On Hand", "Reorder Point", "Shortfall", "Severity", "Unit Cost"],
      ...filtered.map((r) => [r.sku, r.name, r.category, r.branch, r.onHand, r.reorder, Math.max(0, r.reorder - r.onHand), r.severity, r.unitCost]),
    ]);
  }

  return (
    <>
      <PageHeader
        title="Inventory · Low Stock Drilldown"
        description="SKUs at or below reorder thresholds — sorted by severity."
        actions={
          <button onClick={exportCSV} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Flagged SKUs" value={totals.count} hint="Matching filters" icon={<KpiIcons.inventory />} tone="primary" />
        <StatCard label="Critical" value={totals.critical} hint="Out or near zero" icon={<KpiIcons.warning />} tone="destructive" />
        <StatCard label="Low" value={totals.low} hint="Below reorder point" icon={<KpiIcons.info />} tone="warning" />
        <StatCard label="Units to Reorder" value={totals.reorderUnits} hint="Sum of shortfalls" icon={<KpiIcons.inventory />} tone="primary" />
      </div>

      <div className="rounded-lg border border-border bg-card p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product or SKU…"
              className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <FilterSelect label="Branch" value={branch} onChange={(v) => setBranch(v as AnyOpt<Branch>)} options={["All", ...BRANCHES]} />
          <FilterSelect label="Category" value={category} onChange={(v) => setCategory(v as AnyOpt<Category>)} options={["All", ...CATEGORIES]} />
          <FilterSelect label="Severity" value={severity} onChange={(v) => setSeverity(v as Severity)} options={["All", "Critical", "Low", "Reorder Soon"]} />
        </div>
        {anyFilter && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">{filtered.length} of {flagged.length} flagged SKUs</div>
            <button onClick={reset} className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <X className="h-3 w-3" /> Reset filters
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className={ui.tableHeadRow}>
              <tr className="text-left">
                <Th>SKU</Th><Th>Product</Th><Th>Category</Th><Th>Branch</Th>
                <Th right>On Hand</Th><Th right>Reorder</Th><Th right>Shortfall</Th><Th>Severity</Th><Th right>Unit Cost</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">No flagged SKUs match the current filters.</td></tr>
              ) : filtered.map((r) => {
                const shortfall = Math.max(0, r.reorder - r.onHand);
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <Td className="font-mono text-muted-foreground">{r.sku}</Td>
                    <Td className="font-medium">{r.name}</Td>
                    <Td>{r.category}</Td>
                    <Td>{r.branch}</Td>
                    <Td right className="tabular-nums">{r.onHand}</Td>
                    <Td right className="tabular-nums text-muted-foreground">{r.reorder}</Td>
                    <Td right className={`tabular-nums ${shortfall > 0 ? "font-semibold" : "text-muted-foreground"}`}>{shortfall}</Td>
                    <Td>{severityBadge(r.severity)}</Td>
                    <Td right className="tabular-nums">{fmtRsExact(r.unitCost)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export { LowStockDrilldown as LowStockDrilldownPage };

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  return (
    <label className="block">
      <span className={`${ui.textKpiLabel} ${ui.textMuted} block text-[10px] mb-1`}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-8 px-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide ${right ? "text-right" : ""}`}>{children}</th>;
}
function Td({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-2 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

