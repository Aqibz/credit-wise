import { Section, Field, Info, Rs, inputCls } from "./shared";

type Props = {
  products: any[]; productId: string; setProductId: (v: string) => void;
  variants: any[]; variantSku: string; setVariantSku: (v: string) => void;
  qty: number; setQty: (v: number) => void;
  product: any; variant: any; basePrice: number;
};

export default function StepProduct({ products, productId, setProductId, variants, variantSku, setVariantSku, qty, setQty, product, variant, basePrice }: Props) {
  return (
    <Section title="Product & Variant" hint="Choose the item being financed.">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Product" required>
          <select value={productId} onChange={(e) => { setProductId(e.target.value); setVariantSku(""); }} className={inputCls}>
            <option value="">— Select Product —</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} • {p.brand || p.category}</option>
            ))}
          </select>
        </Field>
        {variants.length > 0 ? (
          <Field label="Variant">
            <select value={variantSku} onChange={(e) => setVariantSku(e.target.value)} className={inputCls}>
              <option value="">— Select Variant —</option>
              {variants.map((v: any) => (
                <option key={v.sku} value={v.sku}>{v.name || v.sku} — {Rs(v.price)} • Stock {v.stock ?? 0}</option>
              ))}
            </select>
          </Field>
        ) : <div />}
        <Field label="Quantity">
          <input type="number" min={1} className={inputCls} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
        </Field>
        <div />
        {product && (
          <div className="md:col-span-2 rounded-lg border border-border bg-muted/30 p-4 grid sm:grid-cols-4 gap-3">
            <Info k="Brand" v={product.brand || "—"} />
            <Info k="Category" v={product.category || "—"} />
            <Info k="SKU" v={variant?.sku || product.sku || "—"} />
            <Info k="Unit Price" v={Rs(variant?.price || product.retail)} />
            <Info k="Available Stock" v={String(variant?.stock ?? product.inventory ?? "—")} />
            <Info k="Quantity" v={String(qty)} />
            <Info k="Line Total" v={Rs(basePrice)} />
          </div>
        )}
      </div>
    </Section>
  );
}
