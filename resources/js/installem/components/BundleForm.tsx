import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Check, Tag, Calendar, Percent, Search, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { productVariantsConfig, productsConfig, pricingPlansConfig } from "@/lib/entities";
import { useEntityStore } from "@/lib/useEntityStore";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type Variant = { id: string; product: string; variant: string; sku: string; price: number; stock?: number };
type Product = { id: string; name: string; category?: string; brand?: string };
type Plan = { id: string; name: string };

type BundleItem = { variantId: string; product: string; variant: string; sku: string; category: string; price: number; qty: number };

export function BundleForm({
  initial,
  onClose,
  onSubmit,
  isEdit,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
}) {
  const { items: allVariants } = useEntityStore<Variant>("qcrm.product-variants", productVariantsConfig.seed as any);
  const { items: allProducts } = useEntityStore<Product>("qcrm.products", productsConfig.seed as any);
  const { items: allPlans } = useEntityStore<Plan>("qcrm.pricing", pricingPlansConfig.seed as any);

  const productCategoryMap = useMemo(() => {
    const m = new Map<string, string>();
    allProducts.forEach((p) => m.set(p.name, p.category || "Other"));
    return m;
  }, [allProducts]);

  const variantsByCategory = useMemo(() => {
    const map = new Map<string, Variant[]>();
    allVariants.forEach((v) => {
      const cat = productCategoryMap.get(v.product) || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(v);
    });
    return map;
  }, [allVariants, productCategoryMap]);

  const allCategories = Array.from(variantsByCategory.keys()).sort();

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    code: initial?.code ?? `BND-${Date.now().toString().slice(-5)}`,
    description: initial?.description ?? "",
    status: initial?.status ?? "Active",
    items: (initial?.items ?? []) as BundleItem[],
    bundlePrice: initial?.bundlePrice ?? 0,
    // Limited time
    limitedTime: initial?.limitedTime ?? false,
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    // Discount targets
    applyOnCash: initial?.applyOnCash ?? true,
    applyOnInstallment: initial?.applyOnInstallment ?? false,
    eligiblePlans: (initial?.eligiblePlans ?? []) as string[],
  });

  const [openCats, setOpenCats] = useState<Set<string>>(new Set([allCategories[0]].filter(Boolean) as string[]));
  const [search, setSearch] = useState("");

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleCategory(cat: string) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const itemMap = useMemo(() => {
    const m = new Map<string, BundleItem>();
    form.items.forEach((i) => m.set(i.variantId, i));
    return m;
  }, [form.items]);

  function toggleVariant(v: Variant) {
    const cat = productCategoryMap.get(v.product) || "Other";
    if (itemMap.has(v.id)) {
      set("items", form.items.filter((i) => i.variantId !== v.id));
    } else {
      set("items", [...form.items, { variantId: v.id, product: v.product, variant: v.variant, sku: v.sku, category: cat, price: v.price, qty: 1 }]);
    }
  }

  function updateQty(variantId: string, qty: number) {
    set("items", form.items.map((i) => i.variantId === variantId ? { ...i, qty: Math.max(1, qty) } : i));
  }

  function removeItem(variantId: string) {
    set("items", form.items.filter((i) => i.variantId !== variantId));
  }

  const mrp = form.items.reduce((s, i) => s + i.price * i.qty, 0);
  const saving = Math.max(0, mrp - Number(form.bundlePrice || 0));
  const savingPct = mrp > 0 ? Math.round((saving / mrp) * 100) : 0;

  // Auto-set bundle price = MRP when first items added (only when fresh)
  useEffect(() => {
    if (!isEdit && Number(form.bundlePrice) === 0 && mrp > 0) {
      set("bundlePrice", mrp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrp]);

  const filteredCategories = allCategories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (cat.toLowerCase().includes(q)) return true;
    return (variantsByCategory.get(cat) || []).some((v) => v.variant.toLowerCase().includes(q) || v.product.toLowerCase().includes(q));
  });

  function togglePlan(name: string) {
    set("eligiblePlans", form.eligiblePlans.includes(name) ? form.eligiblePlans.filter((p) => p !== name) : [...form.eligiblePlans, name]);
  }

  function handleSubmit() {
    if (!form.name.trim()) { alert("Bundle name is required"); return; }
    if (form.items.length === 0) { alert("Select at least one product variant"); return; }
    const categories = Array.from(new Set(form.items.map((i) => i.category)));
    onSubmit({
      ...form,
      mrp,
      saving,
      category: categories.join(", "),
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-5xl border border-border overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{isEdit ? "Edit Bundle" : "Create Bundle"}</h2>
              <p className="text-xs text-muted-foreground">Multi-category combo with optional discount</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic info */}
          <section>
            <SectionHeader icon={<Tag className="h-4 w-4" />} title="Bundle Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Bundle Name" required>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Wedding Combo" />
              </Field>
              <Field label="Bundle Code">
                <Input value={form.code} onChange={(e) => set("code", e.target.value)} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={["Active", "Inactive", "Draft"]} />
              </Field>
              <Field label="Description" full>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Short description..." />
              </Field>
            </div>
          </section>

          {/* Product picker */}
          <section>
            <SectionHeader icon={<Layers className="h-4 w-4" />} title="Pick Products from Categories" />

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories or variants..." className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm" />
            </div>

            <div className="border border-border rounded-lg divide-y divide-border max-h-80 overflow-y-auto">
              {filteredCategories.map((cat) => {
                const variants = variantsByCategory.get(cat) || [];
                const isOpen = openCats.has(cat);
                const selectedCount = variants.filter((v) => itemMap.has(v.id)).length;
                return (
                  <div key={cat}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-semibold text-sm text-foreground">{cat}</span>
                        <span className="text-xs text-muted-foreground">({variants.length})</span>
                        {selectedCount > 0 && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">{selectedCount} selected</span>
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="bg-muted/20 px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {variants.map((v) => {
                          const checked = itemMap.has(v.id);
                          return (
                            <label key={v.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${checked ? "bg-primary/10 border border-primary/30" : "bg-background border border-border hover:border-primary/30"}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleVariant(v)} className="h-4 w-4 accent-primary" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">{v.variant}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{v.product} · {v.sku}</div>
                              </div>
                              <div className="text-xs font-semibold text-foreground whitespace-nowrap">{Rs(v.price)}</div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches found.</div>
              )}
            </div>
          </section>

          {/* Selected items */}
          {form.items.length > 0 && (
            <section>
              <SectionHeader icon={<Check className="h-4 w-4" />} title={`Selected Items (${form.items.length})`} />
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Variant</th>
                      <th className="text-left px-3 py-2 font-semibold">Category</th>
                      <th className="text-left px-3 py-2 font-semibold">Unit Price</th>
                      <th className="text-left px-3 py-2 font-semibold w-24">Qty</th>
                      <th className="text-left px-3 py-2 font-semibold">Subtotal</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {form.items.map((it) => (
                      <tr key={it.variantId}>
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{it.variant}</div>
                          <div className="text-[11px] text-muted-foreground">{it.product}</div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{it.category}</td>
                        <td className="px-3 py-2 font-medium">{Rs(it.price)}</td>
                        <td className="px-3 py-2">
                          <input type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.variantId, Number(e.target.value))} className="w-16 h-8 px-2 rounded-md border border-border bg-background text-sm" />
                        </td>
                        <td className="px-3 py-2 font-semibold text-foreground">{Rs(it.price * it.qty)}</td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => removeItem(it.variantId)} className="h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive flex items-center justify-center">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 font-semibold">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right">MRP Total:</td>
                      <td colSpan={2} className="px-3 py-2 text-foreground">{Rs(mrp)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Pricing & discount */}
          <section>
            <SectionHeader icon={<Percent className="h-4 w-4" />} title="Bundle Pricing & Discount" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Field label="MRP Total (Auto)">
                <Input value={Rs(mrp)} disabled />
              </Field>
              <Field label="Bundle Price (Rs.)" required>
                <Input type="number" value={form.bundlePrice} onChange={(e) => set("bundlePrice", Number(e.target.value))} />
              </Field>
              <Field label="Customer Saving">
                <div className="h-10 px-3 rounded-lg border border-border bg-success/10 text-success font-semibold flex items-center justify-between">
                  <span>{Rs(saving)}</span>
                  <span className="text-xs">{savingPct}% off</span>
                </div>
              </Field>
            </div>

            {/* Limited time */}
            <div className="rounded-lg border border-border p-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.limitedTime} onChange={(e) => set("limitedTime", e.target.checked)} className="h-4 w-4 accent-primary" />
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Limited Time Offer</span>
                <span className="text-xs text-muted-foreground">Discount only valid between selected dates</span>
              </label>
              {form.limitedTime && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Start Date"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
                  <Field label="End Date"><Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
                </div>
              )}
            </div>

            {/* Apply on */}
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Discount Applies On</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors ${form.applyOnCash ? "bg-primary/10 border-primary/40" : "border-border hover:border-primary/30"}`}>
                  <input type="checkbox" checked={form.applyOnCash} onChange={(e) => set("applyOnCash", e.target.checked)} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium">💵 Cash Payment</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors ${form.applyOnInstallment ? "bg-primary/10 border-primary/40" : "border-border hover:border-primary/30"}`}>
                  <input type="checkbox" checked={form.applyOnInstallment} onChange={(e) => set("applyOnInstallment", e.target.checked)} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium">💳 Installment</span>
                </label>
              </div>

              {form.applyOnInstallment && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Eligible Pricing Plans</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allPlans.map((p) => {
                      const active = form.eligiblePlans.includes(p.name);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlan(p.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                        >
                          {active && <Check className="inline h-3 w-3 mr-1" />}
                          {p.name}
                        </button>
                      );
                    })}
                    {allPlans.length === 0 && <p className="text-xs text-muted-foreground">No plans defined yet.</p>}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {form.items.length} items · MRP {Rs(mrp)} · Saving <span className="text-success font-semibold">{Rs(saving)} ({savingPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="button" onClick={handleSubmit} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              {isEdit ? "Save Bundle" : "Create Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted disabled:text-muted-foreground" />;
}

function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <select {...props} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
