import { ReactNode, useMemo, useState } from "react";
import { Boxes, Layers, Tag, Plus, Pencil, Trash2, Search, Calendar, Percent, CreditCard, Wallet, Package, Clock, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { BundleForm } from "@/components/BundleForm";
import { useEntityStore } from "@/lib/useEntityStore";
import { bundlesConfig } from "@/lib/entities";
import { KpiIcons } from "@/components/kpi-icons";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type Bundle = {
  id: string;
  name: string;
  code: string;
  category: string;
  mrp: number;
  bundlePrice: number;
  status: string;
  applyOnCash?: boolean;
  applyOnInstallment?: boolean;
  eligiblePlans?: string[];
  limitedTime?: boolean;
  startDate?: string;
  endDate?: string;
  items?: { variantId: string; product: string; variant: string; sku: string; category: string; price: number; qty: number }[];
};

export function BundlesOffersView({ headerSlot }: { headerSlot?: ReactNode }) {
  const { items, create, update, remove } = useEntityStore<Bundle>("qcrm.bundles", bundlesConfig.seed as any);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let r = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
    }
    if (statusFilter === "active") r = r.filter((x) => x.status === "Active");
    if (statusFilter === "inactive") r = r.filter((x) => x.status !== "Active");
    return r;
  }, [items, query, statusFilter]);

  const totalSavings = items.reduce((s, b) => s + Math.max(0, Number(b.mrp || 0) - Number(b.bundlePrice || 0)), 0);
  const activeCount = items.filter((b) => b.status === "Active").length;
  const ltCount = items.filter((b) => b.limitedTime).length;
  const avgItems = items.length ? (items.reduce((s, b) => s + (b.items?.length || 0), 0) / items.length).toFixed(1) : "0";

  return (
    <>
      <PageHeader
        title="Bundles & Offers"
        description="Group variants into sellable bundles with optional time-limited discounts and channel rules."
        actions={
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Bundle
          </button>
        }
      />
      {headerSlot}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Bundles" value={items.length} icon={<KpiIcons.inventory />} tone="primary" />
        <StatCard label="Active" value={activeCount} icon={<KpiIcons.success />} tone="success" />
        <StatCard label="Limited Time" value={ltCount} icon={<KpiIcons.clock />} tone="warning" />
        <StatCard label="Avg Items / Bundle" value={avgItems} icon={<KpiIcons.inventory />} tone="primary" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bundles by name, code, category…"
            className="w-full h-10 pl-9 pr-3 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="inline-flex items-center text-[11px] font-bold rounded-lg bg-muted p-1 gap-0.5">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md uppercase tracking-wider transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "All" : s === "active" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-muted-foreground">
          Total Savings: <span className="font-bold text-success">{Rs(totalSavings)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
          <Boxes className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No bundles found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or create a new bundle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              onEdit={() => { setEditing(b); setShowForm(true); }}
              onDelete={() => { if (confirm(`Delete bundle "${b.name}"?`)) remove(b.id); }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <BundleForm
          initial={editing || undefined}
          isEdit={!!editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={(values) => {
            if (editing) update(editing.id, values as any);
            else create(values as any);
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function BundleCard({ bundle, onEdit, onDelete }: { bundle: Bundle; onEdit: () => void; onDelete: () => void }) {
  const save = Math.max(0, Number(bundle.mrp || 0) - Number(bundle.bundlePrice || 0));
  const pct = Number(bundle.mrp) > 0 ? Math.round((save / Number(bundle.mrp)) * 100) : 0;
  const isActive = bundle.status === "Active";
  const cats = String(bundle.category || "").split(",").map((c) => c.trim()).filter(Boolean);
  const items = bundle.items || [];

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <Boxes className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[14.5px] font-bold text-foreground leading-tight truncate">{bundle.name}</h3>
                {pct > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold px-1.5 py-0.5">
                    <Percent className="h-2.5 w-2.5" /> {pct}% OFF
                  </span>
                )}
              </div>
              <span className="text-[10.5px] text-muted-foreground font-mono uppercase tracking-wider">{bundle.code}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-muted-foreground"}`} />
            {bundle.status || "Inactive"}
          </span>
        </div>

        {/* Categories */}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {cats.map((c, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing grid */}
      <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60">
        <PriceCell label="MRP" value={Rs(bundle.mrp)} muted strike />
        <PriceCell label="Bundle Price" value={Rs(bundle.bundlePrice)} accent />
        <PriceCell label="You Save" value={Rs(save)} success />
      </div>

      {/* Items list */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Package className="h-3.5 w-3.5" /> Includes
          </span>
          <span className="text-[11px] font-semibold text-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>
        {items.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground italic">No items configured.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.slice(0, 3).map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-5 w-5 shrink-0 rounded bg-muted text-muted-foreground grid place-items-center text-[10px] font-bold">{it.qty}×</span>
                  <span className="truncate font-medium text-foreground">{it.product}</span>
                </div>
                <span className="text-muted-foreground shrink-0 text-[11px]">{Rs(it.price)}</span>
              </li>
            ))}
            {items.length > 3 && (
              <li className="text-[11px] text-muted-foreground pl-7">+ {items.length - 3} more</li>
            )}
          </ul>
        )}
      </div>

      {/* Offer rules */}
      <div className="px-4 py-3 border-t border-border/60 bg-muted/30 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          <Sparkles className="h-3.5 w-3.5" /> Offer Rules
        </div>
        <RuleRow
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Cash"
          on={!!bundle.applyOnCash}
          extra={bundle.applyOnCash ? "Applies on full cash purchase" : "Disabled"}
        />
        <RuleRow
          icon={<CreditCard className="h-3.5 w-3.5" />}
          label="Installment"
          on={!!bundle.applyOnInstallment}
          extra={bundle.applyOnInstallment ? `${bundle.eligiblePlans?.length || 0} plan(s) eligible` : "Disabled"}
        />
        <RuleRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Limited Time"
          on={!!bundle.limitedTime}
          extra={bundle.limitedTime ? `${bundle.startDate || "—"} → ${bundle.endDate || "—"}` : "Always available"}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/60">
        <button
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-md border border-border bg-background text-[12px] font-semibold hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-background text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete bundle"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PriceCell({ label, value, muted, accent, success, strike }: { label: string; value: string; muted?: boolean; accent?: boolean; success?: boolean; strike?: boolean }) {
  const tone = accent ? "text-foreground" : success ? "text-success" : "text-muted-foreground";
  return (
    <div className="px-3 py-2.5 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</div>
      <div className={`mt-0.5 text-[13.5px] font-bold ${tone} ${strike ? "line-through opacity-70" : ""}`}>{value}</div>
    </div>
  );
}

function RuleRow({ icon, label, on, extra }: { icon: ReactNode; label: string; on: boolean; extra: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11.5px]">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`grid place-items-center h-5 w-5 rounded ${on ? "bg-success/15 text-success" : "bg-muted text-muted-foreground/70"}`}>
          {on ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        </span>
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <span className={`truncate text-right ${on ? "text-foreground/80" : "text-muted-foreground"}`}>{extra}</span>
    </div>
  );
}
