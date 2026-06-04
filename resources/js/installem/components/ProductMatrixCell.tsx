import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Layers, Info, Package, CheckCircle2, AlertCircle, TrendingUp, Wallet, Calendar, Receipt, Settings, Plus, ArrowRight, FileQuestion } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fmtPKR, calcInstallment, type Plan as InstallmentPlan } from "@/lib/currency";
import { KpiIcons } from "@/components/kpi-icons";

const Rs = fmtPKR;

type Variant = { id?: string; name?: string; variant?: string; sku?: string; price?: number; product?: string; stock?: number; image?: string };
type Plan = InstallmentPlan & { status: string; applicable?: string };
type ProductLite = { name: string; image?: string; variants?: Variant[]; hasVariants?: boolean; inventory?: number };

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function Initial({ name, className = "" }: { name: string; className?: string }) {
  const ch = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold ${className}`}>
      {ch}
    </div>
  );
}

function Img({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  if (src) return <img src={src} alt={name} className={`object-cover ${className}`} />;
  return <Initial name={name} className={className} />;
}

export function ProductMatrixModal({ productName, productPrice, onClose }: { productName: string; productPrice: number; onClose: () => void }) {
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("__all__");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [view, setView] = useState<"single" | "compare">("single");
  // Live overrides (footer inputs). Reset whenever plan or variant changes.
  const [dpOverride, setDpOverride] = useState<number | null>(null);
  const [tenureOverride, setTenureOverride] = useState<number | null>(null);

  const product = useMemo<ProductLite | undefined>(() => {
    const products = readLS<ProductLite[]>("qcrm.products", []);
    return products.find((p) => p.name === productName);
  }, [productName]);

  // Merge inline product variants + standalone product-variants store
  const variants = useMemo<Variant[]>(() => {
    const inline = (product?.variants ?? []).map((v, idx) => ({
      id: `inline-${idx}`,
      name: v.name,
      variant: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      image: v.image,
      product: productName,
    }));
    const standalone = readLS<Variant[]>("qcrm.product-variants", []).filter((v) => v.product === productName);
    if (inline.length === 0) return standalone;
    if (standalone.length === 0) return inline;
    // Dedup by (variant||name)
    const seen = new Set(inline.map((v) => v.variant || v.name));
    return [...inline, ...standalone.filter((v) => !seen.has(v.variant || v.name))];
  }, [product, productName]);

  const plans = useMemo<Plan[]>(() => {
    return readLS<Plan[]>("qcrm.pricing", []).filter((p) => p.status === "Active");
  }, []);

  // Default plan selection
  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  // Auto-pick first in-stock variant if available, else stay on All
  useEffect(() => {
    if (selectedVariantKey === "__all__" && variants.length > 0) {
      const firstIn = variants.find((v) => Number(v.stock ?? 1) > 0);
      if (firstIn) setSelectedVariantKey((firstIn.variant || firstIn.name) as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants.length]);

  const activeVariant = variants.find((v) => (v.variant || v.name) === selectedVariantKey);
  const cashPrice = activeVariant?.price ?? productPrice;

  const totalStock = variants.length > 0
    ? variants.reduce((s, v) => s + Number(v.stock || 0), 0)
    : Number(product?.inventory ?? 0);
  const productOutOfStock = totalStock === 0 && (variants.length > 0 || product !== undefined);

  const activePlan = plans.find((p) => p.id === selectedPlanId);

  // Reset overrides when plan or variant changes
  useEffect(() => {
    setDpOverride(null);
    setTenureOverride(null);
  }, [selectedPlanId, selectedVariantKey]);

  // Effective plan with live overrides applied
  const effectivePlan = useMemo<Plan | undefined>(() => {
    if (!activePlan) return undefined;
    const next: Plan = { ...activePlan };
    if (dpOverride !== null) {
      next.downType = "Fixed";
      next.downPayment = dpOverride;
    }
    if (tenureOverride !== null && tenureOverride > 0) {
      next.tenure = tenureOverride;
    }
    return next;
  }, [activePlan, dpOverride, tenureOverride]);

  // Calculation (live, recomputes on plan/variant/override change)
  const calc = useMemo(() => {
    if (!effectivePlan) return null;
    return calcInstallment(cashPrice, effectivePlan);
  }, [effectivePlan, cashPrice]);

  const isOverridden = dpOverride !== null || tenureOverride !== null;

  // Track mousedown target so a drag that ends on the backdrop doesn't close the modal.
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    (e.currentTarget as any).__downOnBackdrop = e.target === e.currentTarget;
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && (e.currentTarget as any).__downOnBackdrop) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      style={{ fontFamily: '"Montserrat", ui-sans-serif, system-ui, sans-serif' }}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl border border-border overflow-hidden flex flex-col max-h-[92vh]"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <div className="relative px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Img src={product?.image ?? activeVariant?.image} name={productName} className="h-14 w-14 rounded-xl shrink-0 ring-2 ring-primary/20 shadow-md" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary/80 mb-1">Installment Matrix</div>
                <h3 className="font-bold text-foreground text-lg truncate uppercase tracking-wide">{productName}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {productOutOfStock ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      <AlertCircle className="h-3 w-3" /> Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      <CheckCircle2 className="h-3 w-3" /> {totalStock} In Stock
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted text-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    <Wallet className="h-3 w-3" /> Cash {Rs(cashPrice)}
                  </span>
                  {activeVariant && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      <Layers className="h-3 w-3" /> {activeVariant.variant || activeVariant.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center shrink-0 transition-colors" title="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Variant tabs */}
          {variants.length > 0 && (
            <div className="px-5 pt-3 pb-2.5 border-b border-border bg-muted/10">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5">Select Variant</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedVariantKey("__all__")}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                    selectedVariantKey === "__all__"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  All ({variants.length})
                </button>
                {variants.map((v, idx) => {
                  const key = (v.variant || v.name) as string;
                  const stock = Number(v.stock ?? 0);
                  const oos = stock === 0;
                  const noPrice = !Number(v.price);
                  const active = selectedVariantKey === key;
                  return (
                    <button
                      key={v.id ?? idx}
                      onClick={() => setSelectedVariantKey(key)}
                      disabled={oos}
                      title={oos ? "Out of stock" : noPrice ? "No price configured" : `${stock} available`}
                      className={`relative inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                        oos ? "opacity-50 cursor-not-allowed line-through" : noPrice ? "opacity-70" : ""
                      } ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      <Img src={v.image} name={key} className="h-4 w-4 rounded text-[9px]" />
                      <span>{key}</span>
                      {noPrice && !oos && (
                        <span className={`inline-flex items-center rounded-full px-1 py-0.5 text-[9px] font-bold ${
                          active ? "bg-white/20 text-primary-foreground" : "bg-warning/15 text-warning"
                        }`}>
                          No Price
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-1 py-0.5 text-[9px] font-bold ${
                        oos
                          ? "bg-destructive/15 text-destructive"
                          : stock <= 2
                          ? "bg-warning/15 text-warning"
                          : active
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-success/15 text-success"
                      }`}>
                        {oos ? "OOS" : `${stock}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Plan selector */}
          <div className="px-5 pt-3 pb-2.5 border-b border-border">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                {view === "single" ? "Select Installment Plan" : `Compare ${plans.length} Plans`}
              </div>
              {plans.length > 1 && (
                <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setView("single")}
                    className={`px-2 py-0.5 rounded-sm transition-colors ${view === "single" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setView("compare")}
                    className={`px-2 py-0.5 rounded-sm transition-colors inline-flex items-center gap-1 ${view === "compare" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Layers className="h-2.5 w-2.5" /> Compare
                  </button>
                </div>
              )}
            </div>
            {plans.length === 0 ? (
              <EmptyState
                icon={<Settings className="h-5 w-5" />}
                title="No installment plans configured"
                description="Pehle ek pricing plan banao — phir is product ka full installment matrix yahaan calculate hoga."
                cta={{ label: "Create Pricing Plan", to: "/catalog/pricing", icon: <Plus className="h-3.5 w-3.5" /> }}
                tone="warning"
              />
            ) : view === "compare" ? null : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {plans.map((p) => {
                  const active = selectedPlanId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`text-left rounded-md border px-2.5 py-1.5 transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-foreground truncate">{p.name}</span>
                        {active && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                      </div>
                      <div className="mt-0.5 text-[9px] text-muted-foreground flex flex-wrap gap-x-1.5">
                        <span>{p.tenure}mo</span>
                        <span>DP {p.downType === "%" ? `${p.downPayment}%` : Rs(p.downPayment)}</span>
                        <span>+{p.markup}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calculation breakdown */}
          {plans.length === 0 ? null : !cashPrice || cashPrice <= 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<FileQuestion className="h-5 w-5" />}
                title={activeVariant ? `"${activeVariant.variant || activeVariant.name}" ka cash price set nahi` : "Cash price configured nahi"}
                description="Installment matrix calculate karne ke liye retail (cash) price chahiye."
                cta={{ label: "Edit Pricing", to: "/catalog/products", icon: <ArrowRight className="h-3.5 w-3.5" /> }}
                tone="warning"
              />
            </div>
          ) : view === "compare" ? (
            <CompareTable plans={plans} cashPrice={cashPrice} selectedPlanId={selectedPlanId} onSelect={(id) => { setSelectedPlanId(id); setView("single"); }} />
          ) : calc && effectivePlan ? (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Left: Headline cards stacked 2x2 */}
              <div className="grid grid-cols-2 gap-2 content-start">
                <StatCard icon={<KpiIcons.wallet />} label="Pay Upfront" value={Rs(calc.upfront)} sub={`DP ${Rs(calc.dpAmount)} + Fee ${Rs(effectivePlan.fee)}`} tone="warning" />
                <StatCard icon={<KpiIcons.calendar />} label="Monthly EMI" value={Rs(calc.monthly)} sub={`for ${effectivePlan.tenure} months`} tone="primary" highlight />
                <StatCard icon={<KpiIcons.trendUp />} label="Yearly Outflow" value={Rs(calc.yearly)} sub={effectivePlan.tenure >= 12 ? "first 12 mo" : `${effectivePlan.tenure} × monthly`} tone="muted" />
                <StatCard icon={<KpiIcons.invoice />} label="Total Payable" value={Rs(calc.totalPayable)} sub={`+ ${Rs(calc.totalInterest)} vs cash`} tone="success" />
              </div>

              {/* Right: Detailed breakdown */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Full Breakdown
                </div>
                <table className="w-full text-[12px]">
                  <tbody className="divide-y divide-border">
                    <Row label="Cash Price" value={Rs(cashPrice)} />
                    <Row label={`Down Payment (${effectivePlan.downType === "%" ? `${effectivePlan.downPayment}%` : "Fixed"})`} value={Rs(calc.dpAmount)} />
                    <Row label="Financed" value={Rs(calc.financed)} muted />
                    <Row label={`Markup (${effectivePlan.markup}%)`} value={`+ ${Rs(calc.markupAmount)}`} muted />
                    <Row label="Total Financed" value={Rs(calc.totalFinanced)} />
                    <Row label={`Monthly EMI × ${effectivePlan.tenure}`} value={Rs(calc.monthly)} highlight />
                    <Row label="Processing Fee" value={Rs(effectivePlan.fee)} muted />
                    <Row label={`Late Fee / day (grace ${effectivePlan.graceDays}d)`} value={Rs(effectivePlan.penalty)} muted />
                    <Row label="Total Payable" value={Rs(calc.totalPayable)} bold />
                    <Row label="Extra vs Cash" value={`+ ${Rs(calc.totalInterest)}`} muted />
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<Calendar className="h-5 w-5" />}
                title="Select a plan to preview installments"
                description="Upar se koi plan choose karein — full breakdown yahaan generate hoga."
                tone="muted"
              />
            </div>
          )}
        </div>

        {/* ===== Sticky Footer with Live Recalc ===== */}
        <div className="border-t border-border bg-muted/40 backdrop-blur px-5 py-2.5">
          {calc && effectivePlan ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Live editable inputs */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
                  <Wallet className="h-3.5 w-3.5 text-warning shrink-0" />
                  <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">DP</label>
                  <input
                    type="number"
                    min={0}
                    max={cashPrice}
                    value={calc.dpAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDpOverride(isNaN(v) ? 0 : Math.max(0, Math.min(cashPrice, v)));
                    }}
                    className="w-24 bg-transparent text-xs font-bold text-foreground outline-none focus:ring-0"
                  />
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Tenure</label>
                  <button
                    onClick={() => setTenureOverride(Math.max(1, (tenureOverride ?? effectivePlan.tenure) - 1))}
                    className="h-5 w-5 rounded bg-muted hover:bg-muted-foreground/20 text-xs font-bold flex items-center justify-center"
                    type="button"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={effectivePlan.tenure}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTenureOverride(isNaN(v) || v < 1 ? 1 : Math.min(120, v));
                    }}
                    className="w-10 bg-transparent text-xs font-bold text-foreground outline-none text-center"
                  />
                  <button
                    onClick={() => setTenureOverride(Math.min(120, (tenureOverride ?? effectivePlan.tenure) + 1))}
                    className="h-5 w-5 rounded bg-muted hover:bg-muted-foreground/20 text-xs font-bold flex items-center justify-center"
                    type="button"
                  >+</button>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">mo</span>
                </div>
                {isOverridden && (
                  <button
                    onClick={() => { setDpOverride(null); setTenureOverride(null); }}
                    className="text-[10px] uppercase tracking-wider font-bold text-warning hover:text-warning/80 underline underline-offset-2"
                    type="button"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Live totals */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Upfront</span>
                  <span className="font-bold text-warning text-sm leading-tight">{Rs(calc.upfront)}</span>
                </div>
                <div className="h-7 w-px bg-border" />
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Monthly</span>
                  <span className="font-bold text-primary text-sm leading-tight">{Rs(calc.monthly)}</span>
                </div>
                <div className="h-7 w-px bg-border" />
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Total</span>
                  <span className="font-bold text-success text-sm leading-tight">{Rs(calc.totalPayable)}</span>
                </div>
                <button
                  onClick={onClose}
                  className="ml-2 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">No plan selected</span>
              <button onClick={onClose} className="rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-muted transition-colors">Close</button>
            </div>
          )}
          {isOverridden && (
            <div className="mt-1.5 text-[10px] text-warning/80 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Info className="h-2.5 w-2.5" /> Live override active — preview only, original plan untouched
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function CompareTable({ plans, cashPrice, selectedPlanId, onSelect }: { plans: Plan[]; cashPrice: number; selectedPlanId: string; onSelect: (id: string) => void }) {
  const rows = plans.map((p) => ({ plan: p, calc: calcInstallment(cashPrice, p) }));
  const cheapestMonthly = Math.min(...rows.map((r) => r.calc.monthly));
  const cheapestUpfront = Math.min(...rows.map((r) => r.calc.upfront));
  const cheapestTotal = Math.min(...rows.map((r) => r.calc.totalPayable));
  return (
    <div className="p-3 sm:p-5 space-y-3">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-3 sm:px-4 py-2.5 bg-muted/40 text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Plan Comparison · Cash Price {fmtPKR(cashPrice)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] sm:text-sm border-separate border-spacing-0">
            <thead className="bg-muted/20 text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-2 sm:px-3 py-2 font-semibold sticky left-0 bg-muted/40 z-10 min-w-[140px]">Plan</th>
                <th className="text-center px-2 sm:px-3 py-2 font-semibold whitespace-nowrap">Tenure</th>
                <th className="text-right px-2 sm:px-3 py-2 font-semibold whitespace-nowrap">Upfront</th>
                <th className="text-right px-2 sm:px-3 py-2 font-semibold whitespace-nowrap">Monthly</th>
                <th className="hidden md:table-cell text-right px-3 py-2 font-semibold whitespace-nowrap">Yearly</th>
                <th className="text-right px-2 sm:px-3 py-2 font-semibold whitespace-nowrap">Total</th>
                <th className="hidden lg:table-cell text-right px-3 py-2 font-semibold whitespace-nowrap">Extra Cost</th>
                <th className="text-right px-2 sm:px-3 py-2 font-semibold sticky right-0 bg-muted/40 z-10 w-[1%] whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ plan, calc }) => {
                const active = plan.id === selectedPlanId;
                const bestM = calc.monthly === cheapestMonthly;
                const bestU = calc.upfront === cheapestUpfront;
                const bestT = calc.totalPayable === cheapestTotal;
                const rowBg = active ? "bg-primary/5" : "hover:bg-muted/20";
                return (
                  <tr key={plan.id} className={rowBg}>
                    <td className={`px-2 sm:px-3 py-2.5 sticky left-0 z-10 ${active ? "bg-primary/5" : "bg-background"} border-r border-border/40`}>
                      <div className="font-bold text-foreground text-[12px] sm:text-[13px] truncate max-w-[160px]">{plan.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">DP {plan.downType === "%" ? `${plan.downPayment}%` : fmtPKR(plan.downPayment)} · +{plan.markup}%</div>
                    </td>
                    <td className="px-2 sm:px-3 py-2.5 text-center text-muted-foreground whitespace-nowrap tabular-nums">{plan.tenure} mo</td>
                    <td className="px-2 sm:px-3 py-2.5 text-right font-semibold whitespace-nowrap tabular-nums">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <span>{fmtPKR(calc.upfront)}</span>
                        {bestU && <span className="inline-flex items-center rounded-full bg-success/15 text-success text-[9px] font-bold px-1.5 py-0.5 uppercase">Best</span>}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <span className="font-bold text-primary">{fmtPKR(calc.monthly)}</span>
                        {bestM && <span className="inline-flex items-center rounded-full bg-success/15 text-success text-[9px] font-bold px-1.5 py-0.5 uppercase">Low</span>}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap tabular-nums">{fmtPKR(calc.yearly)}</td>
                    <td className="px-2 sm:px-3 py-2.5 text-right font-semibold whitespace-nowrap tabular-nums">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <span>{fmtPKR(calc.totalPayable)}</span>
                        {bestT && <span className="inline-flex items-center rounded-full bg-success/15 text-success text-[9px] font-bold px-1.5 py-0.5 uppercase">Cheap</span>}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2.5 text-right text-warning font-semibold whitespace-nowrap tabular-nums">+ {fmtPKR(calc.totalInterest)}</td>
                    <td className={`px-2 sm:px-3 py-2.5 text-right sticky right-0 z-10 ${active ? "bg-primary/5" : "bg-background"} border-l border-border/40`}>
                      <button
                        onClick={() => onSelect(plan.id)}
                        title="View details"
                        className="inline-flex items-center justify-center gap-1 rounded-md bg-primary text-primary-foreground h-7 px-2 sm:px-2.5 text-[11px] font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-[10px] sm:text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 px-1">
        <span>• <span className="text-success font-semibold">Low</span> = sab se kam monthly EMI</span>
        <span>• <span className="text-success font-semibold">Cheap</span> = sab se kam total payable</span>
        <span className="hidden sm:inline">• EMI 10 PKR ke nearest tak round-up hoti hai</span>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, cta, tone = "muted" }: { icon: React.ReactNode; title: string; description: string; cta?: { label: string; to: string; icon?: React.ReactNode }; tone?: "muted" | "warning" | "destructive" }) {
  const toneMap = {
    muted: { wrap: "border-border bg-muted/20", iconBg: "bg-muted text-muted-foreground" },
    warning: { wrap: "border-warning/30 bg-warning/5", iconBg: "bg-warning/15 text-warning" },
    destructive: { wrap: "border-destructive/30 bg-destructive/5", iconBg: "bg-destructive/15 text-destructive" },
  } as const;
  const t = toneMap[tone];
  return (
    <div className={`rounded-xl border border-dashed p-6 text-center flex flex-col items-center gap-3 ${t.wrap}`}>
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${t.iconBg}`}>{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">{description}</p>
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          {cta.icon} {cta.label}
        </Link>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone, highlight }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone: "primary" | "success" | "warning" | "muted"; highlight?: boolean }) {
  // Icon-only KPI styling: no ring, no bg pill around the icon — only the
  // glyph is tone-colored, matching the unified StatCard in ui-kit.
  const toneText: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    muted: "text-muted-foreground",
  };
  const toneBar: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    muted: "bg-muted-foreground/40",
  };
  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-card p-2.5 ${highlight ? "border-primary/40" : ""}`}>
      <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-1 ${toneBar[tone]} opacity-80`} />
      <div className={`flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold ${toneText[tone]} [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[1.75]`}>
        {icon} <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 text-base font-bold text-foreground leading-tight">{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function Row({ label, value, muted, bold, highlight }: { label: string; value: string; muted?: boolean; bold?: boolean; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-primary/5" : ""}>
      <td className={`px-3 py-1.5 text-[12px] ${muted ? "text-muted-foreground" : "text-foreground"}`}>{label}</td>
      <td className={`px-3 py-1.5 text-[12px] text-right ${bold || highlight ? "font-bold text-foreground" : muted ? "text-muted-foreground" : "font-semibold text-foreground"} ${highlight ? "text-primary" : ""}`}>{value}</td>
    </tr>
  );
}

export function ProductMatrixCell({ productName, productPrice }: { productName: string; productPrice: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title="View installment matrix"
      >
        <Eye className="h-4 w-4" />
      </button>
      {open && <ProductMatrixModal productName={productName} productPrice={productPrice} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ProductMatrixMenuAction({ productName, productPrice, close }: { productName: string; productPrice: number; close: () => void }) {
  return (
    <button
      onClick={() => {
        close();
        window.dispatchEvent(new CustomEvent("open-matrix", { detail: { productName, productPrice } }));
      }}
      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2"
    >
      <Layers className="h-3.5 w-3.5" /> View Matrix
    </button>
  );
}

export function MatrixModalHost() {
  const [data, setData] = useState<{ productName: string; productPrice: number } | null>(null);
  useEffect(() => {
    const handler = (e: Event) => setData((e as CustomEvent).detail);
    window.addEventListener("open-matrix", handler);
    return () => window.removeEventListener("open-matrix", handler);
  }, []);
  if (!data) return null;
  return <ProductMatrixModal productName={data.productName} productPrice={data.productPrice} onClose={() => setData(null)} />;
}
