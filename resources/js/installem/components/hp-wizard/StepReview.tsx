import { Section, Field, Info, Summary, Rs, inputCls, type Cheque, type Guarantor } from "./shared";
import { Badge } from "@/components/ui-kit";

type Props = {
  customerName: string; customerCnic: string;
  customer: any; newCustomer: { phone: string };
  product: any; variant: any; qty: number;
  effectiveTotal: number; down: number; profitPct: number;
  financed: number; tenure: number; monthly: number; startDate: string;
  cheques: Cheque[]; guarantorList: Guarantor[];
  notes: string; setNotes: (v: string) => void; ref: string;
};

export default function StepReview({
  customerName, customerCnic, customer, newCustomer, product, variant, qty,
  effectiveTotal, down, profitPct, financed, tenure, monthly, startDate,
  cheques, guarantorList, notes, setNotes, ref,
}: Props) {
  return (
    <Section title="Notes & Review" hint="Final review before saving the case.">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <Summary title="Customer">
            <Info k="Name" v={customerName || "—"} />
            <Info k="CNIC" v={customerCnic || "—"} />
            <Info k="Phone" v={customer?.phone || newCustomer.phone || "—"} />
          </Summary>
          <Summary title="Product">
            <Info k="Item" v={product?.name || "—"} />
            <Info k="Variant" v={variant?.name || variant?.sku || "—"} />
            <Info k="Quantity" v={String(qty)} />
            <Info k="Unit Price" v={Rs(variant?.price || product?.retail)} />
          </Summary>
          <Summary title="Finance">
            <Info k="Total Price" v={Rs(effectiveTotal)} />
            <Info k="Down Payment" v={Rs(down)} />
            <Info k="Profit %" v={`${profitPct}%`} />
            <Info k="Total Financed" v={Rs(financed)} />
            <Info k="Tenure" v={`${tenure} months`} />
            <Info k="Monthly EMI" v={Rs(monthly)} />
            <Info k="Start Date" v={startDate} />
          </Summary>
          <Summary title="Cheques & Guarantors">
            <Info k="Cheques" v={`${cheques.length} attached`} />
            <Info k="Guarantors" v={`${guarantorList.length} added`} />
          </Summary>
        </div>
        <div className="space-y-4">
          <Field label="Internal Notes">
            <textarea rows={6} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any approvals, conditions or remarks…" />
          </Field>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Case Reference</div>
            <div className="text-2xl font-bold text-primary">{ref}</div>
            <div className="text-xs text-muted-foreground mt-1">Will be saved with status <Badge tone="warning">Pending</Badge></div>
          </div>
        </div>
      </div>
    </Section>
  );
}
