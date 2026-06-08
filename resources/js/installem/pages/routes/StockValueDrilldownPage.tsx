import { useMemo, useState } from "react";
import { Search, Download, Wallet, Boxes, TrendingUp, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, ui } from "@/components/ui-kit";
import {
  STOCK, BRANCHES, CATEGORIES,
  type Branch, type Category,
  fmtRs, fmtRsExact, downloadCSV,
} from "@/lib/ops-mock";
import { KpiIcons } from "@/components/kpi-icons";

type AnyOpt<T extends string> = "All" | T;
type Sort = "value-desc" | "value-asc" | "qty-desc" | "qty-asc";

function StockValueDrilldown() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<AnyOpt<Branch>>("All");
  const [category, setCategory] = useState<AnyOpt<Category>>("All");
  const [sort, setSort] = useState<Sort>("value-desc");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = STOCK
      .map((r) => ({
        ...r,
        costValue: r.unitCost * r.onHand,
        retailValue: r.unitPrice * r.onHand,
        margin: (r.unitPrice - r.unitCost) * r.onHand,
      }))
      .filter((r) => {
        if (branch !== "All" && r.branch !== branch) return false;
        if (category !== "All" && r.category !== category) return false;
        if (needle && !`${r.name} ${r.sku}`.toLowerCase().includes(needle)) return false;
        return true;
      });
    rows.sort((a, b) =>
      sort === "value-desc" ? b.costValue - a.costValue
      : sort === "value-asc" ? a.costValue - b.costValue
      : sort === "qty-desc" ? b.onHand - a.onHand
      : a.onHand - b.onHand,
    );
    return rows;
  }, [q, branch, category, sort]);

  const totals = useMemo(() => {
    const cost = filtered.reduce((s, r) => s + r.costValue, 0);
    const retail = filtered.reduce((s, r) => s + r.retailValue, 0);
    const units = filtered.reduce((s, r) => s + r.onHand, 0);
    return { cost, retail, margin: retail - cost, units, count: filtered.length };
  }, [filtered]);

  // Per-branch breakdown chart (simple bars, no recharts dep needed).
  const byBranch = useMemo(() => {
    const map = new Map<Branch, number>();
    filtered.forEach((r) => map.set(r.branch, (map.get(r.branch) ?? 0) + r.costValue));
    const max = Math.max(1, ...Array.from(map.values()));
    return BRANCHES.map((b) => ({ branch: b, value: map.get(b) ?? 0, pct: ((map.get(b) ?? 0) / max) * 100 }));
  }, [filtered]);

  const anyFilter = q || branch !== "All" || category !== "All" || sort !== "value-desc";
  const reset = () => { setQ(""); setBranch("All"); setCategory("All"); setSort("value-desc"); };

  function exportCSV() {
    downloadCSV(`stock-value-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["SKU", "Product", "Category", "Branch", "On Hand", "Unit Cost", "Unit Price", "Cost Value", "Retail Value", "Margin"],
      ...filtered.map((r) => [r.sku, r.name, r.category, r.branch, r.onHand, r.unitCost, r.unitPrice, r.costValue, r.retailValue, r.margin]),
    ]);
  }

  return (
    <>
      <PageHeader
        title="Inventory · Stock Value Drilldown"
        description="What every SKU is worth at cost and retail, sliced by branch and category."
        actions={
          <button onClick={exportCSV} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="SKUs" value={totals.count} hint={`${totals.units} units on hand`} icon={<KpiIcons.inventory />} tone="primary" />
        <StatCard label="Cost Value" value={fmtRs(totals.cost)} hint="At unit cost" icon={<KpiIcons.wallet />} tone="primary" />
        <StatCard label="Retail Value" value={fmtRs(totals.retail)} hint="At sell price" icon={<KpiIcons.wallet />} tone="success" />
        <StatCard label="Potential Margin" value={fmtRs(totals.margin)} hint={`${totals.cost ? Math.round((totals.margin / totals.cost) * 100) : 0}% over cost`} icon={<KpiIcons.trendUp />} tone="success" />
      </div>

      {/* Per-branch mini bar chart */}
      <div className="rounded-lg border border-border bg-card p-4 mb-3">
        <div className={`${ui.textKpiLabel} ${ui.textMuted} text-[11px] mb-2`}>Cost Value by Branch</div>
        <div className="space-y-2">
          {byBranch.map((b) => (
            <div key={b.branch}>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="font-medium">{b.branch}</span>
                <span className="text-muted-foreground tabular-nums">{fmtRs(b.value)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${b.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
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
          <FilterSelect label="Sort by" value={sort} onChange={(v) => setSort(v as Sort)} options={["value-desc", "value-asc", "qty-desc", "qty-asc"]} />
        </div>
        {anyFilter && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">{filtered.length} of {STOCK.length} SKUs</div>
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
                <Th right>On Hand</Th><Th right>Unit Cost</Th><Th right>Unit Price</Th>
                <Th right>Cost Value</Th><Th right>Retail Value</Th><Th right>Margin</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-10 text-center text-muted-foreground">No SKUs match the current filters.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <Td className="font-mono text-muted-foreground">{r.sku}</Td>
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{r.category}</Td>
                  <Td>{r.branch}</Td>
                  <Td right className="tabular-nums">{r.onHand}</Td>
                  <Td right className="tabular-nums">{fmtRsExact(r.unitCost)}</Td>
                  <Td right className="tabular-nums">{fmtRsExact(r.unitPrice)}</Td>
                  <Td right className="tabular-nums font-medium">{fmtRsExact(r.costValue)}</Td>
                  <Td right className="tabular-nums">{fmtRsExact(r.retailValue)}</Td>
                  <Td right className="tabular-nums text-success-foreground">{fmtRsExact(r.margin)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export { StockValueDrilldown as StockValueDrilldownPage };

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

