import { useMemo, useState } from "react";
import {
  CalendarRange,
  Wallet,
  Percent,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Tag,
  Calculator,
} from "lucide-react";
import { WInput, WTextarea, WSelect, WSwitch, WChips } from "@/components/StepWizard";
import {
  FormCard,
  FormSection,
  FormRow,
  FormRowFull,
  FormRowDouble,
  FieldPair,
  FieldTriple,
} from "@/components/forms/SideForm";

const APPLIES_TO = [
  "Home Appliances",
  "Electronics",
  "Mobiles",
  "Motorcycles",
  "Furniture",
  "Generators",
];
const STATUSES = ["Active", "Inactive", "Draft"];
const PRICING_MODEL = [
  "Flat Markup",
  "Reducing Balance",
  "Tenure-Tiered Rate",
  "Zero Markup (0%)",
];
const RATE_BASIS = ["Per Annum", "Per Month", "Flat over Tenure"];
const DOWN_POLICY = ["Mandatory", "Optional", "Not Allowed"];
const DOWN_TYPE = ["% of Cash Price", "Fixed Amount"];
const PENALTY_TYPE = ["Per Day (Rs.)", "Flat Per Miss (Rs.)", "Percent of EMI (%)"];
const APPROVAL_LEVEL = ["Auto-Approve", "Branch Manager", "Regional Manager", "Head Office"];
const GUARANTORS = ["None", "1 Guarantor", "2 Guarantors"];
const BILLING_CYCLE = ["Monthly", "Bi-Weekly", "Weekly", "Quarterly"];

type TierRow = { id: string; tenure: number; rate: number };

export function InstallmentPlanWizard({
  initial,
  onClose,
  onSubmit,
  isEdit,
  pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    // Plan Info
    name: initial?.name ?? "",
    code: initial?.code ?? "",
    applicable: initial?.applicable ?? ["Home Appliances"],
    status: initial?.status ?? "Active",
    billingCycle: initial?.billingCycle ?? "Monthly",
    notes: initial?.notes ?? "",

    // Tenure
    tenureMode: initial?.tenureMode ?? "Fixed", // Fixed | Range | Tiered
    tenure: initial?.tenure ?? 12,
    tenureMin: initial?.tenureMin ?? 6,
    tenureMax: initial?.tenureMax ?? 24,
    tiers: (initial?.tiers as TierRow[]) ?? [
      { id: "t1", tenure: 6, rate: 8 },
      { id: "t2", tenure: 12, rate: 14 },
      { id: "t3", tenure: 18, rate: 20 },
    ],

    // Down Payment
    downPolicy: initial?.downPolicy ?? "Mandatory",
    downType: initial?.downType ?? "% of Cash Price",
    downMin: initial?.downMin ?? 20,
    downMax: initial?.downMax ?? 50,
    firstEmiAsDown: initial?.firstEmiAsDown ?? false,

    // Pricing
    pricingModel: initial?.pricingModel ?? "Flat Markup",
    rateBasis: initial?.rateBasis ?? "Flat over Tenure",
    markup: initial?.markup ?? 18,

    // Fees & Penalty
    processingFee: initial?.processingFee ?? 1500,
    processingFeeType: initial?.processingFeeType ?? "Fixed",
    documentationFee: initial?.documentationFee ?? 500,
    penaltyType: initial?.penaltyType ?? "Per Day (Rs.)",
    penalty: initial?.penalty ?? 100,
    graceDays: initial?.graceDays ?? 3,
    earlySettlementDiscount: initial?.earlySettlementDiscount ?? 5,

    // Eligibility & Approval
    minFinance: initial?.minFinance ?? 20000,
    maxFinance: initial?.maxFinance ?? 500000,
    guarantor: initial?.guarantor ?? "1 Guarantor",
    approvalLevel: initial?.approvalLevel ?? "Branch Manager",
    cnicRequired: initial?.cnicRequired ?? true,
    incomeProofRequired: initial?.incomeProofRequired ?? false,
  }));

  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof v>(k: K, val: any) {
    setV((p: any) => ({ ...p, [k]: val }));
  }

  function toggleApplicable(opt: string) {
    const cur: string[] = v.applicable;
    set("applicable", cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  }

  function addTier() {
    set("tiers", [
      ...v.tiers,
      { id: String(Date.now()), tenure: 12, rate: 15 },
    ]);
  }
  function updateTier(id: string, patch: Partial<TierRow>) {
    set("tiers", v.tiers.map((t: TierRow) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function removeTier(id: string) {
    set("tiers", v.tiers.filter((t: TierRow) => t.id !== id));
  }

  // Live preview: sample financing on Rs. 100,000
  const preview = useMemo(() => {
    const cashPrice = 100000;
    const downPct = v.downType === "% of Cash Price" ? Number(v.downMin) : (Number(v.downMin) / cashPrice) * 100;
    const downAmt = v.downPolicy === "Not Allowed" ? 0 : (cashPrice * downPct) / 100;
    const financed = cashPrice - downAmt;
    const tenure = v.tenureMode === "Fixed" ? Number(v.tenure) : v.tenureMode === "Range" ? Number(v.tenureMin) : Number(v.tiers[0]?.tenure ?? 12);
    const rate = v.tenureMode === "Tiered" ? Number(v.tiers[0]?.rate ?? 0) : Number(v.markup);
    const profit = (financed * rate) / 100;
    const total = financed + profit;
    let emiCount = tenure;
    if (v.firstEmiAsDown && v.downPolicy !== "Not Allowed") emiCount = Math.max(1, tenure - 1);
    const emi = Math.round(total / Math.max(1, emiCount));
    return { cashPrice, downAmt: Math.round(downAmt), financed: Math.round(financed), profit: Math.round(profit), total: Math.round(total), emi, tenure };
  }, [v]);

  function handleSave() {
    if (!v.name.trim()) return setError("Plan name is required");
    if (v.applicable.length === 0) return setError("Select at least one applicable category");
    if (v.tenureMode === "Fixed" && Number(v.tenure) <= 0) return setError("Tenure must be greater than zero");
    if (v.tenureMode === "Range" && Number(v.tenureMin) >= Number(v.tenureMax))
      return setError("Tenure min must be less than max");
    if (v.tenureMode === "Tiered" && v.tiers.length === 0) return setError("Add at least one tenure tier");
    if (Number(v.minFinance) >= Number(v.maxFinance))
      return setError("Min financing must be less than max");
    if (v.downPolicy !== "Not Allowed" && v.downType === "% of Cash Price" && Number(v.downMin) > Number(v.downMax))
      return setError("Down payment min cannot exceed max");
    setError(null);
    onSubmit(v);
  }

  return (
    <div className="space-y-6 pb-28">
      <FormCard>
        {/* ───────── Plan Info ───────── */}
        <FormSection
          icon={<Tag className="h-4 w-4" />}
          title="Plan Info"
          description="Name, code, scope and visibility of this installment plan."
        >
          <FormRowDouble
            left={{
              label: "Plan Name", required: true, children: (
                <WInput value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 12-Month Easy Plan" />
              ),
            }}
            right={{
              label: "Plan Code", hint: "Short reference shown on contracts.", children: (
                <WInput value={v.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="EZ-12" />
              ),
            }}
          />
          <FormRow label="Applies To" required hint="Plan will only be available for selected product categories.">
            <WChips value={v.applicable} onToggle={toggleApplicable} options={APPLIES_TO} />
          </FormRow>
          <FormRowDouble
            left={{ label: "Billing Cycle", children: (
              <WSelect value={v.billingCycle} onChange={(x) => set("billingCycle", x)} options={BILLING_CYCLE} />
            )}}
            right={{ label: "Status", children: (
              <WSelect value={v.status} onChange={(x) => set("status", x)} options={STATUSES} />
            )}}
          />
          <FormRow label="Internal Notes" hint="Visible to sales / recovery staff only.">
            <WTextarea value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Internal notes…" />
          </FormRow>
        </FormSection>

        {/* ───────── Tenure ───────── */}
        <FormSection
          icon={<CalendarRange className="h-4 w-4" />}
          title="Tenure Configuration"
          description="Define a fixed tenure, allow a customer-selectable range, or vary rate by tenure."
        >
          <FormRow label="Tenure Mode" required>
            <div className="flex flex-wrap gap-2">
              {["Fixed", "Range", "Tiered"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("tenureMode", m)}
                  className={`h-9 px-3 rounded-md border text-xs font-semibold transition ${
                    v.tenureMode === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {m === "Fixed" ? "Fixed Tenure" : m === "Range" ? "Customer Selects (Range)" : "Tiered by Tenure"}
                </button>
              ))}
            </div>
          </FormRow>

          {v.tenureMode === "Fixed" && (
            <FormRow label="Tenure (months)" required>
              <WInput type="number" min={1} max={120} value={v.tenure} onChange={(e) => set("tenure", Number(e.target.value))} />
            </FormRow>
          )}

          {v.tenureMode === "Range" && (
            <FormRowDouble
              left={{ label: "Min Tenure", required: true, hint: "Months", children: (
                <WInput type="number" min={1} value={v.tenureMin} onChange={(e) => set("tenureMin", Number(e.target.value))} />
              )}}
              right={{ label: "Max Tenure", required: true, hint: "Months", children: (
                <WInput type="number" min={1} value={v.tenureMax} onChange={(e) => set("tenureMax", Number(e.target.value))} />
              )}}
            />
          )}

          {v.tenureMode === "Tiered" && (
            <FormRowFull>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 w-10">#</th>
                      <th className="text-left px-3 py-2">Tenure (months)</th>
                      <th className="text-left px-3 py-2">Rental Rate (%)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {v.tiers.map((t: TierRow, i: number) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-muted-foreground font-medium">{i + 1}</td>
                        <td className="px-3 py-2">
                          <input type="number" value={t.tenure} onChange={(e) => updateTier(t.id, { tenure: Number(e.target.value) })} className="w-32 h-9 px-2 rounded-md border border-border bg-background text-sm" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step={0.01} value={t.rate} onChange={(e) => updateTier(t.id, { rate: Number(e.target.value) })} className="w-32 h-9 px-2 rounded-md border border-border bg-background text-sm" />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button type="button" onClick={() => removeTier(t.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2 border-t border-border bg-muted/30">
                  <button type="button" onClick={addTier} className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> Add Tier
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Rental rate is selected automatically based on the tenure customer picks at contract time.</p>
            </FormRowFull>
          )}
        </FormSection>

        {/* ───────── Down Payment ───────── */}
        <FormSection
          icon={<Wallet className="h-4 w-4" />}
          title="Down Payment Policy"
          description="Upfront payment behaviour for contracts created under this plan."
        >
          <FormRow label="Policy" required hint="Mandatory means contract cannot be created without down payment.">
            <WSelect value={v.downPolicy} onChange={(x) => set("downPolicy", x)} options={DOWN_POLICY} />
          </FormRow>

          {v.downPolicy !== "Not Allowed" && (
            <>
              <FormRow label="Down Payment Type">
                <WSelect value={v.downType} onChange={(x) => set("downType", x)} options={DOWN_TYPE} />
              </FormRow>
              <FormRowDouble
                left={{
                  label: v.downType === "% of Cash Price" ? "Minimum (%)" : "Minimum (Rs.)",
                  required: true,
                  children: (
                    <WInput type="number" min={0} value={v.downMin} onChange={(e) => set("downMin", Number(e.target.value))} />
                  ),
                }}
                right={{
                  label: v.downType === "% of Cash Price" ? "Maximum (%)" : "Maximum (Rs.)",
                  hint: "Cap to prevent over-collection at booking.",
                  children: (
                    <WInput type="number" min={0} value={v.downMax} onChange={(e) => set("downMax", Number(e.target.value))} />
                  ),
                }}
              />
              <FormRow label="First Installment = Down Payment" hint="If on, the first EMI is collected at booking and tenure is reduced by 1 month.">
                <WSwitch
                  checked={!!v.firstEmiAsDown}
                  onChange={(c) => set("firstEmiAsDown", c)}
                  label={v.firstEmiAsDown ? "First EMI counts as down payment" : "Down payment is separate from EMIs"}
                />
              </FormRow>
            </>
          )}
        </FormSection>

        {/* ───────── Rental Rate / Pricing ───────── */}
        <FormSection
          icon={<Percent className="h-4 w-4" />}
          title="Rental Rate & Pricing"
          description="How the markup or profit is calculated on the financed amount."
        >
          <FormRowDouble
            left={{ label: "Pricing Model", required: true, hint: "Reducing balance recalculates profit each month.", children: (
              <WSelect value={v.pricingModel} onChange={(x) => set("pricingModel", x)} options={PRICING_MODEL} />
            )}}
            right={{ label: "Rate Basis", children: (
              <WSelect value={v.rateBasis} onChange={(x) => set("rateBasis", x)} options={RATE_BASIS} />
            )}}
          />
          {v.tenureMode !== "Tiered" && v.pricingModel !== "Zero Markup (0%)" && (
            <FormRow label="Rental Rate (%)" required hint="Overall markup for this plan.">
              <WInput type="number" min={0} step={0.01} value={v.markup} onChange={(e) => set("markup", Number(e.target.value))} />
            </FormRow>
          )}
          {v.tenureMode === "Tiered" && (
            <FormRowFull tone="muted">
              <p className="text-xs text-muted-foreground">Rate is driven by the tenure tier table above. The single rate field is disabled.</p>
            </FormRowFull>
          )}
        </FormSection>

        {/* ───────── Fees & Penalty ───────── */}
        <FormSection
          icon={<Calculator className="h-4 w-4" />}
          title="Fees & Penalties"
          description="One-time fees, late-payment penalties and early-settlement rules."
        >
          <FormRowDouble
            left={{ label: "Processing Fee", hint: "Charged once at contract creation.", children: (
              <FieldPair>
                <WSelect value={v.processingFeeType} onChange={(x) => set("processingFeeType", x)} options={["Fixed", "% of Financed"]} />
                <WInput type="number" min={0} value={v.processingFee} onChange={(e) => set("processingFee", Number(e.target.value))} />
              </FieldPair>
            )}}
            right={{ label: "Documentation Fee (Rs.)", children: (
              <WInput type="number" min={0} value={v.documentationFee} onChange={(e) => set("documentationFee", Number(e.target.value))} />
            )}}
          />
          <FormRow label="Late Payment Penalty" required>
            <FieldTriple>
              <WSelect value={v.penaltyType} onChange={(x) => set("penaltyType", x)} options={PENALTY_TYPE} />
              <WInput type="number" min={0} value={v.penalty} onChange={(e) => set("penalty", Number(e.target.value))} />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground whitespace-nowrap">Grace</span>
                <WInput type="number" min={0} max={30} value={v.graceDays} onChange={(e) => set("graceDays", Number(e.target.value))} />
                <span className="text-[12px] text-muted-foreground">days</span>
              </div>
            </FieldTriple>
          </FormRow>
          <FormRow label="Early Settlement Discount (%)" hint="Discount on remaining profit if customer settles early. Set 0 to disable.">
            <WInput type="number" min={0} max={100} step={0.5} value={v.earlySettlementDiscount} onChange={(e) => set("earlySettlementDiscount", Number(e.target.value))} />
          </FormRow>
        </FormSection>

        {/* ───────── Eligibility & Approval ───────── */}
        <FormSection
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Eligibility & Approval"
          description="Financing limits, guarantors and approval workflow."
        >
          <FormRowDouble
            left={{ label: "Min Financing (Rs.)", required: true, children: (
              <WInput type="number" min={0} value={v.minFinance} onChange={(e) => set("minFinance", Number(e.target.value))} />
            )}}
            right={{ label: "Max Financing (Rs.)", required: true, children: (
              <WInput type="number" min={0} value={v.maxFinance} onChange={(e) => set("maxFinance", Number(e.target.value))} />
            )}}
          />
          <FormRowDouble
            left={{ label: "Guarantor Requirement", children: (
              <WSelect value={v.guarantor} onChange={(x) => set("guarantor", x)} options={GUARANTORS} />
            )}}
            right={{ label: "Approval Level", children: (
              <WSelect value={v.approvalLevel} onChange={(x) => set("approvalLevel", x)} options={APPROVAL_LEVEL} />
            )}}
          />
          <FormRow label="Document Requirements">
            <div className="space-y-2">
              <WSwitch checked={!!v.cnicRequired} onChange={(c) => set("cnicRequired", c)} label="CNIC verification required" />
              <WSwitch checked={!!v.incomeProofRequired} onChange={(c) => set("incomeProofRequired", c)} label="Income / employment proof required" />
            </div>
          </FormRow>
        </FormSection>

        {/* ───────── Live Preview ───────── */}
        <FormSection
          icon={<Calculator className="h-4 w-4" />}
          title="Live Preview"
          description="Sample calculation based on a Rs. 100,000 cash price using this plan's minimum settings."
        >
          <FormRowFull tone="muted">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <PreviewStat label="Cash Price" value={preview.cashPrice} />
              <PreviewStat label="Down Payment" value={preview.downAmt} />
              <PreviewStat label="Financed" value={preview.financed} />
              <PreviewStat label="Profit" value={preview.profit} tone="warning" />
              <PreviewStat label={`EMI × ${v.firstEmiAsDown && v.downPolicy !== "Not Allowed" ? preview.tenure - 1 : preview.tenure}`} value={preview.emi} tone="primary" />
            </div>
          </FormRowFull>
        </FormSection>
      </FormCard>

      {/* Sticky action bar */}
      <div className={`${pageMode ? "fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,16rem)] z-30" : "sticky bottom-0"} border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-muted-foreground">
            {error ? <span className="text-destructive font-semibold">{error}</span> : "All sections are saved together."}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
              <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: number; tone?: "primary" | "warning" }) {
  const toneCls =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-amber-600"
        : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-base font-bold mt-0.5 ${toneCls}`}>Rs. {Math.round(value).toLocaleString()}</div>
    </div>
  );
}
