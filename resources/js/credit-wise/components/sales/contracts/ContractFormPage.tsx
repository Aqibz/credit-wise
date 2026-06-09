import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FileText, User, Package, CalendarDays, Banknote, Users as UsersIcon,
  ShieldCheck, Save, Plus, Trash2, UploadCloud, X, Check, AlertTriangle, ChevronDown, Search,
} from "lucide-react";
import { useNavigate } from "@/shared/navigation";
import { WInput, WTextarea, WSelect, WSwitch } from "@/components/StepWizard";
import { FormCard, FormSection, FormRow, FormRowDouble, FormRowFull, FieldPair } from "@/components/forms/SideForm";
import { useEntityStore } from "@/lib/state/useEntityStore";
import {
  hpCasesConfig, customersConfig, productsConfig, guarantorsConfig,
  salesTeamConfig, recoveryAgentsConfig, blacklistConfig, installmentMatrixConfig,
} from "@/lib/entities";
import { useToast } from "@/components/Toaster";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };

const CHANNELS = ["Walk-in", "Phone", "Website", "Mobile App", "Field Sales", "Referral", "Social Media"];
const PRIORITIES = ["Normal", "High", "Urgent"];
const FREQUENCIES = ["Monthly", "Bi-Weekly", "Weekly", "Quarterly"];
const RELATIONS = ["Father", "Mother", "Brother", "Sister", "Husband", "Wife", "Son", "Daughter", "Friend", "Colleague", "Relative", "Employer", "Other"];
const EMPLOYMENT = ["Salaried", "Self-Employed", "Business Owner", "Freelancer", "Government", "Pensioner", "Other"];
const DOC_TYPES: { key: string; label: string; required?: boolean; hint: string }[] = [
  { key: "cnicFront",   label: "CNIC Front",       required: true,  hint: "Front side of customer CNIC" },
  { key: "cnicBack",    label: "CNIC Back",        required: true,  hint: "Back side of customer CNIC" },
  { key: "utility",     label: "Utility Bill",     required: true,  hint: "Last 3 months â€” address proof" },
  { key: "salarySlip",  label: "Salary Slip / Income Proof", hint: "Last pay slip or income statement" },
  { key: "employment",  label: "Employment Letter", hint: "Or business registration" },
  { key: "bankStmt",    label: "Bank Statement",   hint: "Last 6 months" },
  { key: "guarantorCnic", label: "Guarantor CNIC", required: true, hint: "Front & back of primary guarantor" },
];

type Cheque = { bank: string; cheque: string; date: string; amount: number };
type Guarantor = {
  name: string; cnic: string; phone: string; altPhone: string;
  relation: string; occupation: string; city: string; income: number; address: string;
};
type DocFile = { key: string; label: string; name: string; size: number };

export function ContractFormPage({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();

  const { items: customers, create: createCustomer } = useEntityStore<any>(customersConfig.storageKey, customersConfig.seed);
  const { items: products }    = useEntityStore<any>(productsConfig.storageKey, productsConfig.seed);
  const { items: salesTeam }   = useEntityStore<any>(salesTeamConfig.storageKey, salesTeamConfig.seed);
  const { items: agents }      = useEntityStore<any>(recoveryAgentsConfig.storageKey, recoveryAgentsConfig.seed);
  const { items: blacklist }   = useEntityStore<any>(blacklistConfig.storageKey, blacklistConfig.seed);
  const { items: matrix }      = useEntityStore<any>(installmentMatrixConfig.storageKey, installmentMatrixConfig.seed);
  const { items: cases, create: createCase } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);
  const { create: createGuarantor } = useEntityStore<any>(guarantorsConfig.storageKey, guarantorsConfig.seed);

  const ref = useMemo(() => `HP-${String(2000 + cases.length + 1).padStart(4, "0")}`, [cases.length]);

  // --- Identity ---
  const [salesPerson, setSalesPerson] = useState<string>("");
  const [recoveryAgent, setRecoveryAgent] = useState<string>("");
  const [channel, setChannel] = useState<string>("Walk-in");
  const [priority, setPriority] = useState<string>("Normal");
  const [bookedOn, setBookedOn] = useState<string>(fmtDate(new Date()));

  // --- Customer ---
  const [customerId, setCustomerId] = useState<string>("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const emptyNc = {
    name: "", cnic: "", phone: "", altPhone: "", dob: "", email: "",
    address: "", city: "Lahore", area: "", occupation: "",
    employer: "", employmentType: "Salaried", income: 0, dependents: 0,
  };
  const [nc, setNc] = useState(emptyNc);
  const customer = useMemo(() => customers.find((c: any) => c.id === customerId), [customers, customerId]);
  const customerName = customer?.name || (showNewCustomer ? nc.name : "");
  const customerCnic = customer?.cnic || (showNewCustomer ? nc.cnic : "");
  const customerPhone = customer?.phone || (showNewCustomer ? nc.phone : "");

  const blHit = useMemo(() => {
    if (!customerCnic && !customerName) return null;
    return blacklist.find((b: any) =>
      (customerCnic && b.cnic && b.cnic === customerCnic) ||
      (customerName && b.name && b.name.toLowerCase() === String(customerName).toLowerCase())
    );
  }, [blacklist, customerCnic, customerName]);

  // --- Product & Financing ---
  const [productId, setProductId] = useState<string>("");
  const [variantSku, setVariantSku] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const product = useMemo(() => products.find((p: any) => p.id === productId), [products, productId]);
  const variants: any[] = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const variant = useMemo(() => variants.find((v: any) => v.sku === variantSku), [variants, variantSku]);
  const unitPrice = Number(variant?.price || product?.retail || 0);
  const cashPrice = unitPrice * qty;

  // Plans linked to this product (from installment matrix)
  const availablePlans = useMemo(() => {
    if (!product) return [];
    return matrix.filter((m: any) =>
      m.status === "Active" && (
        m.product === product.name ||
        m.product === product.category ||
        m.scope === "All"
      )
    );
  }, [matrix, product]);

  const [planId, setPlanId] = useState<string>("");
  const plan = useMemo(() => availablePlans.find((p: any) => p.id === planId), [availablePlans, planId]);

  // Auto-select first plan when product changes
  useEffect(() => {
    if (availablePlans.length && !availablePlans.find((p: any) => p.id === planId)) {
      setPlanId(availablePlans[0].id);
    }
    if (!availablePlans.length) setPlanId("");
  }, [availablePlans, planId]);

  const tenure = Number(plan?.tenure || 0);
  const markupPct = Number(plan?.markup || 0);

  // EMI without down payment (financed = cashPrice + markup)
  // We compute min DP = one EMI's worth (so customer pays at least 1st installment)
  // and max DP = 75% of cash price.
  const baseFinanced = cashPrice + Math.round(cashPrice * markupPct / 100);
  const baseEmi = tenure > 0 ? Math.round(baseFinanced / tenure) : 0;
  const minDown = baseEmi;
  const maxDown = Math.round(cashPrice * 0.75);

  const [down, setDown] = useState<number>(0);
  // Initialise down when plan changes
  useEffect(() => {
    if (plan && cashPrice > 0) {
      const dpFromPlan = plan.downType === "%"
        ? Math.round(cashPrice * Number(plan.downPayment || 0) / 100)
        : Number(plan.downPayment || 0);
      setDown(Math.min(Math.max(dpFromPlan, minDown), maxDown || dpFromPlan));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, cashPrice]);

  const principal = Math.max(0, cashPrice - down);
  const markupAmt = Math.round(principal * markupPct / 100);
  const financed  = principal + markupAmt;
  const monthly   = tenure > 0 ? Math.round(financed / tenure) : 0;
  const lastInst  = tenure > 0 ? (financed - monthly * (tenure - 1)) : 0;

  const [frequency, setFrequency] = useState<string>("Monthly");
  const [startDate, setStartDate] = useState<string>(fmtDate(addMonths(new Date(), 1)));

  const schedule = useMemo(() => {
    if (!tenure || !financed) return [];
    const start = new Date(startDate);
    const step = frequency === "Weekly" ? 0.25 : frequency === "Bi-Weekly" ? 0.5 : frequency === "Quarterly" ? 3 : 1;
    let opening = financed;
    return Array.from({ length: tenure }, (_, i) => {
      const amount = i === tenure - 1 ? lastInst : monthly;
      const row = {
        n: i + 1,
        dueDate: fmtDate(addMonths(start, Math.round((i + 1) * step))),
        opening,
        amount,
        closing: Math.max(0, opening - amount),
      };
      opening = row.closing;
      return row;
    });
  }, [tenure, financed, monthly, lastInst, startDate, frequency]);

  // --- Cheques ---
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const addCheque = () => setCheques((c) => [...c, { bank: "", cheque: "", date: schedule[c.length]?.dueDate || fmtDate(addMonths(new Date(startDate), c.length + 1)), amount: monthly }]);
  const updateCheque = (i: number, p: Partial<Cheque>) => setCheques((c) => c.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const removeCheque = (i: number) => setCheques((c) => c.filter((_, idx) => idx !== i));
  const autoFillCheques = () => setCheques(schedule.map((s) => ({ bank: "", cheque: "", date: s.dueDate, amount: s.amount })));

  // --- Guarantors ---
  const newGuarantor = (relation = "Father"): Guarantor => ({
    name: "", cnic: "", phone: "", altPhone: "", relation,
    occupation: "", city: "Lahore", income: 0, address: "",
  });
  const [guarantorList, setGuarantorList] = useState<Guarantor[]>([newGuarantor()]);
  const addGuarantor = () => setGuarantorList((g) => [...g, newGuarantor("Friend")]);
  const updateGuarantor = (i: number, p: Partial<Guarantor>) => setGuarantorList((g) => g.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const removeGuarantor = (i: number) => setGuarantorList((g) => g.filter((_, idx) => idx !== i));

  // --- Documents ---
  const [docs, setDocs] = useState<DocFile[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const askUpload = (key: string) => { setPendingKey(key); fileRef.current?.click(); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !pendingKey) return;
    const meta = DOC_TYPES.find((d) => d.key === pendingKey);
    setDocs((d) => [...d.filter((x) => x.key !== pendingKey), { key: pendingKey, label: meta?.label || pendingKey, name: f.name, size: f.size }]);
    setPendingKey(null); e.target.value = "";
  };
  const removeDoc = (key: string) => setDocs((d) => d.filter((x) => x.key !== key));

  // --- Compliance ---
  const [kycCnic, setKycCnic] = useState(false);
  const [kycAddress, setKycAddress] = useState(false);
  const [kycIncome, setKycIncome] = useState(false);
  const [kycReferences, setKycReferences] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [notes, setNotes] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!salesPerson) return setError("Sales person is required");
    if (!customerId && !showNewCustomer) return setError("Select an existing customer or add a new one");
    if (!customerId && !nc.name.trim()) return setError("New customer name is required");
    if (!customerId && !nc.cnic.trim()) return setError("New customer CNIC is required");
    if (!productId) return setError("Select a product");
    if (!plan) return setError("Select an installment plan");
    if (down < minDown) return setError(`Down payment must be at least one EMI (${Rs(minDown)})`);
    if (down > maxDown) return setError(`Down payment cannot exceed 75% of cash price (${Rs(maxDown)})`);
    if (!guarantorList[0]?.name.trim()) return setError("At least one guarantor is required");
    if (!acceptedTerms) return setError("Confirm that customer accepted the contract terms");

    let custName = customerName;
    if (!customerId && nc.name.trim()) {
      createCustomer({
        name: nc.name, cnic: nc.cnic, phone: nc.phone, area: nc.area || nc.city,
        occupation: nc.occupation, income: nc.income, status: "Active",
      } as any);
      custName = nc.name;
    }

    const productLabel = product ? `${product.name}${variant ? ` (${variant.name || variant.sku})` : ""}${qty > 1 ? ` Ã— ${qty}` : ""}` : "â€”";

    createCase({
      ref,
      customer: custName,
      cnic: customerCnic,
      phone: customerPhone,
      salesPerson, recoveryAgent, channel, priority, bookedOn,
      guarantor: guarantorList[0]?.name || "â€”",
      guarantorCnic: guarantorList[0]?.cnic || "",
      product: productLabel,
      productId, variantSku, qty,
      planId: plan.id, planName: plan.plan,
      cashPrice, totalPrice: cashPrice,
      down,
      profitPct: markupPct, profitAmount: markupAmt,
      principal, financed,
      tenure, frequency, monthly, lastInstallment: lastInst,
      startDate,
      status: "Under Process",
      cheques, schedule, guarantors: guarantorList, documents: docs, notes,
      kyc: { cnic: kycCnic, address: kycAddress, income: kycIncome, references: kycReferences },
    } as any);

    guarantorList.forEach((g) => {
      if (g.name.trim()) {
        createGuarantor({
          name: g.name, cnic: g.cnic, phone: g.phone, altPhone: g.altPhone,
          city: g.city, occupation: g.occupation, income: g.income,
          relation: g.relation, address: g.address,
          customer: custName, status: "Pending", caseRef: ref,
          contractStatus: "Under Process", exposure: financed, tenure,
        } as any);
      }
    });

    toast.success("Contract created", `${ref} for ${custName} is now Under Process.`);
    if (onClose) onClose(); else navigate({ to: "/contracts/under-process" });
  }

  return (
    <div className="space-y-6 pb-28">
      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />

      {blHit && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive font-medium flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span><strong>Blacklist match:</strong> {blHit.name} ({blHit.cnic}) â€” Reason: {blHit.reason || "â€”"}. Proceeding requires manager override.</span>
        </div>
      )}

      <FormCard>
        <FormSection icon={<FileText className="h-4 w-4" />} title="Contract Identity" description="Origin, ownership and prioritisation.">
          <FormRowDouble
            left={{ label: "Contract #", hint: "Auto-generated", children: (
              <WInput value={ref} readOnly className="bg-muted/40" />
            )}}
            right={{ label: "Booking Date", required: true, children: (
              <WInput type="date" value={bookedOn} onChange={(e) => setBookedOn(e.target.value)} />
            )}}
          />
          <FormRowDouble
            left={{ label: "Sales Channel", children: (
              <WSelect value={channel} onChange={setChannel} options={CHANNELS} />
            )}}
            right={{ label: "Priority", children: (
              <WSelect value={priority} onChange={setPriority} options={PRIORITIES} />
            )}}
          />
          <FormRowDouble
            left={{ label: "Salesperson", required: true, children: (
              <WSelect value={salesPerson} onChange={setSalesPerson} options={salesTeam.map((s: any) => s.name)} placeholder="Assign salesâ€¦" />
            )}}
            right={{ label: "Recovery Agent", hint: "Owns collection for this contract", children: (
              <WSelect value={recoveryAgent} onChange={setRecoveryAgent} options={agents.map((a: any) => a.name)} placeholder="Assign agentâ€¦" />
            )}}
          />
        </FormSection>

        <FormSection icon={<User className="h-4 w-4" />} title="Customer" description="Pick an existing customer or onboard a new one.">
          <FormRow label="Customer" required>
            <CustomerCombo
              value={customer?.name || ""}
              customers={customers}
              onPick={(c) => { setCustomerId(c.id); setShowNewCustomer(false); }}
              onNew={() => { setCustomerId(""); setShowNewCustomer(true); setNc(emptyNc); }}
            />
            {customer && (
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-0.5">
                <div className="font-semibold">{customer.name}</div>
                <div className="text-muted-foreground text-xs">{customer.cnic} â€¢ {customer.phone}</div>
                <div className="text-muted-foreground text-xs">{customer.area || customer.city} â€¢ {customer.occupation || "â€”"}</div>
              </div>
            )}
          </FormRow>

          {showNewCustomer && !customer && (
            <>
              <FormRowDouble
                left={{ label: "Full Name", required: true, children: (
                  <WInput value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="Customer name" />
                )}}
                right={{ label: "CNIC", required: true, children: (
                  <WInput value={nc.cnic} onChange={(e) => setNc({ ...nc, cnic: e.target.value })} placeholder="35202-1234567-8" />
                )}}
              />
              <FormRowDouble
                left={{ label: "Date of Birth", children: (
                  <WInput type="date" value={nc.dob} onChange={(e) => setNc({ ...nc, dob: e.target.value })} />
                )}}
                right={{ label: "Email", children: (
                  <WInput type="email" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} />
                )}}
              />
              <FormRow label="Phone" required>
                <FieldPair>
                  <WInput value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} placeholder="+92 300 1234567" />
                  <WInput value={nc.altPhone} onChange={(e) => setNc({ ...nc, altPhone: e.target.value })} placeholder="Alt phone" />
                </FieldPair>
              </FormRow>
              <FormRow label="Address" required>
                <WTextarea value={nc.address} onChange={(e) => setNc({ ...nc, address: e.target.value })} placeholder="House #, street, area" />
              </FormRow>
              <FormRow label="City / Area">
                <FieldPair>
                  <WInput value={nc.city} onChange={(e) => setNc({ ...nc, city: e.target.value })} placeholder="City" />
                  <WInput value={nc.area} onChange={(e) => setNc({ ...nc, area: e.target.value })} placeholder="Area / Locality" />
                </FieldPair>
              </FormRow>
              <FormRowDouble
                left={{ label: "Employment Type", children: (
                  <WSelect value={nc.employmentType} onChange={(v) => setNc({ ...nc, employmentType: v })} options={EMPLOYMENT} />
                )}}
                right={{ label: "Dependents", children: (
                  <WInput type="number" value={nc.dependents} onChange={(e) => setNc({ ...nc, dependents: Number(e.target.value) })} />
                )}}
              />
              <FormRow label="Occupation & Employer">
                <FieldPair>
                  <WInput value={nc.occupation} onChange={(e) => setNc({ ...nc, occupation: e.target.value })} placeholder="e.g. Sales Officer" />
                  <WInput value={nc.employer} onChange={(e) => setNc({ ...nc, employer: e.target.value })} placeholder="Employer / Business" />
                </FieldPair>
              </FormRow>
              <FormRow label="Monthly Income (Rs.)" required>
                <WInput type="number" value={nc.income} onChange={(e) => setNc({ ...nc, income: Number(e.target.value) })} />
              </FormRow>
            </>
          )}
        </FormSection>

        <FormSection icon={<Package className="h-4 w-4" />} title="Product & Financing" description="Pick the item, choose a linked installment plan, set the down payment.">
          <FormRow label="Product" required>
            <WSelect value={product?.name || ""} onChange={(name) => { const p = products.find((x: any) => x.name === name); setProductId(p?.id || ""); setVariantSku(""); }} options={products.map((p: any) => p.name)} placeholder="Select productâ€¦" />
          </FormRow>
          <FormRow label="Variant & Qty" hint={variants.length === 0 ? "No variants" : undefined}>
            <FieldPair>
              <WSelect value={variant?.name || variant?.sku || ""} onChange={(v) => { const found = variants.find((x: any) => (x.name || x.sku) === v); setVariantSku(found?.sku || ""); }} options={variants.map((v: any) => v.name || v.sku)} placeholder={variants.length === 0 ? "â€”" : "Select variantâ€¦"} />
              <WInput type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
            </FieldPair>
          </FormRow>
          <FormRow label="Installment Plan" required hint="Plans configured for this product / category">
            {availablePlans.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {product ? "No plans configured for this product. Add one in Installment Matrix." : "Select a product first to see available plans."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availablePlans.map((p: any) => {
                  const active = p.id === planId;
                  return (
                    <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
                      className={`text-left rounded-lg border p-2.5 transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm text-foreground">{p.plan}</div>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">{p.tenure} mo</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Markup {p.markup}% â€¢ DP {p.downPayment}% suggested</div>
                    </button>
                  );
                })}
              </div>
            )}
          </FormRow>
          <FormRowDouble
            left={{ label: "Payment Frequency", children: (
              <WSelect value={frequency} onChange={setFrequency} options={FREQUENCIES} />
            )}}
            right={{ label: "First Due Date", required: true, children: (
              <WInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            )}}
          />
          <FormRow label="Down Payment (Rs.)" required hint={cashPrice > 0 ? `Range ${Rs(minDown)} â€” ${Rs(maxDown)} (75% max) â€¢ ${cashPrice ? ((down / cashPrice) * 100).toFixed(1) : 0}% of cash price` : "Select product & plan to set down payment"}>
            <div className="space-y-2">
              <WInput type="number" value={down} min={minDown} max={maxDown} onChange={(e) => setDown(Number(e.target.value))} />
              <input
                type="range"
                min={minDown}
                max={maxDown || minDown + 1}
                step={500}
                value={Math.min(Math.max(down, minDown), maxDown || down)}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full accent-primary"
                disabled={!cashPrice}
              />
            </div>
          </FormRow>
          {plan && cashPrice > 0 && (
            <FormRowFull tone="muted">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Financial Summary</div>
              <div className="text-[13px] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-1.5">
                <KV k="Cash Price" v={Rs(cashPrice)} />
                <KV k="Down Payment" v={Rs(down)} />
                <KV k="Principal" v={Rs(principal)} />
                <KV k={`Markup (${markupPct}%)`} v={Rs(markupAmt)} />
                <KV k="Total Financed" v={Rs(financed)} accent />
                <KV k={`${frequency} EMI Ã— ${tenure}`} v={Rs(monthly)} accent />
              </div>
            </FormRowFull>
          )}
        </FormSection>

        <FormSection icon={<CalendarDays className="h-4 w-4" />} title="Installment Schedule" description={schedule.length ? `${tenure} installments Â· ${frequency}` : "Auto-generated once product & plan are selected"}>
          <FormRowFull>
            <div className="rounded-lg border border-border overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">Due Date</th>
                    <th className="text-right px-3 py-2">Opening Balance</th>
                    <th className="text-right px-3 py-2">EMI</th>
                    <th className="text-right px-3 py-2">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedule.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No schedule yet</td></tr>
                  )}
                  {schedule.map((s) => (
                    <tr key={s.n} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-semibold">{s.n}/{tenure}</td>
                      <td className="px-3 py-2">{s.dueDate}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{Rs(s.opening)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{Rs(s.amount)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{Rs(s.closing)}</td>
                    </tr>
                  ))}
                </tbody>
                {schedule.length > 0 && (
                  <tfoot className="bg-muted/30 sticky bottom-0">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 font-bold text-right">Total Recoverable</td>
                      <td className="px-3 py-2 text-right font-bold text-primary">{Rs(financed)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<Banknote className="h-4 w-4" />} title="Post-dated Cheques" description="Security cheques for collection.">
          <FormRowFull>
            <div className="space-y-2">
              {cheques.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No cheques captured. Add them individually or auto-fill from the schedule.
                </div>
              )}
              {cheques.map((c, i) => (
                <div key={i} className="grid md:grid-cols-12 gap-2 items-end rounded-lg border border-border bg-muted/20 p-3">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Bank</label>
                    <WInput value={c.bank} onChange={(e) => updateCheque(i, { bank: e.target.value })} placeholder="HBL / MCB / UBL" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Cheque #</label>
                    <WInput value={c.cheque} onChange={(e) => updateCheque(i, { cheque: e.target.value })} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Date</label>
                    <WInput type="date" value={c.date} onChange={(e) => updateCheque(i, { date: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Amount</label>
                    <WInput type="number" value={c.amount} onChange={(e) => updateCheque(i, { amount: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-1 flex md:justify-end">
                    <button onClick={() => removeCheque(i)} className="h-10 w-10 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button onClick={addCheque} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add Cheque</button>
                <button onClick={autoFillCheques} disabled={!schedule.length} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40">Auto-fill from schedule</button>
              </div>
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<UsersIcon className="h-4 w-4" />} title="Guarantors" description="At least one guarantor is required. Captured fields match the Guarantors register.">
          {guarantorList.map((g, i) => (
            <FormRowFull key={i} tone={i % 2 === 1 ? "muted" : undefined}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Guarantor {i + 1}{i === 0 && <span className="ml-2 text-primary normal-case">â€¢ Primary</span>}</div>
                {guarantorList.length > 1 && <button onClick={() => removeGuarantor(i)} className="h-7 w-7 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                <Mini label="Guarantor Name" required={i === 0}><WInput value={g.name} onChange={(e) => updateGuarantor(i, { name: e.target.value })} /></Mini>
                <Mini label="CNIC" required={i === 0}><WInput value={g.cnic} onChange={(e) => updateGuarantor(i, { cnic: e.target.value })} placeholder="35202-â€¦" /></Mini>
                <Mini label="Mobile" required={i === 0}><WInput value={g.phone} onChange={(e) => updateGuarantor(i, { phone: e.target.value })} /></Mini>
                <Mini label="Alternate Phone"><WInput value={g.altPhone} onChange={(e) => updateGuarantor(i, { altPhone: e.target.value })} /></Mini>
                <Mini label="City / Area"><WInput value={g.city} onChange={(e) => updateGuarantor(i, { city: e.target.value })} /></Mini>
                <Mini label="Relation to Customer"><WSelect value={g.relation} onChange={(v) => updateGuarantor(i, { relation: v })} options={RELATIONS} /></Mini>
                <Mini label="Occupation"><WInput value={g.occupation} onChange={(e) => updateGuarantor(i, { occupation: e.target.value })} /></Mini>
                <Mini label="Monthly Income (Rs.)"><WInput type="number" value={g.income} onChange={(e) => updateGuarantor(i, { income: Number(e.target.value) })} /></Mini>
                <Mini label="Residential Address" full><WTextarea value={g.address} onChange={(e) => updateGuarantor(i, { address: e.target.value })} /></Mini>
              </div>
            </FormRowFull>
          ))}
          <FormRowFull>
            <button onClick={addGuarantor} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add Guarantor</button>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<UploadCloud className="h-4 w-4" />} title="Documents" description="Upload required verification documents.">
          <FormRowFull>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DOC_TYPES.map((d) => {
                const file = docs.find((x) => x.key === d.key);
                return (
                  <div key={d.key} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${file ? "border-success/40 bg-success/5" : "border-border bg-muted/20"}`}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {d.label} {d.required && <span className="text-destructive">*</span>}
                        {file && <Check className="h-3.5 w-3.5 text-success" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{file ? `${file.name} â€¢ ${(file.size / 1024).toFixed(0)} KB` : d.hint}</div>
                    </div>
                    {file ? (
                      <button onClick={() => removeDoc(d.key)} className="h-8 w-8 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => askUpload(d.key)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"><UploadCloud className="h-3.5 w-3.5" /> Upload</button>
                    )}
                  </div>
                );
              })}
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<ShieldCheck className="h-4 w-4" />} title="Compliance & Approval" description="Verification checks and acknowledgements.">
          <FormRow label="KYC Checks" align="start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <WSwitch checked={kycCnic} onChange={setKycCnic} label="CNIC Verified (NADRA Verisys)" hint="Customer identity confirmed" />
              <WSwitch checked={kycAddress} onChange={setKycAddress} label="Address Verified" hint="Physical or utility bill check" />
              <WSwitch checked={kycIncome} onChange={setKycIncome} label="Income / Employment Verified" hint="Pay slip / bank statement / call" />
              <WSwitch checked={kycReferences} onChange={setKycReferences} label="Guarantor References Contacted" hint="Phone confirmation done" />
            </div>
          </FormRow>
          <FormRow label="Internal Notes" hint="Approval conditions, exceptions or remarks">
            <WTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Special pricing approved by RM â€¢ Customer requested split delivery â€¢ ..." />
          </FormRow>
          <FormRow label="Terms Acceptance" required align="center">
            <WSwitch checked={acceptedTerms} onChange={setAcceptedTerms} label="Customer has reviewed & accepted the contract terms" hint="Required before saving" />
          </FormRow>
        </FormSection>
      </FormCard>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,16rem)] z-30 border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs">
            {error ? <span className="text-destructive font-semibold flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {error}</span> : <span className="text-muted-foreground">Will be saved as <strong className="text-foreground">Under Process</strong>{plan ? ` Â· ${tenure} Ã— ${Rs(monthly)}` : ""}.</span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => (onClose ? onClose() : navigate({ to: "/contracts" }))} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
            <button type="button" onClick={handleSave} className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
              <Save className="h-4 w-4" /> Create Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2 lg:col-span-3" : ""}>
      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ---------- Customer Combobox ---------- */
function CustomerCombo({ value, customers, onPick, onNew }: {
  value: string;
  customers: any[];
  onPick: (c: any) => void;
  onNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.toLowerCase();
  const filtered = customers.filter((c) =>
    !q || [c.name, c.cnic, c.phone].some((v: any) => String(v || "").toLowerCase().includes(q))
  );

  return (
    <div ref={wrapRef} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="h-10 w-full pl-3 pr-9 rounded-md border border-border bg-card text-sm text-left flex items-center focus:outline-none focus:ring-1 focus:ring-primary">
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || "Select customerâ€¦"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </button>
      {open && (
        <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border relative">
            <Search className="h-3.5 w-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, CNIC, phoneâ€¦"
              className="h-9 w-full pl-8 pr-3 rounded-md border border-primary/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <ul className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted-foreground text-center">No customers found</li>
            )}
            {filtered.map((c) => {
              const selected = c.name === value;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => { onPick(c); setOpen(false); setQuery(""); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm ${selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span className={`h-9 w-9 rounded-full grid place-items-center text-sm font-semibold shrink-0 ${selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {(c.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold truncate">{c.name}</span>
                      <span className={`block text-xs truncate ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {c.cnic || "â€”"} â€¢ {c.phone || "â€”"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => { setOpen(false); onNew(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted">
            <Plus className="h-4 w-4" /> New Customer
          </button>
        </div>
      )}
    </div>
  );
}

function KV({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</span>
      <span className={`font-bold ${accent ? "text-primary" : "text-foreground"}`}>{v}</span>
    </div>
  );
}
