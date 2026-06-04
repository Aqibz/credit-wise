import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, X, Search, Building2, CalendarDays, Package } from "lucide-react";
import { toast } from "sonner";
import { useEntityStore } from "@/lib/useEntityStore";
import { openingStockConfig, productsConfig, warehousesConfig } from "@/lib/entities";
import {
  useOpeningSaveMode,
  type OpeningSaveMode,
} from "@/components/OpeningSaveMode";

type OpeningRow = {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  date: string;
  qty: number;
  cost?: number;
  notes?: string;
};

type ProductRow = { id: string; name: string; sku: string; cost?: number };

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Bulk Opening Stock entry: pick a warehouse + as-of date, then post quantities
 * for many products at once. Honors the global Overwrite/Adjust setting and
 * lets the user override it per-batch.
 */
export function OpeningStockBulkPost() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 transition"
      >
        <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
        Post Opening Stock
      </button>
      {open && <BulkPostDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function BulkPostDialog({ onClose }: { onClose: () => void }) {
  const products = useEntityStore<any>(productsConfig.storageKey, productsConfig.seed as any[]).items;
  const warehouses = useEntityStore<any>(warehousesConfig.storageKey, warehousesConfig.seed as any[]).items;
  const opening = useEntityStore<OpeningRow>(
    openingStockConfig.storageKey,
    openingStockConfig.seed as OpeningRow[],
  );

  const [globalMode] = useOpeningSaveMode();
  const [mode, setMode] = useState<OpeningSaveMode>(globalMode);
  const [warehouse, setWarehouse] = useState<string>(warehouses[0]?.name ?? "");
  const [date, setDate] = useState<string>(todayISO());
  const [search, setSearch] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, string>>({});

  // Flatten products → rows (variants count too, since each variant = its own SKU).
  const rows = useMemo<ProductRow[]>(() => {
    const out: ProductRow[] = [];
    products.forEach((p: any) => {
      if (Array.isArray(p.variants) && p.variants.length) {
        p.variants.forEach((v: any) =>
          out.push({ id: `${p.id}:${v.sku}`, name: `${p.name} — ${v.name}`, sku: v.sku, cost: p.cost }),
        );
      } else {
        out.push({ id: p.id, name: p.name, sku: p.sku, cost: p.cost });
      }
    });
    return out;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q));
  }, [rows, search]);

  // Existing opening qty for the chosen warehouse keyed by SKU.
  const existingBySku = useMemo(() => {
    const m = new Map<string, OpeningRow>();
    opening.items.forEach((e) => {
      if (e.warehouse === warehouse) m.set(e.sku, e);
    });
    return m;
  }, [opening.items, warehouse]);

  const entered = Object.entries(qtyMap).filter(([, v]) => v.trim() !== "" && Number(v) !== 0);

  const handlePost = () => {
    if (!warehouse) { toast.error("Pick a warehouse first"); return; }
    if (entered.length === 0) { toast.error("Enter quantity for at least one product"); return; }

    let created = 0;
    let updated = 0;
    for (const [sku, raw] of entered) {
      const row = rows.find((r) => r.sku === sku);
      if (!row) continue;
      const enteredQty = Number(raw);
      const existing = existingBySku.get(sku);
      if (existing) {
        const nextQty = mode === "delta" ? Number(existing.qty || 0) + enteredQty : enteredQty;
        opening.update(existing.id, { qty: nextQty, date });
        updated++;
      } else {
        opening.create({
          product: row.name,
          sku: row.sku,
          warehouse,
          date,
          qty: enteredQty,
          cost: row.cost ?? 0,
        } as Omit<OpeningRow, "id">);
        created++;
      }
    }

    toast.success("Opening stock posted", {
      description: `${warehouse} • ${created} created, ${updated} updated (${mode === "delta" ? "adjusted" : "overwritten"}).`,
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Post opening stock"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground tracking-tight">Post Opening Stock</h2>
            <p className="text-[12px] text-muted-foreground">
              Pick a warehouse and enter starting quantities for one or more products.
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Warehouse / Branch
            </span>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {warehouses.length === 0 && <option value="">— No warehouses —</option>}
              {warehouses.map((w: any) => (
                <option key={w.id} value={w.name}>{w.name} {w.code ? `(${w.code})` : ""}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> As of Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <div className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Apply mode</span>
            <div role="radiogroup" aria-label="Apply mode" className="mt-1 inline-flex h-10 w-full rounded-lg border border-border bg-background p-0.5 text-[12px] font-semibold">
              {(["overwrite", "delta"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md transition ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {m === "overwrite" ? "Overwrite" : "Adjust (±)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or SKU…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground inline-flex flex-col items-center gap-2 w-full">
              <Package className="h-6 w-6" /> No products match.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-bold">Product</th>
                  <th className="text-left px-4 py-2 font-bold">SKU</th>
                  <th className="text-right px-4 py-2 font-bold">Current</th>
                  <th className="text-right px-4 py-2 font-bold w-32">{mode === "delta" ? "Delta (±)" : "New Qty"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const cur = existingBySku.get(r.sku);
                  return (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2 font-semibold text-foreground">{r.name}</td>
                      <td className="px-4 py-2 font-mono text-[12px] text-muted-foreground">{r.sku}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">{cur ? cur.qty : "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={qtyMap[r.sku] ?? ""}
                          onChange={(e) => setQtyMap((m) => ({ ...m, [r.sku]: e.target.value }))}
                          placeholder={mode === "delta" ? "0" : ""}
                          className="w-24 h-8 px-2 text-right rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
          <div className="text-[12px] text-muted-foreground">
            {entered.length} product{entered.length === 1 ? "" : "s"} ready to post
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={entered.length === 0 || !warehouse}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post to Stock
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
