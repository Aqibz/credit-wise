import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Eye, X, MoreVertical, Search, Layers, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { useEntityStore } from "@/lib/useEntityStore";
import { installmentMatrixConfig } from "@/lib/entities";
import { KpiIcons } from "@/components/kpi-icons";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type MatrixRow = {
  id: string;
  product: string;
  category?: string;
  plan: string;
  tenure: number;
  downPayment: number;
  markup: number;
  price: number;
  monthly: number;
  total: number;
  status: string;
};

export function MatrixPreviewView({ headerSlot }: { headerSlot?: React.ReactNode }) {
  const { items } = useEntityStore<MatrixRow>("qcrm.installment-matrix", installmentMatrixConfig.seed as any);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<string | null>(null);
  const [actionFor, setActionFor] = useState<string | null>(null);

  // Group by product (variant)
  const grouped = useMemo(() => {
    const map = new Map<string, MatrixRow[]>();
    items.forEach((row) => {
      const key = row.product;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries()).map(([product, rows]) => ({
      product,
      category: rows[0].category,
      cashPrice: rows[0].price,
      planCount: rows.length,
      minTenure: Math.min(...rows.map((r) => r.tenure)),
      maxTenure: Math.max(...rows.map((r) => r.tenure)),
      minMonthly: Math.min(...rows.map((r) => r.monthly)),
      maxMonthly: Math.max(...rows.map((r) => r.monthly)),
      rows,
    }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped.filter((g) => g.product.toLowerCase().includes(q) || (g.category || "").toLowerCase().includes(q));
  }, [grouped, search]);

  const viewingGroup = grouped.find((g) => g.product === viewing);

  return (
    <>
      <PageHeader title="Installment Matrix" description="Each variant ke saare pricing plans aur tenures." />
      {headerSlot}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Variants" value={grouped.length} icon={<KpiIcons.inventory />} tone="primary" />
        <StatCard label="Total Matrices" value={items.length} icon={<KpiIcons.card />} tone="success" />
        <StatCard label="Avg Markup" value={items.length ? Math.round(items.reduce((s, r) => s + Number(r.markup || 0), 0) / items.length) + "%" : "0%"} icon={<KpiIcons.trendUp />} tone="primary" />
        <StatCard label="Max Tenure" value={Math.max(0, ...items.map((r) => r.tenure)) + " mo"} icon={<KpiIcons.calendar />} tone="primary" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variant or category..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} variants</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Variant / Product</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Cash Price</th>
                <th className="text-left px-4 py-3 font-semibold">Plans</th>
                <th className="text-left px-4 py-3 font-semibold">Tenure Range</th>
                <th className="text-left px-4 py-3 font-semibold">Monthly EMI Range</th>
                <th className="px-2 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((g) => (
                <tr key={g.product} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{g.product}</td>
                  <td className="px-4 py-4 text-muted-foreground">{g.category}</td>
                  <td className="px-4 py-4 font-medium">{Rs(g.cashPrice)}</td>
                  <td className="px-4 py-4">
                    <Badge tone="primary">{g.planCount} plans</Badge>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{g.minTenure} – {g.maxTenure} mo</td>
                  <td className="px-4 py-4 text-muted-foreground">{Rs(g.minMonthly)} – {Rs(g.maxMonthly)}</td>
                  <td className="px-2 py-4 relative">
                    <button
                      onClick={() => setActionFor(actionFor === g.product ? null : g.product)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {actionFor === g.product && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActionFor(null)} />
                        <div className="absolute right-2 top-12 z-50 w-44 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                          <button
                            onClick={() => { setViewing(g.product); setActionFor(null); }}
                            className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Matrix
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">No matrices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingGroup && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{viewingGroup.product}</h3>
                  <p className="text-xs text-muted-foreground">{viewingGroup.category} · Cash Price {Rs(viewingGroup.cashPrice)}</p>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{viewingGroup.rows.length} pricing matrices available</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Plan</th>
                      <th className="text-left px-3 py-2 font-semibold">Tenure</th>
                      <th className="text-left px-3 py-2 font-semibold">DP %</th>
                      <th className="text-left px-3 py-2 font-semibold">Markup</th>
                      <th className="text-left px-3 py-2 font-semibold">Monthly</th>
                      <th className="text-left px-3 py-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingGroup.rows.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2.5 font-medium text-foreground">{r.plan}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.tenure} mo</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.downPayment}%</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.markup}%</td>
                        <td className="px-3 py-2.5 font-semibold text-primary">{Rs(r.monthly)}</td>
                        <td className="px-3 py-2.5 font-medium">{Rs(r.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
