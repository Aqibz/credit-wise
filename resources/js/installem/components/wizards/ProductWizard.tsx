import { useMemo, useState } from "react";
import { StepWizard, WField, WInput, WTextarea, WSelect, WGrid, WChips, WSwitch } from "@/components/StepWizard";
import { Trash2, Plus } from "lucide-react";

const CATEGORIES = ["Home Appliances", "Electronics", "Mobiles", "Furniture", "Motorcycles"];
const SUBCATS: Record<string, string[]> = {
  "Home Appliances": ["AC", "Refrigerator", "Washing Machine", "Microwave"],
  "Electronics": ["LED TV", "Audio", "Camera"],
  "Mobiles": ["Smartphone", "Tablet", "Accessories"],
  "Furniture": ["Sofa", "Bed", "Dining"],
  "Motorcycles": ["Bike", "Scooter"],
};
const BRANDS = ["Samsung", "Gree", "Haier", "Dawlance", "Sony", "Honda", "LG", "TCL", "PEL"];
const PRODUCT_TYPES = ["Simple", "Variable", "Bundle"];
const UNITS = ["PCS", "KG", "SET", "BOX", "LTR"];
const TAX_CLASSES = ["Standard 17%", "Reduced 5%", "Zero", "Exempt"];
const STATUSES = ["Active", "Inactive", "Draft"];
const SEASONS = ["All Season", "Winter", "Summer", "Spring", "Autumn", "Monsoon"];
const THEMES = ["None", "Eid Special", "Ramadan", "Back to School", "Wedding Season", "New Year", "Independence Day", "Black Friday", "Clearance", "New Arrivals"];
const WAREHOUSES = ["Main Warehouse", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town"];
const PLANS = ["3M Easy", "6M Standard", "9M Plus", "12M Easy", "18M Premium", "24M Premium", "36M Long"];
const ATTRIBUTES = ["Color", "Size", "RAM", "Storage", "Capacity"];
const ATTR_VALUES: Record<string, string[]> = {
  Color: ["White", "Black", "Silver", "Blue", "Red"],
  Size: ["1 Ton", "1.5 Ton", "2 Ton", "32\"", "43\"", "55\"", "65\""],
  RAM: ["4GB", "6GB", "8GB", "12GB"],
  Storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  Capacity: ["7kg", "9kg", "11kg", "13CFT", "15CFT"],
};

export function ProductWizard({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    name: initial?.name ?? "",
    sku: initial?.sku ?? `SKU-${Date.now().toString().slice(-6)}`,
    barcode: initial?.barcode ?? "",
    productType: initial?.productType ?? "Simple",
    brand: initial?.brand ?? "",
    category: initial?.category ?? "",
    subCategory: initial?.subCategory ?? "",
    collection: initial?.collection ?? "",
    season: initial?.season ?? "All Season",
    theme: initial?.theme ?? "None",
    shortDesc: initial?.shortDesc ?? "",
    status: initial?.status ?? "Active",
    // media
    primaryImage: initial?.primaryImage ?? "",
    gallery: initial?.gallery ?? [],
    videoUrl: initial?.videoUrl ?? "",
    // pricing
    cost: initial?.cost ?? 0,
    retail: initial?.retail ?? 0,
    sale: initial?.sale ?? 0,
    rental: initial?.rental ?? 0,
    taxClass: initial?.taxClass ?? "Standard 17%",
    currency: initial?.currency ?? "PKR",
    // inventory
    trackStock: initial?.trackStock ?? true,
    inventory: initial?.inventory ?? 0,
    reorder: initial?.reorder ?? 5,
    lowStockAlert: initial?.lowStockAlert ?? 3,
    unit: initial?.unit ?? "PCS",
    weight: initial?.weight ?? 0,
    dimensions: initial?.dimensions ?? "",
    warehouseStock: initial?.warehouseStock ?? [],
    warranty: initial?.warranty ?? "12",
    // variants
    hasVariants: initial?.hasVariants ?? false,
    selectedAttrs: initial?.selectedAttrs ?? [] as string[],
    attrValues: initial?.attrValues ?? {} as Record<string, string[]>,
    variants: initial?.variants ?? [],
    // installments
    installmentEnabled: initial?.installmentEnabled ?? true,
    plans: initial?.plans ?? ["6M Standard", "12M Easy"],
    downPayment: initial?.downPayment ?? 20,
    processingFee: initial?.processingFee ?? 1500,
    markup: initial?.markup ?? 18,
    cnicVerified: initial?.cnicVerified ?? true,
    guarantorRequired: initial?.guarantorRequired ?? true,
    // bundle
    bundleItems: initial?.bundleItems ?? [],
    // SEO
    slug: initial?.slug ?? "",
    metaTitle: initial?.metaTitle ?? "",
    metaDesc: initial?.metaDesc ?? "",
    tags: initial?.tags ?? [],
    featuredWeb: initial?.featuredWeb ?? false,
    featuredApp: initial?.featuredApp ?? false,
    // publish
    publishWeb: initial?.publishWeb ?? true,
    publishApp: initial?.publishApp ?? true,
    publishPos: initial?.publishPos ?? true,
  }));

  function set<K extends keyof typeof v>(k: K, val: any) { setV((p: any) => ({ ...p, [k]: val })); }

  // sync hasVariants with productType
  const isVariable = v.productType === "Variable";
  const isBundle = v.productType === "Bundle";

  // build EMI preview
  const emiPreview = useMemo(() => {
    const base = Number(v.sale || v.retail || 0);
    if (!base) return [];
    const dp = base * (Number(v.downPayment) / 100);
    const finance = base - dp;
    return v.plans.map((p: string) => {
      const m = parseInt(p);
      const total = finance * (1 + Number(v.markup) / 100);
      return { plan: p, months: m, monthly: Math.round(total / m), total: Math.round(total + dp), down: Math.round(dp) };
    });
  }, [v.plans, v.sale, v.retail, v.downPayment, v.markup]);

  function generateMatrix() {
    const attrs = v.selectedAttrs;
    if (attrs.length === 0) { setV((p: any) => ({ ...p, variants: [] })); return; }
    const lists: string[][] = attrs.map((a: string) => v.attrValues[a] || []);
    if (lists.some((l) => l.length === 0)) return;
    function combine(idx: number, current: Record<string, string>): Record<string, string>[] {
      if (idx === attrs.length) return [current];
      const out: Record<string, string>[] = [];
      for (const val of lists[idx]) out.push(...combine(idx + 1, { ...current, [attrs[idx]]: val }));
      return out;
    }
    const combos = combine(0, {});
    const rows = combos.map((c, i) => ({
      name: Object.values(c).join(" / "),
      attrs: c,
      sku: `${v.sku}-${i + 1}`,
      price: Number(v.retail || 0),
      stock: 0,
    }));
    setV((p: any) => ({ ...p, variants: rows, hasVariants: true }));
  }

  function toggleArr(key: string, val: string) {
    setV((p: any) => {
      const cur: string[] = p[key] ?? [];
      return { ...p, [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  }
  function setAttrValues(attr: string, val: string) {
    setV((p: any) => {
      const cur: string[] = p.attrValues[attr] ?? [];
      const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
      return { ...p, attrValues: { ...p.attrValues, [attr]: next } };
    });
  }

  const steps = [
    {
      key: "basic", title: "Basic Info", description: "Name, SKU, type & category",
      validate: () => !v.name ? "Product name is required" : !v.category ? "Category required" : null,
      render: () => (
        <WGrid>
          <WField label="Product Name" required full><WInput value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Gree 1.5 Ton Inverter AC" /></WField>
          <WField label="SKU" required><WInput value={v.sku} onChange={(e) => set("sku", e.target.value)} /></WField>
          <WField label="Barcode"><WInput value={v.barcode} onChange={(e) => set("barcode", e.target.value)} /></WField>
          <WField label="Product Type" required><WSelect value={v.productType} onChange={(x) => set("productType", x)} options={PRODUCT_TYPES} /></WField>
          <WField label="Brand"><WSelect value={v.brand} onChange={(x) => set("brand", x)} options={BRANDS} /></WField>
          <WField label="Category" required><WSelect value={v.category} onChange={(x) => { set("category", x); set("subCategory", ""); }} options={CATEGORIES} /></WField>
          <WField label="Sub-Category"><WSelect value={v.subCategory} onChange={(x) => set("subCategory", x)} options={SUBCATS[v.category] ?? []} /></WField>
          <WField label="Season"><WSelect value={v.season} onChange={(x) => set("season", x)} options={SEASONS} /></WField>
          <WField label="Theme / Occasion"><WSelect value={v.theme} onChange={(x) => set("theme", x)} options={THEMES} /></WField>
          <WField label="Status"><WSelect value={v.status} onChange={(x) => set("status", x)} options={STATUSES} /></WField>
          <WField label="Short Description" full><WTextarea value={v.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} placeholder="Quick selling description" /></WField>
        </WGrid>
      ),
    },
    {
      key: "media", title: "Media", description: "Primary image, gallery & video",
      render: () => (
        <WGrid>
          <WField label="Primary Image URL" full><WInput value={v.primaryImage} onChange={(e) => set("primaryImage", e.target.value)} placeholder="https://..." /></WField>
          <WField label="Video URL" full><WInput value={v.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="YouTube / Vimeo link" /></WField>
          <WField label="Gallery (one URL per line)" full>
            <WTextarea rows={4} value={(v.gallery || []).join("\n")} onChange={(e) => set("gallery", e.target.value.split("\n").filter(Boolean))} placeholder="https://image1.jpg&#10;https://image2.jpg" />
          </WField>
          {v.primaryImage && (
            <div className="sm:col-span-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Preview</div>
              <img src={v.primaryImage} alt="" className="h-32 w-32 object-cover rounded-lg border border-slate-200" onError={(e) => ((e.currentTarget.style.display = "none"))} />
            </div>
          )}
        </WGrid>
      ),
    },
    {
      key: "pricing", title: "Pricing", description: "Cost, MRP, sale price, tax",
      validate: () => !Number(v.retail) ? "MRP / retail price required" : null,
      render: () => {
        const margin = Number(v.cost) ? Math.round(((Number(v.sale || v.retail) - Number(v.cost)) / Number(v.sale || v.retail)) * 100) : 0;
        return (
          <WGrid>
            <WField label="Cost Price"><WInput type="number" value={v.cost} onChange={(e) => set("cost", Number(e.target.value))} /></WField>
            <WField label="MRP / Retail" required><WInput type="number" value={v.retail} onChange={(e) => set("retail", Number(e.target.value))} /></WField>
            <WField label="Sale Price"><WInput type="number" value={v.sale} onChange={(e) => set("sale", Number(e.target.value))} /></WField>
            <WField label="Installment Price (per mo, indicative)"><WInput type="number" value={v.rental} onChange={(e) => set("rental", Number(e.target.value))} /></WField>
            <WField label="Tax Class"><WSelect value={v.taxClass} onChange={(x) => set("taxClass", x)} options={TAX_CLASSES} /></WField>
            <WField label="Currency"><WSelect value={v.currency} onChange={(x) => set("currency", x)} options={["PKR", "USD"]} /></WField>
            <div className="sm:col-span-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
              <span className="text-slate-500">Auto Margin:</span> <span className="font-semibold text-emerald-600">{margin}%</span>
            </div>
          </WGrid>
        );
      },
    },
    {
      key: "inventory", title: "Inventory", description: "Stock, units, weight",
      render: () => (
        <div className="space-y-4">
          <WSwitch checked={v.trackStock} onChange={(c) => set("trackStock", c)} label="Track stock for this product" hint="Disable for services or bundles only" />
          <WGrid>
            <WField label="Opening Stock"><WInput type="number" value={v.inventory} onChange={(e) => set("inventory", Number(e.target.value))} /></WField>
            <WField label="Reorder Level"><WInput type="number" value={v.reorder} onChange={(e) => set("reorder", Number(e.target.value))} /></WField>
            <WField label="Low Stock Alert At"><WInput type="number" value={v.lowStockAlert} onChange={(e) => set("lowStockAlert", Number(e.target.value))} /></WField>
            <WField label="Unit"><WSelect value={v.unit} onChange={(x) => set("unit", x)} options={UNITS} /></WField>
            <WField label="Weight (kg)"><WInput type="number" value={v.weight} onChange={(e) => set("weight", Number(e.target.value))} /></WField>
            <WField label="Dimensions (LxWxH cm)"><WInput value={v.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="80x40x60" /></WField>
            <WField label="Warranty (months)"><WInput value={v.warranty} onChange={(e) => set("warranty", e.target.value)} /></WField>
          </WGrid>
          <WField label="Stock per Warehouse" full>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500"><tr><th className="text-left px-3 py-2">Warehouse</th><th className="text-left px-3 py-2 w-32">Qty</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {WAREHOUSES.map((w) => {
                    const row = v.warehouseStock.find((x: any) => x.warehouse === w);
                    return (
                      <tr key={w}>
                        <td className="px-3 py-2 font-medium">{w}</td>
                        <td className="px-3 py-2">
                          <WInput type="number" value={row?.qty ?? 0} onChange={(e) => {
                            const q = Number(e.target.value);
                            const next = v.warehouseStock.filter((x: any) => x.warehouse !== w);
                            next.push({ warehouse: w, qty: q });
                            set("warehouseStock", next);
                          }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </WField>
        </div>
      ),
    },
    {
      key: "variants", title: "Variants & Attributes", description: "Generate matrix from attributes",
      hidden: !isVariable,
      render: () => (
        <div className="space-y-4">
          <WField label="Pick Attributes" full hint="Choose which attributes vary across this product">
            <WChips value={v.selectedAttrs} onToggle={(x) => toggleArr("selectedAttrs", x)} options={ATTRIBUTES} />
          </WField>
          {v.selectedAttrs.map((a: string) => (
            <WField key={a} label={`${a} values`} full>
              <WChips value={v.attrValues[a] ?? []} onToggle={(x) => setAttrValues(a, x)} options={ATTR_VALUES[a] ?? []} />
            </WField>
          ))}
          <button type="button" onClick={generateMatrix} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Generate Variant Matrix
          </button>
          {v.variants.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500"><tr><th className="text-left px-3 py-2">Variant</th><th className="text-left px-3 py-2">SKU</th><th className="text-left px-3 py-2 w-28">Price</th><th className="text-left px-3 py-2 w-24">Stock</th><th className="px-2 w-10"></th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {v.variants.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2"><WInput value={row.sku} onChange={(e) => { const n = v.variants.slice(); n[i] = { ...n[i], sku: e.target.value }; set("variants", n); }} /></td>
                      <td className="px-3 py-2"><WInput type="number" value={row.price} onChange={(e) => { const n = v.variants.slice(); n[i] = { ...n[i], price: Number(e.target.value) }; set("variants", n); }} /></td>
                      <td className="px-3 py-2"><WInput type="number" value={row.stock} onChange={(e) => { const n = v.variants.slice(); n[i] = { ...n[i], stock: Number(e.target.value) }; set("variants", n); }} /></td>
                      <td className="px-2"><button onClick={() => set("variants", v.variants.filter((_: any, k: number) => k !== i))} className="text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "installments", title: "Installment Plans", description: "EMI options & eligibility",
      render: () => (
        <div className="space-y-4">
          <WSwitch checked={v.installmentEnabled} onChange={(c) => set("installmentEnabled", c)} label="Available on installments" hint="Customers can buy this product on EMI" />
          {v.installmentEnabled && (
            <>
              <WField label="Applicable Plans" full>
                <WChips value={v.plans} onToggle={(x) => toggleArr("plans", x)} options={PLANS} />
              </WField>
              <WGrid>
                <WField label="Down Payment %"><WInput type="number" value={v.downPayment} onChange={(e) => set("downPayment", Number(e.target.value))} /></WField>
                <WField label="Processing Fee"><WInput type="number" value={v.processingFee} onChange={(e) => set("processingFee", Number(e.target.value))} /></WField>
                <WField label="Markup %"><WInput type="number" value={v.markup} onChange={(e) => set("markup", Number(e.target.value))} /></WField>
              </WGrid>
              <div className="flex flex-wrap gap-3">
                <WSwitch checked={v.cnicVerified} onChange={(c) => set("cnicVerified", c)} label="CNIC verification required" />
                <WSwitch checked={v.guarantorRequired} onChange={(c) => set("guarantorRequired", c)} label="Guarantor required" />
              </div>
              {emiPreview.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">EMI Preview</div>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500"><tr><th className="text-left px-3 py-2">Plan</th><th className="text-left px-3 py-2">Months</th><th className="text-left px-3 py-2">Down</th><th className="text-left px-3 py-2">Monthly</th><th className="text-left px-3 py-2">Total</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {emiPreview.map((r: any) => (
                          <tr key={r.plan}>
                            <td className="px-3 py-2 font-medium">{r.plan}</td>
                            <td className="px-3 py-2">{r.months}</td>
                            <td className="px-3 py-2">Rs. {r.down.toLocaleString()}</td>
                            <td className="px-3 py-2 font-semibold text-primary">Rs. {r.monthly.toLocaleString()}</td>
                            <td className="px-3 py-2 font-semibold">Rs. {r.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "bundle", title: "Bundle Components", description: "Pick component products",
      hidden: !isBundle,
      render: () => (
        <BundleEditor items={v.bundleItems} onChange={(b) => set("bundleItems", b)} />
      ),
    },
    {
      key: "seo", title: "SEO & Tags", description: "Slug, meta & search tags",
      render: () => (
        <div className="space-y-4">
          <WGrid>
            <WField label="Slug"><WInput value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder="gree-15-ton-inverter-ac" /></WField>
            <WField label="Meta Title"><WInput value={v.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></WField>
          </WGrid>
          <WField label="Meta Description" full><WTextarea value={v.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} /></WField>
          <WField label="Search Tags" full hint="Comma separated">
            <WInput value={(v.tags || []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="ac, inverter, gree, 1.5ton" />
          </WField>
          <div className="flex flex-wrap gap-3">
            <WSwitch checked={v.featuredWeb} onChange={(c) => set("featuredWeb", c)} label="Featured on Website" />
            <WSwitch checked={v.featuredApp} onChange={(c) => set("featuredApp", c)} label="Featured in Mobile App" />
          </div>
        </div>
      ),
    },
    {
      key: "publish", title: "Review & Publish", description: "Confirm and choose channels",
      render: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <WSwitch checked={v.publishWeb} onChange={(c) => set("publishWeb", c)} label="Publish to Website" />
            <WSwitch checked={v.publishApp} onChange={(c) => set("publishApp", c)} label="Publish to Mobile App" />
            <WSwitch checked={v.publishPos} onChange={(c) => set("publishPos", c)} label="Available at POS" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              ["Name", v.name], ["SKU", v.sku], ["Type", v.productType], ["Brand", v.brand || "—"],
              ["Category", `${v.category}${v.subCategory ? " / " + v.subCategory : ""}`],
              ["Cost", `Rs. ${Number(v.cost).toLocaleString()}`],
              ["Retail", `Rs. ${Number(v.retail).toLocaleString()}`],
              ["Sale", `Rs. ${Number(v.sale).toLocaleString()}`],
              ["Stock", String(v.inventory)],
              ["Variants", String(v.variants.length)],
              ["Installments", v.installmentEnabled ? `${v.plans.length} plans` : "Disabled"],
              ["Tags", (v.tags || []).join(", ") || "—"],
            ].map(([k, val]) => (
              <div key={k as string} className="flex justify-between gap-4 border-b border-slate-200/70 py-1">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-800 text-right truncate">{val}</dd>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <StepWizard
      title="Product"
      subtitle="Catalog item with variants, pricing & installment configuration"
      isEdit={isEdit}
      steps={steps}
      onClose={onClose}
      onSave={() => {
        // ensure hasVariants flag mirrors variants length
        const final = { ...v, hasVariants: v.variants.length > 0 };
        onSubmit(final);
      }}
      pageMode={pageMode}
    />
  );
}

function BundleEditor({ items, onChange }: { items: any[]; onChange: (i: any[]) => void }) {
  const [form, setForm] = useState({ product: "", qty: 1 });
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <WInput placeholder="Product name / SKU" value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} />
        <WInput type="number" placeholder="Qty" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))} />
        <button type="button" onClick={() => { if (form.product) { onChange([...items, { ...form, id: Date.now() }]); setForm({ product: "", qty: 1 }); } }} className="h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Add Item</button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">Bundle is empty.</div>
      ) : (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500"><tr><th className="text-left px-3 py-2">Product</th><th className="text-left px-3 py-2 w-24">Qty</th><th className="px-3 py-2 w-20"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-3 py-2 font-medium">{it.product}</td>
                  <td className="px-3 py-2">{it.qty}</td>
                  <td className="px-3 py-2 text-right"><button onClick={() => onChange(items.filter((x) => x.id !== it.id))} className="text-rose-600 text-xs font-semibold hover:underline">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
