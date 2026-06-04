import { useEffect, useRef, useState } from "react";

import { Building2, Phone, Banknote, ShieldCheck, FileText, UploadCloud, X, Plus, Save, Trash2, Check } from "lucide-react";
import { WInput, WTextarea, WSelect, WChips, WSwitch } from "@/components/StepWizard";
import { FormCard, FormSection, FormRow, FormRowDouble, FormRowFull, FieldPair } from "@/components/forms/SideForm";

const CATEGORIES = ["Home Appliances", "Bikes", "Kitchen Items", "Others"];
const BRANDS = ["Samsung", "LG", "Gree", "Haier", "Dawlance", "Sony", "Honda", "TCL", "PEL", "Orient"];
const SUPPLIER_TYPES = ["Manufacturer", "Distributor", "Wholesaler", "Importer", "Service Provider"];
const PAYMENT_TERMS = ["Advance", "COD", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90"];
const STATUSES = ["Active", "Inactive", "Pending", "Blacklisted"];
const CURRENCIES = ["PKR", "USD", "EUR", "AED", "CNY"];

const REQUIRED_DOCS: { key: string; label: string; hint: string }[] = [
  { key: "ntn", label: "NTN Certificate", hint: "FBR-issued tax certificate" },
  { key: "strn", label: "STRN / Sales Tax Reg.", hint: "Sales tax registration" },
  { key: "agreement", label: "Vendor Agreement / MOU", hint: "Signed terms of trade" },
  { key: "cnic", label: "Owner CNIC", hint: "Authorized signatory ID" },
];

export function SupplierWizard({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    code: initial?.code ?? "SUP-NEW",
    name: initial?.name ?? "",
    displayName: initial?.displayName ?? "",
    supplierType: initial?.supplierType ?? "Distributor",
    contactPerson: initial?.contactPerson ?? "",
    status: initial?.status ?? "Active",
    regNo: initial?.regNo ?? "",
    ntn: initial?.ntn ?? "",
    strn: initial?.strn ?? "",
    website: initial?.website ?? "",
    category: initial?.category ?? "",
    brands: initial?.brands ?? [],
    phone: initial?.phone ?? "",
    altPhone: initial?.altPhone ?? "",
    email: initial?.email ?? "",
    billingAddress: initial?.billingAddress ?? "",
    shippingAddress: initial?.shippingAddress ?? "",
    sameAddress: initial?.sameAddress ?? true,
    city: initial?.city ?? "Lahore",
    country: initial?.country ?? "Pakistan",
    mapsLink: initial?.mapsLink ?? "",
    type: initial?.type ?? "Local",
    bankName: initial?.bankName ?? "",
    accountTitle: initial?.accountTitle ?? "",
    accountNo: initial?.accountNo ?? "",
    iban: initial?.iban ?? "",
    paymentTerms: initial?.paymentTerms ?? "Net 30",
    creditLimit: initial?.creditLimit ?? 0,
    currency: initial?.currency ?? "PKR",
    balance: initial?.balance ?? 0,
    balanceType: initial?.balanceType ?? "Cr",
    documents: initial?.documents ?? [],
    policies: initial?.policies ?? [],
    portalEnabled: initial?.portalEnabled ?? false,
    portalEmail: initial?.portalEmail ?? "",
    portalPassword: initial?.portalPassword ?? "",
    portalRole: initial?.portalRole ?? "Vendor",
    portalNotify: initial?.portalNotify ?? true,
    portalTwoFactor: initial?.portalTwoFactor ?? false,
    portalAllowPO: initial?.portalAllowPO ?? true,
    portalAllowGRN: initial?.portalAllowGRN ?? true,
    portalAllowBills: initial?.portalAllowBills ?? true,
    portalAllowPayments: initial?.portalAllowPayments ?? true,
    portalAllowReturns: initial?.portalAllowReturns ?? false,
  }));

  const [error, setError] = useState<string | null>(null);
  // Track whether the user has manually edited Display Name; if not, auto-mirror Legal Name.
  const displayTouched = useRef(Boolean(initial?.displayName && initial?.displayName !== initial?.name));

  function set<K extends keyof typeof v>(k: K, val: any) {
    setV((p: any) => ({ ...p, [k]: val }));
  }
  function toggle(arrKey: string, val: string) {
    setV((p: any) => {
      const cur: string[] = p[arrKey] ?? [];
      return { ...p, [arrKey]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  }

  // Auto-derive display name from legal name unless the user has edited it manually.
  useEffect(() => {
    if (!displayTouched.current) {
      setV((p: any) => ({ ...p, displayName: p.name }));
    }
  }, [v.name]);

  function handleSave() {
    if (!v.name.trim()) return setError("Legal name is required");
    if (!v.category) return setError("Pick a primary category");
    if (!v.phone.trim()) return setError("Primary phone is required");
    if (v.portalEnabled && (!v.portalEmail || !v.portalPassword)) {
      return setError("Email and temporary password are required when portal access is enabled.");
    }
    setError(null);
    onSubmit(v);
  }

  return (
    <div className="space-y-6 pb-28">
      <FormCard>
        <FormSection
          icon={<Building2 className="h-4 w-4" />}
          title="Identity & Company"
          description="Legal identity, registration and trade profile."
        >
          <FormRowDouble
            left={{ label: "Legal Name", required: true, children: (
              <WInput value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="DWP Group (Pvt.) Ltd." />
            )}}
            right={{ label: "Display Name", hint: "Auto-filled from Legal Name", children: (
              <WInput
                value={v.displayName}
                onChange={(e) => { displayTouched.current = true; set("displayName", e.target.value); }}
                placeholder="DWP"
              />
            )}}
          />
          <FormRowDouble
            left={{ label: "Supplier Code", required: true, children: (
              <WInput value={v.code} onChange={(e) => set("code", e.target.value)} placeholder="SUP-001" />
            )}}
            right={{ label: "Supplier Type", required: true, children: (
              <WSelect value={v.supplierType} onChange={(x) => set("supplierType", x)} options={SUPPLIER_TYPES} />
            )}}
          />
          <FormRow label="Origin & Status">
            <FieldPair>
              <WSelect value={v.type} onChange={(x) => set("type", x)} options={["Local", "Import"]} />
              <WSelect value={v.status} onChange={(x) => set("status", x)} options={STATUSES} />
            </FieldPair>
          </FormRow>
          <FormRowDouble
            left={{ label: "Contact Person", children: (
              <WInput value={v.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Owner / Account Manager" />
            )}}
            right={{ label: "Website", children: (
              <WInput value={v.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
            )}}
          />
          <FormRow label="NTN / STRN" hint="Tax & sales-tax registration numbers">
            <FieldPair>
              <WInput value={v.ntn} onChange={(e) => set("ntn", e.target.value)} placeholder="NTN 1234567-8" />
              <WInput value={v.strn} onChange={(e) => set("strn", e.target.value)} placeholder="STRN 03-12-3456-789-12" />
            </FieldPair>
          </FormRow>
        </FormSection>

        <FormSection
          icon={<Phone className="h-4 w-4" />}
          title="Category & Contact"
          description="What they supply and how to reach them."
        >
          <FormRowDouble
            left={{ label: "Primary Category", required: true, children: (
              <WSelect value={v.category} onChange={(x) => set("category", x)} options={CATEGORIES} />
            )}}
            right={{ label: "City", children: (
              <WInput value={v.city} onChange={(e) => set("city", e.target.value)} />
            )}}
          />
          <FormRow label="Brands Carried">
            <WChips value={v.brands} onToggle={(x) => toggle("brands", x)} options={BRANDS} />
          </FormRow>
          <FormRow label="Phone" required hint="Primary and alternate contact numbers">
            <FieldPair>
              <WInput value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 1234567" />
              <WInput value={v.altPhone} onChange={(e) => set("altPhone", e.target.value)} placeholder="Alt phone" />
            </FieldPair>
          </FormRow>
          <FormRowDouble
            left={{ label: "Email", children: (
              <WInput type="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="orders@supplier.com" />
            )}}
            right={{ label: "Google Maps Link", children: (
              <WInput value={v.mapsLink} onChange={(e) => set("mapsLink", e.target.value)} placeholder="https://goo.gl/maps/..." />
            )}}
          />
          <FormRow label="Billing Address">
            <WTextarea value={v.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} placeholder="Street, area, city" />
          </FormRow>
          <FormRow label="Shipping Address" align="center">
            <WSwitch checked={v.sameAddress} onChange={(c) => set("sameAddress", c)} label="Same as billing address" />
          </FormRow>
          {!v.sameAddress && (
            <FormRow label=" ">
              <WTextarea value={v.shippingAddress} onChange={(e) => set("shippingAddress", e.target.value)} placeholder="Shipping address" />
            </FormRow>
          )}
        </FormSection>

        <FormSection
          icon={<Banknote className="h-4 w-4" />}
          title="Banking, Terms & Policies"
          description="Payment details and per-invoice trade rules."
        >
          <FormRowDouble
            left={{ label: "Bank Name", children: (
              <WInput value={v.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="HBL / MCB / Meezan" />
            )}}
            right={{ label: "Account Title", children: (
              <WInput value={v.accountTitle} onChange={(e) => set("accountTitle", e.target.value)} />
            )}}
          />
          <FormRow label="Account / IBAN">
            <FieldPair>
              <WInput value={v.accountNo} onChange={(e) => set("accountNo", e.target.value)} placeholder="Account number" />
              <WInput value={v.iban} onChange={(e) => set("iban", e.target.value)} placeholder="PK00 ABCD ..." />
            </FieldPair>
          </FormRow>
          <FormRow label="Payment Terms">
            <FieldPair>
              <WSelect value={v.paymentTerms} onChange={(x) => set("paymentTerms", x)} options={PAYMENT_TERMS} />
              <WSelect value={v.currency} onChange={(x) => set("currency", x)} options={CURRENCIES} />
            </FieldPair>
          </FormRow>
          <FormRowDouble
            left={{ label: "Credit Limit", children: (
              <WInput type="number" value={v.creditLimit} onChange={(e) => set("creditLimit", Number(e.target.value))} />
            )}}
            right={{ label: "Opening Balance", children: (
              <FieldPair>
                <WInput type="number" value={v.balance} onChange={(e) => set("balance", Number(e.target.value))} />
                <WSelect value={v.balanceType} onChange={(x) => set("balanceType", x)} options={["Dr", "Cr"]} />
              </FieldPair>
            )}}
          />
          <FormRowFull tone="muted">
            <PoliciesEditor policies={v.policies} onChange={(p) => set("policies", p)} />
          </FormRowFull>
        </FormSection>

        <FormSection
          icon={<FileText className="h-4 w-4" />}
          title="Documents"
          description="Upload required compliance documents. Drag & drop or browse."
        >
          <FormRowFull>
            <DocsEditor docs={v.documents} onChange={(d) => set("documents", d)} />
          </FormRowFull>
        </FormSection>

        <FormSection
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Vendor Portal Access"
          description="Optional self-service portal for the supplier."
        >
          <FormRow label="Enable Portal" align="center" hint="Vendor signs in to a scoped portal showing only their own POs, GRNs, bills, payments and returns.">
            <WSwitch checked={v.portalEnabled} onChange={(c) => set("portalEnabled", c)} label={v.portalEnabled ? "Enabled" : "Disabled"} />
          </FormRow>

          {v.portalEnabled && (
            <>
              <FormRow label="Login Email" required hint="Vendor signs in with this email.">
                <WInput type="email" value={v.portalEmail} onChange={(e) => set("portalEmail", e.target.value)} placeholder={v.email || "vendor@company.com"} />
              </FormRow>
              <FormRow label="Temporary Password" required hint="Share securely. Reset on first login.">
                <div className="flex gap-2">
                  <WInput value={v.portalPassword} onChange={(e) => set("portalPassword", e.target.value)} placeholder="Tmp@1234" />
                  <button type="button" onClick={() => set("portalPassword", `Vnd-${Math.random().toString(36).slice(2, 8)}`)} className="h-11 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted shrink-0">Generate</button>
                </div>
              </FormRow>
              <FormRow label="Portal Role">
                <WSelect value={v.portalRole} onChange={(x) => set("portalRole", x)} options={["Vendor", "Vendor Admin", "Read-Only"]} />
              </FormRow>
              <FormRowFull tone="muted">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Module Permissions</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <PermToggle label="Purchase Orders" hint="View & acknowledge POs" checked={v.portalAllowPO} onChange={(c) => set("portalAllowPO", c)} />
                  <PermToggle label="GRN / Receipts" hint="See receiving status" checked={v.portalAllowGRN} onChange={(c) => set("portalAllowGRN", c)} />
                  <PermToggle label="Bills & Invoices" hint="Submit & track bills" checked={v.portalAllowBills} onChange={(c) => set("portalAllowBills", c)} />
                  <PermToggle label="Payments" hint="See payment history" checked={v.portalAllowPayments} onChange={(c) => set("portalAllowPayments", c)} />
                  <PermToggle label="Returns" hint="Manage return requests" checked={v.portalAllowReturns} onChange={(c) => set("portalAllowReturns", c)} />
                </div>
              </FormRowFull>
              <FormRowFull>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Security & Notifications</div>
                <div className="space-y-2">
                  <PermToggle label="Require 2-Factor Authentication" hint="OTP via email on every login" checked={v.portalTwoFactor} onChange={(c) => set("portalTwoFactor", c)} />
                  <PermToggle label="Email vendor with login credentials" hint="An onboarding email will be sent." checked={v.portalNotify} onChange={(c) => set("portalNotify", c)} />
                </div>
              </FormRowFull>
            </>
          )}
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
              <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Supplier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Documents =====
function DocsEditor({ docs, onChange }: { docs: any[]; onChange: (d: any[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  function pickFile(key: string) {
    setPendingKey(key);
    inputRef.current?.click();
  }
  function handleFiles(files: FileList | null, forKey?: string | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      type: forKey ? REQUIRED_DOCS.find((d) => d.key === forKey)?.label ?? "Other" : "Other",
      name: f.name,
      size: f.size,
      expiry: "",
      key: forKey ?? null,
    }));
    onChange([...(docs || []), ...list]);
    setPendingKey(null);
  }
  function remove(id: string) {
    onChange(docs.filter((d) => d.id !== id));
  }
  function setExpiry(id: string, expiry: string) {
    onChange(docs.map((d) => (d.id === id ? { ...d, expiry } : d)));
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, pendingKey)}
      />

      {/* Required-document slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REQUIRED_DOCS.map((req) => {
          const filled = docs.filter((d) => d.key === req.key);
          const has = filled.length > 0;
          return (
            <button
              key={req.key}
              type="button"
              onClick={() => pickFile(req.key)}
              className={`text-left rounded-xl border p-3 transition flex items-start gap-3 ${has ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5"}`}
            >
              <span className={`h-9 w-9 grid place-items-center rounded-lg shrink-0 ${has ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                {has ? <Check className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {req.label}
                  {has && <span className="text-[10px] font-bold text-primary">UPLOADED</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {has ? filled.map((f) => f.name).join(", ") : req.hint}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-primary shrink-0">{has ? "Replace" : "Upload"}</span>
            </button>
          );
        })}
      </div>

      {/* Drop zone for other files */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files, null); }}
        onClick={() => pickFile("")}
        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${drag ? "border-primary bg-primary/10" : "border-border bg-muted/10 hover:border-primary/40 hover:bg-primary/5"}`}
      >
        <UploadCloud className="h-6 w-6 mx-auto text-muted-foreground" />
        <div className="text-sm font-semibold text-foreground mt-2">Drop other documents here</div>
        <div className="text-xs text-muted-foreground">or click to browse — PDF, JPG, PNG up to 10MB each</div>
      </div>

      {/* Uploaded list with expiry */}
      {docs.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-3 py-2 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Uploaded Documents ({docs.length})
          </div>
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{d.type}{d.size ? ` · ${formatSize(d.size)}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-muted-foreground">Expiry</label>
                  <input
                    type="date"
                    value={d.expiry || ""}
                    onChange={(e) => setExpiry(d.id, e.target.value)}
                    className="h-8 px-2 rounded-md border border-border bg-background text-xs"
                  />
                  <button onClick={() => remove(d.id)} className="h-8 w-8 grid place-items-center rounded-md text-destructive hover:bg-destructive/10" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

// ===== Policies =====
const POLICY_KIND = ["Discount", "Penalty", "Rebate", "Bonus", "Late Fee"];
const POLICY_UNIT = ["%", "Rs"];

function PoliciesEditor({ policies, onChange }: { policies: any[]; onChange: (p: any[]) => void }) {
  const [form, setForm] = useState({ name: "", kind: "Discount", value: 0, unit: "%", notes: "" });

  function addPolicy() {
    if (!form.name.trim()) return;
    onChange([...(policies || []), { ...form, id: Date.now(), duration: "Per Bill / Invoice" }]);
    setForm({ name: "", kind: "Discount", value: 0, unit: "%", notes: "" });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">Add Trade Policy</div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Applied per Bill / Invoice</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5"><WInput placeholder="Policy name (e.g. Early Payment Discount)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="sm:col-span-2"><WSelect value={form.kind} onChange={(x) => setForm((f) => ({ ...f, kind: x }))} options={POLICY_KIND} /></div>
          <div className="sm:col-span-2"><WInput type="number" placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} /></div>
          <div className="sm:col-span-1"><WSelect value={form.unit} onChange={(x) => setForm((f) => ({ ...f, unit: x }))} options={POLICY_UNIT} /></div>
          <div className="sm:col-span-2">
            <button type="button" onClick={addPolicy} className="h-11 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="sm:col-span-12"><WInput placeholder="Notes / conditions (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
        </div>
      </div>

      {(!policies || policies.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No policies added yet. Each policy you add is applied per bill / invoice.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Policy</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">Value</th>
                <th className="text-left px-3 py-2">Applied On</th>
                <th className="text-left px-3 py-2">Notes</th>
                <th className="px-3 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {policies.map((p) => {
                const isPenalty = p.kind === "Penalty" || p.kind === "Late Fee";
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-semibold text-foreground">{p.name}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold ${isPenalty ? "bg-destructive/10 text-destructive border border-destructive/30" : "bg-primary/10 text-primary border border-primary/30"}`}>
                        {p.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-foreground">{p.unit === "%" ? `${p.value}%` : `Rs ${Number(p.value).toLocaleString()}`}</td>
                    <td className="px-3 py-2 text-muted-foreground">Per Bill / Invoice</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{p.notes || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => onChange(policies.filter((x) => x.id !== p.id))} className="h-8 w-8 grid place-items-center rounded-md text-destructive hover:bg-destructive/10" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PermToggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start justify-between gap-3 text-left rounded-lg border px-3 py-2.5 transition ${checked ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-border/80"}`}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <span className={`relative inline-flex shrink-0 h-5 w-9 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
