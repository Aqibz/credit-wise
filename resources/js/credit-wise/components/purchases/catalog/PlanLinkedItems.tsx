import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Layers, FileText, Download, Printer, Package, AlertCircle, CheckCircle2, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, TrendingUp, Calendar, Wallet, Receipt, Maximize2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { fmtPKR, calcInstallment, type Plan as InstallmentPlan } from "@/lib/formatters/currency";

type Plan = InstallmentPlan & { name: string; applicable?: string; status?: string };
type Variant = { name?: string; sku?: string; price?: number; stock?: number; image?: string };
type Product = { id: string; name: string; brand?: string; category?: string; retail?: number; image?: string; inventory?: number; hasVariants?: boolean; variants?: Variant[]; status?: string };

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type Row = {
  product: string;
  brand: string;
  category: string;
  variant: string;
  sku: string;
  image?: string;
  cashPrice: number;
  dp: number;
  monthly: number;
  total: number;
  extra: number;
  stock: number;
  oos: boolean;
};

type SortKey = "product" | "cashPrice" | "monthly" | "total" | "stock";
type SortDir = "asc" | "desc";

export function PlanLinkedItemsModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "oos">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "monthly", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { setProducts(readLS<Product[]>("qcrm.products", [])); }, []);

  const allRows = useMemo<Row[]>(() => {
    const applicable = plan.applicable || "All Products";
    const matched = products.filter((p) => applicable === "All Products" || p.category === applicable);
    const out: Row[] = [];
    matched.forEach((p) => {
      const variants = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants
        : [{ name: "Default", sku: p.id, price: p.retail, stock: p.inventory, image: p.image }];
      variants.forEach((v) => {
        const cash = Number(v.price || p.retail || 0);
        if (cash <= 0) return;
        const calc = calcInstallment(cash, plan);
        const stock = Number(v.stock ?? p.inventory ?? 0);
        out.push({
          product: p.name,
          brand: p.brand || "—",
          category: p.category || "—",
          variant: v.name || "Default",
          sku: v.sku || "—",
          image: v.image || p.image,
          cashPrice: cash,
          dp: calc.dpAmount,
          monthly: calc.monthly,
          total: calc.totalPayable,
          extra: calc.totalInterest,
          stock,
          oos: stock === 0,
        });
      });
    });
    return out;
  }, [products, plan]);

  const categories = useMemo(() => Array.from(new Set(allRows.map((r) => r.category))).sort(), [allRows]);

  const rows = useMemo(() => {
    let r = allRows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.product.toLowerCase().includes(q) || x.variant.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q) || x.brand.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") r = r.filter((x) => statusFilter === "oos" ? x.oos : !x.oos);
    if (categoryFilter !== "all") r = r.filter((x) => x.category === categoryFilter);
    const dir = sort.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return r;
  }, [allRows, search, statusFilter, categoryFilter, sort]);

  // Reset to page 1 whenever filters/sort/page-size change
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, rows.length);
  const pagedRows = useMemo(() => rows.slice(pageStart, pageEnd), [rows, pageStart, pageEnd]);

  const stats = useMemo(() => {
    const live = allRows.filter((r) => !r.oos).length;
    const units = allRows.reduce((s, r) => s + r.stock, 0);
    const cashSum = allRows.reduce((s, r) => s + r.cashPrice, 0);
    const monthlyAvg = allRows.length ? Math.round(allRows.reduce((s, r) => s + r.monthly, 0) / allRows.length) : 0;
    const minM = allRows.length ? Math.min(...allRows.map((r) => r.monthly)) : 0;
    const maxM = allRows.length ? Math.max(...allRows.map((r) => r.monthly)) : 0;
    return { total: allRows.length, live, oos: allRows.length - live, units, cashSum, monthlyAvg, minM, maxM };
  }, [allRows]);

  const toggleSort = (key: SortKey) => {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };
  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sort.dir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  const exportCsv = () => {
    const header = ["Product", "Brand", "Category", "Variant", "SKU", "Cash Price (Rs.)", "Down Payment (Rs.)", "Monthly EMI (Rs.)", "Total Payable (Rs.)", "Extra Cost (Rs.)", "Stock", "Status"];
    const lines = [header.join(",")].concat(
      rows.map((r) => [r.product, r.brand, r.category, r.variant, r.sku, r.cashPrice, r.dp, r.monthly, r.total, r.extra, r.stock, r.oos ? "Out of Stock" : "Live"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${plan.name.replace(/\s+/g, "-")}-linked-items.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    const styles = `
      <style>
        *{box-sizing:border-box}
        body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;padding:32px;color:#0f172a;margin:0;}
        .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:16px;margin-bottom:20px;}
        .brand{font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6;}
        h1{font-size:22px;margin:4px 0 6px;font-weight:800;}
        .sub{color:#64748b;font-size:12px;}
        .meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
        .chip{background:#f1f5f9;padding:6px 12px;border-radius:9999px;font-size:11px;font-weight:600;}
        .chip.p{background:#dbeafe;color:#1e40af;}
        .chip.s{background:#dcfce7;color:#166534;}
        .chip.w{background:#fef3c7;color:#92400e;}
        .chip.d{background:#fee2e2;color:#991b1b;}
        table{width:100%;border-collapse:collapse;font-size:11px;}
        thead th{background:#0f172a;color:#fff;text-align:left;padding:10px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;}
        thead th.r{text-align:right;}
        tbody td{padding:8px;border-bottom:1px solid #e2e8f0;}
        tbody tr:nth-child(even){background:#f8fafc;}
        td.r{text-align:right;font-variant-numeric:tabular-nums;}
        .pname{font-weight:700;}
        .pmeta{color:#64748b;font-size:10px;}
        .badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:700;text-transform:uppercase;}
        .badge.live{background:#dcfce7;color:#166534;}
        .badge.oos{background:#fee2e2;color:#991b1b;}
        .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#64748b;display:flex;justify-content:space-between;}
        @media print{ body{padding:16px;} }
      </style>`;
    const tbody = rows.map((r) => `
      <tr>
        <td><div class="pname">${r.product}</div><div class="pmeta">${r.brand} · ${r.category}</div></td>
        <td>${r.variant}<div class="pmeta" style="font-family:monospace">${r.sku}</div></td>
        <td class="r">Rs. ${r.cashPrice.toLocaleString()}</td>
        <td class="r">Rs. ${r.dp.toLocaleString()}</td>
        <td class="r"><strong>Rs. ${r.monthly.toLocaleString()}</strong></td>
        <td class="r">Rs. ${r.total.toLocaleString()}</td>
        <td class="r" style="color:#ea580c">+ Rs. ${r.extra.toLocaleString()}</td>
        <td class="r">${r.stock}</td>
        <td><span class="badge ${r.oos ? "oos" : "live"}">${r.oos ? "Out of Stock" : "Live"}</span></td>
      </tr>`).join("");
    win.document.write(`
      <html><head><title>${plan.name} — Linked Items</title>${styles}</head>
      <body>
        <div class="head">
          <div>
            <div class="brand">Pricing Plan · Linked Items</div>
            <h1>${plan.name}</h1>
            <div class="sub">${plan.applicable || "All Products"} · ${plan.tenure} months tenure</div>
          </div>
          <div style="text-align:right;font-size:10px;color:#64748b;">
            <div style="font-weight:700;color:#0f172a;font-size:13px;">CreditWise</div>
            <div>${new Date().toLocaleString()}</div>
          </div>
        </div>
        <div class="meta">
          <span class="chip p">DP ${plan.downType === "%" ? `${plan.downPayment}%` : `Rs. ${Number(plan.downPayment).toLocaleString()}`}</span>
          <span class="chip p">Markup +${plan.markup}%</span>
          <span class="chip">Fee Rs. ${Number(plan.fee).toLocaleString()}</span>
          <span class="chip">Late Rs. ${Number(plan.penalty).toLocaleString()}/day</span>
          <span class="chip">Grace ${plan.graceDays}d</span>
          <span class="chip s">${stats.live} Live</span>
          <span class="chip d">${stats.oos} OOS</span>
          <span class="chip w">${rows.length} Variants</span>
        </div>
        <table>
          <thead><tr>
            <th>Product</th><th>Variant / SKU</th>
            <th class="r">Cash</th><th class="r">Down Payment</th><th class="r">Monthly EMI</th>
            <th class="r">Total Payable</th><th class="r">Extra Cost</th>
            <th class="r">Stock</th><th>Status</th>
          </tr></thead>
          <tbody>${tbody}</tbody>
        </table>
        <div class="footer">
          <span>Generated by CreditWise · ${new Date().toLocaleString()}</span>
          <span>${rows.length} of ${stats.total} variants shown</span>
        </div>
        <script>window.onload = () => { setTimeout(() => window.print(), 200); };</script>
      </body></html>`);
    win.document.close();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-7xl border border-border overflow-hidden flex flex-col max-h-[94vh]" onClick={(e) => e.stopPropagation()}>
        {/* ===== Header ===== */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center shrink-0 shadow-lg shadow-primary/30">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Pricing Plan · Linked Variants</div>
                <h3 className="font-bold text-foreground text-xl truncate leading-tight">{plan.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] font-bold uppercase tracking-wider">
                  <Chip tone="muted">{plan.applicable || "All Products"}</Chip>
                  <Chip tone="primary"><Calendar className="h-2.5 w-2.5" /> {plan.tenure} mo</Chip>
                  <Chip tone="warning"><Wallet className="h-2.5 w-2.5" /> DP {plan.downType === "%" ? `${plan.downPayment}%` : fmtPKR(plan.downPayment)}</Chip>
                  <Chip tone="success"><TrendingUp className="h-2.5 w-2.5" /> +{plan.markup}% markup</Chip>
                  <Chip tone="muted"><Receipt className="h-2.5 w-2.5" /> Fee {fmtPKR(plan.fee)}</Chip>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              <button onClick={printPdf} className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                <Printer className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button onClick={onClose} className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center" title="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== Stats strip ===== */}
        <div className="px-6 py-3 border-b border-border bg-muted/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Stat icon={<Package className="h-3.5 w-3.5" />} label="Variants" value={String(stats.total)} tone="primary" />
          <Stat icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Live" value={String(stats.live)} tone="success" />
          <Stat icon={<AlertCircle className="h-3.5 w-3.5" />} label="Out of Stock" value={String(stats.oos)} tone="destructive" />
          <Stat icon={<Maximize2 className="h-3.5 w-3.5" />} label="Total Units" value={String(stats.units)} tone="muted" />
          <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Avg Monthly" value={fmtPKR(stats.monthlyAvg)} tone="primary" />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="EMI Range" value={stats.total ? `${fmtPKR(stats.minM)} – ${fmtPKR(stats.maxM)}` : "—"} tone="warning" small />
        </div>

        {/* ===== Toolbar ===== */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap bg-background">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, variant, SKU, brand…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5 text-[11px] font-bold">
            {(["all", "live", "oos"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-md transition-colors uppercase tracking-wider ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s === "all" ? `All (${stats.total})` : s === "live" ? `Live (${stats.live})` : `OOS (${stats.oos})`}
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background h-9 px-2.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div className="ml-auto text-[11px] text-muted-foreground font-semibold">
            Showing <span className="text-foreground font-bold">{rows.length}</span> of {stats.total}
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="flex-1 overflow-auto">
          {rows.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-foreground">No matching variants</p>
              <p className="text-xs mt-1">{allRows.length === 0 ? `No products with cash price configured for "${plan.applicable || "All Products"}".` : "Try adjusting search or filters."}</p>
            </div>
          ) : (
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="bg-muted/60 backdrop-blur sticky top-0 z-10">
                <tr className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  <SortHeader label="Product" k="product" sort={sort} onClick={toggleSort} align="left" />
                  <th className="text-left px-3 py-3 border-b border-border">Variant / SKU</th>
                  <th className="text-left px-3 py-3 border-b border-border">Category</th>
                  <SortHeader label="Cash" k="cashPrice" sort={sort} onClick={toggleSort} align="right" />
                  <th className="text-right px-3 py-3 border-b border-border">Down Payment</th>
                  <SortHeader label="Monthly EMI" k="monthly" sort={sort} onClick={toggleSort} align="right" />
                  <SortHeader label="Total Payable" k="total" sort={sort} onClick={toggleSort} align="right" />
                  <th className="text-right px-3 py-3 border-b border-border">Extra Cost</th>
                  <SortHeader label="Stock" k="stock" sort={sort} onClick={toggleSort} align="center" />
                  <th className="text-center px-3 py-3 border-b border-border">Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((r, i) => (
                  <tr key={i} className={`group transition-colors ${r.oos ? "bg-destructive/[0.025] hover:bg-destructive/[0.06]" : "hover:bg-primary/[0.03]"} ${i % 2 === 1 && !r.oos ? "bg-muted/[0.15]" : ""}`}>
                    <td className="px-4 py-3 border-b border-border/60">
                      <div className="flex items-center gap-2.5 min-w-[200px]">
                        {r.image ? (
                          <img src={r.image} alt={r.product} className="h-9 w-9 rounded-md object-cover border border-border shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {r.product.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className={`font-bold text-foreground text-sm ${r.oos ? "line-through opacity-70" : ""}`}>{r.product}</div>
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{r.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-border/60">
                      <div className="text-xs font-semibold text-foreground">{r.variant}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{r.sku}</div>
                    </td>
                    <td className="px-3 py-3 border-b border-border/60">
                      <span className="inline-flex items-center rounded-full bg-muted text-foreground text-[10px] font-semibold px-2 py-0.5">{r.category}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-foreground border-b border-border/60 tabular-nums">{fmtPKR(r.cashPrice)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-warning border-b border-border/60 tabular-nums">{fmtPKR(r.dp)}</td>
                    <td className="px-3 py-3 text-right border-b border-border/60 tabular-nums">
                      <div className="font-bold text-primary text-sm">{fmtPKR(r.monthly)}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">per month</div>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-foreground border-b border-border/60 tabular-nums">{fmtPKR(r.total)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-warning border-b border-border/60 tabular-nums">+ {fmtPKR(r.extra)}</td>
                    <td className="px-3 py-3 text-center border-b border-border/60">
                      <span className={`inline-flex items-center gap-1 rounded-md text-[11px] font-bold px-2 py-0.5 ${r.oos ? "bg-destructive/15 text-destructive" : r.stock <= 2 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.oos ? "bg-destructive" : r.stock <= 2 ? "bg-warning" : "bg-success"}`} />
                        {r.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center border-b border-border/60">
                      <span className={`inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${r.oos ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                        {r.oos ? "Out of Stock" : "Live"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {rows.length > 0 && (
                <tfoot className="bg-muted/40 sticky bottom-0">
                  <tr className="text-[11px] font-bold text-foreground">
                    <td className="px-4 py-3 border-t-2 border-border" colSpan={3}>
                      Totals · {rows.length} variant{rows.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums border-t-2 border-border">{fmtPKR(rows.reduce((s, r) => s + r.cashPrice, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums border-t-2 border-border text-warning">{fmtPKR(rows.reduce((s, r) => s + r.dp, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums border-t-2 border-border text-primary">{fmtPKR(rows.reduce((s, r) => s + r.monthly, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums border-t-2 border-border">{fmtPKR(rows.reduce((s, r) => s + r.total, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums border-t-2 border-border text-warning">+ {fmtPKR(rows.reduce((s, r) => s + r.extra, 0))}</td>
                    <td className="px-3 py-3 text-center border-t-2 border-border">{rows.reduce((s, r) => s + r.stock, 0)}</td>
                    <td className="px-3 py-3 border-t-2 border-border" />
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {/* ===== Footer with Pagination ===== */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-foreground tabular-nums">
              {rows.length === 0 ? "0" : `${pageStart + 1}–${pageEnd}`} <span className="text-muted-foreground font-normal">of {rows.length}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="uppercase tracking-wider font-bold">Rows</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 rounded-md border border-border bg-background px-1.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span className="hidden md:inline">EMI rounded up to nearest Rs. 10</span>
          </div>
          <div className="flex items-center gap-1">
            <PageBtn disabled={currentPage <= 1} onClick={() => setPage(1)} title="First page"><ChevronsLeft className="h-3.5 w-3.5" /></PageBtn>
            <PageBtn disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} title="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></PageBtn>
            <span className="px-2 text-[11px] font-bold text-foreground tabular-nums">
              {currentPage} <span className="text-muted-foreground font-normal">/ {totalPages}</span>
            </span>
            <PageBtn disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} title="Next page"><ChevronRight className="h-3.5 w-3.5" /></PageBtn>
            <PageBtn disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)} title="Last page"><ChevronsRight className="h-3.5 w-3.5" /></PageBtn>
            <button onClick={onClose} className="ml-2 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-muted transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PageBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-7 w-7 grid place-items-center rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

function SortHeader({ label, k, sort, onClick, align }: { label: string; k: SortKey; sort: { key: SortKey; dir: SortDir }; onClick: (k: SortKey) => void; align: "left" | "right" | "center" }) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <th className={`px-3 py-3 border-b border-border text-${align}`}>
      <button
        onClick={() => onClick(k)}
        className={`inline-flex items-center gap-1 ${justify} w-full hover:text-primary transition-colors ${active ? "text-primary" : ""}`}
      >
        {label}
        <Icon className={`h-3 w-3 ${active ? "text-primary" : "opacity-40"}`} />
      </button>
    </th>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "primary" | "success" | "warning" | "muted" }) {
  const map: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    muted: "bg-muted text-foreground",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${map[tone]}`}>{children}</span>;
}

function Stat({ icon, label, value, tone, small }: { icon: React.ReactNode; label: string; value: string; tone: "primary" | "success" | "destructive" | "muted" | "warning"; small?: boolean }) {
  const map: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    muted: "bg-muted text-foreground border-border",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${map[tone]}`}>
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold opacity-80">{icon} {label}</div>
      <div className={`font-bold leading-tight mt-0.5 text-foreground ${small ? "text-xs" : "text-base"}`}>{value}</div>
    </div>
  );
}

export function PlanLinkedItemsAction({ plan, close }: { plan: any; close: () => void }) {
  return (
    <button
      onClick={() => {
        close();
        window.dispatchEvent(new CustomEvent("open-plan-linked", { detail: { plan } }));
      }}
      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2"
    >
      <Layers className="h-3.5 w-3.5" /> View Linked Items
    </button>
  );
}

export function PlanLinkedItemsHost() {
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    const handler = (e: Event) => setPlan((e as CustomEvent).detail.plan);
    window.addEventListener("open-plan-linked", handler);
    return () => window.removeEventListener("open-plan-linked", handler);
  }, []);
  if (!plan) return null;
  return <PlanLinkedItemsModal plan={plan} onClose={() => setPlan(null)} />;
}
