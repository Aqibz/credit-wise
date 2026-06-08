import { useMemo, useState } from "react";
import { Search, Download, BookOpen, Package, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { KpiIcon } from "@/components/kpi-icons";
import { ActivityRefLink } from "@/shared/components/links/ActivityRefLink";

type Entry = {
  id: string; date: string; ref: string; type: "Inward" | "Outward" | "Adjustment" | "Transfer";
  warehouse: string; in: number; out: number; balance: number; note?: string;
};

const ITEMS = [
  { sku: "AC-15-GRE", product: "Gree 1.5 Ton Inverter AC", opening: 25 },
  { sku: "LED-55-SAM", product: "Samsung LED TV 55 Inch", opening: 18 },
  { sku: "REF-INV-HAI", product: "Haier Inverter Refrigerator", opening: 12 },
  { sku: "MOB-A55", product: "Samsung Galaxy A55", opening: 30 },
];

const LEDGER: Record<string, Entry[]> = {
  "AC-15-GRE": [
    { id: "1", date: "2026-05-01", ref: "OPN-001", type: "Inward", warehouse: "Main Warehouse", in: 25, out: 0, balance: 25, note: "Opening Stock" },
    { id: "2", date: "2026-05-06", ref: "GRN-2208", type: "Inward", warehouse: "Main Warehouse", in: 10, out: 0, balance: 35, note: "Gree Pakistan PO" },
    { id: "3", date: "2026-05-08", ref: "ADJ-1002", type: "Adjustment", warehouse: "Main Warehouse", in: 2, out: 0, balance: 37, note: "Found Stock" },
    { id: "4", date: "2026-05-09", ref: "INV-9905", type: "Outward", warehouse: "Main Warehouse", in: 0, out: 4, balance: 33, note: "Customer Sale" },
  ],
  "LED-55-SAM": [
    { id: "1", date: "2026-05-01", ref: "OPN-002", type: "Inward", warehouse: "Main Warehouse", in: 18, out: 0, balance: 18, note: "Opening Stock" },
    { id: "2", date: "2026-05-05", ref: "TRF-300", type: "Transfer", warehouse: "Karachi Transit Hub", in: 8, out: 0, balance: 26, note: "From Main Warehouse" },
    { id: "3", date: "2026-05-09", ref: "INV-9901", type: "Outward", warehouse: "Gulberg Outlet", in: 0, out: 2, balance: 24, note: "Customer Sale" },
  ],
  "REF-INV-HAI": [
    { id: "1", date: "2026-05-01", ref: "OPN-003", type: "Inward", warehouse: "Model Town Store", in: 12, out: 0, balance: 12, note: "Opening Stock" },
    { id: "2", date: "2026-05-06", ref: "GRN-2208", type: "Inward", warehouse: "Main Warehouse", in: 12, out: 0, balance: 24, note: "Haier Distributors" },
    { id: "3", date: "2026-05-07", ref: "ADJ-1003", type: "Adjustment", warehouse: "Model Town Store", in: 0, out: 1, balance: 23, note: "Damage" },
    { id: "4", date: "2026-05-08", ref: "TRF-301", type: "Transfer", warehouse: "Model Town Store", in: 5, out: 0, balance: 28, note: "From Main Warehouse" },
  ],
  "MOB-A55": [
    { id: "1", date: "2026-05-01", ref: "OPN-004", type: "Inward", warehouse: "Gulberg Outlet", in: 30, out: 0, balance: 30, note: "Opening Stock" },
    { id: "2", date: "2026-05-04", ref: "ADJ-1001", type: "Adjustment", warehouse: "Gulberg Outlet", in: 0, out: 1, balance: 29, note: "Theft" },
    { id: "3", date: "2026-05-07", ref: "INV-9890", type: "Outward", warehouse: "Gulberg Outlet", in: 0, out: 3, balance: 26, note: "Customer Sale" },
  ],
};

const TYPE_BADGE: Record<Entry["type"], string> = {
  Inward: "bg-success/15 text-success-foreground",
  Outward: "bg-warning/15 text-warning",
  Adjustment: "bg-muted text-muted-foreground",
  Transfer: "bg-primary/10 text-primary",
};

function ItemLedgerReport() {
  const [search, setSearch] = useState("");
  const [activeSku, setActiveSku] = useState(ITEMS[0].sku);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((i) => i.product.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }, [search]);

  const active = ITEMS.find((i) => i.sku === activeSku)!;
  const entries = LEDGER[activeSku] ?? [];
  const totalIn = entries.reduce((s, e) => s + e.in, 0);
  const totalOut = entries.reduce((s, e) => s + e.out, 0);
  const closing = entries[entries.length - 1]?.balance ?? active.opening;

  return (
    <AppShell>
      <PageHeader
        title="Item Ledger"
        description="Per-item transaction history with running stock balance across all warehouses."
        actions={
          <button className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30">
            <Download className="h-4 w-4" strokeWidth={1.75} /> Export Ledger
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Opening Balance" value={active.opening} icon={<KpiIcon icon={Package} />} tone="primary" />
        <StatCard label="Total Inward" value={totalIn} icon={<KpiIcon icon={ArrowDownLeft} />} tone="success" />
        <StatCard label="Total Outward" value={totalOut} icon={<KpiIcon icon={ArrowUpRight} />} tone="warning" />
        <StatCard label="Closing Balance" value={closing} icon={<KpiIcon icon={BookOpen} />} tone="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        <aside className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border max-h-[560px]">
            {filteredItems.map((it) => (
              <button
                key={it.sku}
                onClick={() => setActiveSku(it.sku)}
                className={`w-full text-left px-4 py-3 transition ${
                  activeSku === it.sku ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/30 border-l-4 border-transparent"
                }`}
              >
                <div className="font-semibold text-foreground text-[13px] truncate">{it.product}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{it.sku}</div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No items match.</div>
            )}
          </div>
        </aside>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/5">
            <h2 className="font-bold text-foreground tracking-tight">{active.product}</h2>
            <div className="text-[12px] text-muted-foreground font-mono mt-0.5">SKU: {active.sku}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Date</th>
                  <th className="text-left px-4 py-3 font-bold">Reference</th>
                  <th className="text-left px-4 py-3 font-bold">Type</th>
                  <th className="text-left px-4 py-3 font-bold">Warehouse</th>
                  <th className="text-right px-4 py-3 font-bold">In</th>
                  <th className="text-right px-4 py-3 font-bold">Out</th>
                  <th className="text-right px-4 py-3 font-bold">Balance</th>
                  <th className="text-left px-4 py-3 font-bold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">{e.date}</td>
                    <td className="px-4 py-3"><ActivityRefLink type={e.type} ref={e.ref} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 px-2 rounded-md text-[11px] font-bold items-center ${TYPE_BADGE[e.type]}`}>{e.type}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{e.warehouse}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-success-foreground">{e.in || "—"}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-warning">{e.out || "—"}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">{e.balance}</td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{e.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { ItemLedgerReport as ItemLedgerReportPage };

