import { useState } from "react";
import { StepWizard, WField, WInput, WTextarea, WSelect, WGrid, WChips, WSwitch } from "@/components/StepWizard";

const AREAS = ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Bahria Town", "Wapda Town", "Faisal Town"];
const OCCUPATIONS = ["Salaried (Govt.)", "Salaried (Private)", "Business Owner", "Shopkeeper", "Doctor", "Teacher", "Driver", "Engineer", "Freelancer", "Other"];
const STATUSES = ["Active", "Inactive", "Blacklisted"];
const ID_TYPES = ["CNIC", "Passport", "B-Form"];
const REFS = ["Walk-in", "Facebook Ad", "Google Ad", "Existing Customer", "Recovery Agent", "Branch Manager", "Salesman"];

export function CustomerWizard({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    // Identity
    name: initial?.name ?? "",
    father: initial?.father ?? "",
    gender: initial?.gender ?? "Male",
    dob: initial?.dob ?? "",
    maritalStatus: initial?.maritalStatus ?? "Single",
    // KYC
    idType: initial?.idType ?? "CNIC",
    cnic: initial?.cnic ?? "",
    cnicIssue: initial?.cnicIssue ?? "",
    cnicExpiry: initial?.cnicExpiry ?? "",
    nationality: initial?.nationality ?? "Pakistani",
    // Contact
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    email: initial?.email ?? "",
    altPhone: initial?.altPhone ?? "",
    // Address
    address: initial?.address ?? "",
    permanentAddress: initial?.permanentAddress ?? "",
    sameAddress: initial?.sameAddress ?? true,
    area: initial?.area ?? "",
    city: initial?.city ?? "Lahore",
    mapsLink: initial?.mapsLink ?? "",
    // Employment
    occupation: initial?.occupation ?? "",
    employer: initial?.employer ?? "",
    designation: initial?.designation ?? "",
    income: initial?.income ?? 0,
    otherIncome: initial?.otherIncome ?? 0,
    yearsExperience: initial?.yearsExperience ?? 0,
    // Risk & Status
    risk: initial?.risk ?? 30,
    status: initial?.status ?? "Active",
    referredBy: initial?.referredBy ?? "Walk-in",
    tags: initial?.tags ?? [],
    notes: initial?.notes ?? "",
    // Documents
    documents: initial?.documents ?? [],
  }));

  function set<K extends keyof typeof v>(k: K, val: any) { setV((p: any) => ({ ...p, [k]: val })); }
  function toggle(arrKey: string, val: string) {
    setV((p: any) => {
      const cur: string[] = p[arrKey] ?? [];
      return { ...p, [arrKey]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  }

  const steps = [
    {
      key: "basic", title: "Basic Info", description: "Identity & personal details",
      validate: () => !v.name ? "Customer name is required" : null,
      render: () => (
        <WGrid>
          <WField label="Full Name" required><WInput value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sara Khan" /></WField>
          <WField label="Father / Husband Name"><WInput value={v.father} onChange={(e) => set("father", e.target.value)} /></WField>
          <WField label="Gender"><WSelect value={v.gender} onChange={(x) => set("gender", x)} options={["Male", "Female", "Other"]} /></WField>
          <WField label="Date of Birth"><WInput type="date" value={v.dob} onChange={(e) => set("dob", e.target.value)} /></WField>
          <WField label="Marital Status"><WSelect value={v.maritalStatus} onChange={(x) => set("maritalStatus", x)} options={["Single", "Married", "Widowed", "Divorced"]} /></WField>
          <WField label="Nationality"><WInput value={v.nationality} onChange={(e) => set("nationality", e.target.value)} /></WField>
        </WGrid>
      ),
    },
    {
      key: "kyc", title: "KYC / ID", description: "Identity verification",
      validate: () => !v.cnic ? "CNIC / ID number is required" : null,
      render: () => (
        <WGrid>
          <WField label="ID Type"><WSelect value={v.idType} onChange={(x) => set("idType", x)} options={ID_TYPES} /></WField>
          <WField label="CNIC / ID Number" required><WInput value={v.cnic} onChange={(e) => set("cnic", e.target.value)} placeholder="XXXXX-XXXXXXX-X" /></WField>
          <WField label="Issue Date"><WInput type="date" value={v.cnicIssue} onChange={(e) => set("cnicIssue", e.target.value)} /></WField>
          <WField label="Expiry Date"><WInput type="date" value={v.cnicExpiry} onChange={(e) => set("cnicExpiry", e.target.value)} /></WField>
        </WGrid>
      ),
    },
    {
      key: "contact", title: "Contact", description: "Phone, WhatsApp & email",
      validate: () => !v.phone ? "Mobile number is required" : null,
      render: () => (
        <WGrid>
          <WField label="Mobile" required><WInput type="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="300 1234567" /></WField>
          <WField label="WhatsApp"><WInput type="tel" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="300 1234567" /></WField>
          <WField label="Alt Phone"><WInput type="tel" value={v.altPhone} onChange={(e) => set("altPhone", e.target.value)} /></WField>
          <WField label="Email"><WInput type="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="customer@example.com" /></WField>
        </WGrid>
      ),
    },
    {
      key: "address", title: "Address", description: "Current & permanent address",
      render: () => (
        <div className="space-y-4">
          <WGrid>
            <WField label="Area / Zone"><WSelect value={v.area} onChange={(x) => set("area", x)} options={AREAS} /></WField>
            <WField label="City"><WInput value={v.city} onChange={(e) => set("city", e.target.value)} /></WField>
            <WField label="Google Maps Link"><WInput value={v.mapsLink} onChange={(e) => set("mapsLink", e.target.value)} placeholder="https://goo.gl/maps/..." /></WField>
          </WGrid>
          <WField label="Current Address" full><WTextarea value={v.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area, city" /></WField>
          <WSwitch checked={v.sameAddress} onChange={(c) => set("sameAddress", c)} label="Permanent address same as current" />
          {!v.sameAddress && (
            <WField label="Permanent Address" full><WTextarea value={v.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} /></WField>
          )}
        </div>
      ),
    },
    {
      key: "employment", title: "Employment & Income", description: "Job & affordability",
      render: () => (
        <WGrid>
          <WField label="Occupation"><WSelect value={v.occupation} onChange={(x) => set("occupation", x)} options={OCCUPATIONS} /></WField>
          <WField label="Employer / Business"><WInput value={v.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Company / Shop name" /></WField>
          <WField label="Designation"><WInput value={v.designation} onChange={(e) => set("designation", e.target.value)} /></WField>
          <WField label="Years of Experience"><WInput type="number" value={v.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value))} /></WField>
          <WField label="Monthly Income (Rs.)"><WInput type="number" moneyField value={v.income} onChange={(e) => set("income", Number(e.target.value))} /></WField>
          <WField label="Other Income (Rs.)"><WInput type="number" moneyField value={v.otherIncome} onChange={(e) => set("otherIncome", Number(e.target.value))} /></WField>
        </WGrid>
      ),
    },
    {
      key: "risk", title: "Risk & Tags", description: "Score, source & tags",
      render: () => (
        <div className="space-y-5">
          <WGrid>
            <WField label="Risk Score (0-100)" hint="Higher = riskier"><WInput type="number" min={0} max={100} value={v.risk} onChange={(e) => set("risk", Number(e.target.value))} /></WField>
            <WField label="Status"><WSelect value={v.status} onChange={(x) => set("status", x)} options={STATUSES} /></WField>
            <WField label="Referred By"><WSelect value={v.referredBy} onChange={(x) => set("referredBy", x)} options={REFS} /></WField>
          </WGrid>
          <WField label="Tags" full hint="Quick labels — VIP, Repeat, Cash-only, etc.">
            <WChips value={v.tags} onToggle={(x) => toggle("tags", x)} options={["VIP", "Repeat", "Cash Buyer", "Government", "Salaried", "High Risk", "Defaulter History"]} />
          </WField>
          <WField label="Internal Notes" full><WTextarea value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything the team should know…" /></WField>
        </div>
      ),
    },
    {
      key: "review", title: "Review & Save", description: "Confirm details",
      render: () => (
        <div className="space-y-4 text-sm">
          <SummarySection title="Identity" rows={[["Name", v.name], ["Father/Husband", v.father || "—"], ["Gender", v.gender], ["DOB", v.dob || "—"]]} />
          <SummarySection title="KYC" rows={[["ID Type", v.idType], ["CNIC / ID", v.cnic], ["Expiry", v.cnicExpiry || "—"]]} />
          <SummarySection title="Contact" rows={[["Mobile", v.phone], ["WhatsApp", v.whatsapp || "—"], ["Email", v.email || "—"]]} />
          <SummarySection title="Address" rows={[["Area", v.area || "—"], ["City", v.city], ["Address", v.address || "—"]]} />
          <SummarySection title="Employment" rows={[["Occupation", v.occupation || "—"], ["Employer", v.employer || "—"], ["Income", `Rs. ${Number(v.income || 0).toLocaleString()}`]]} />
          <SummarySection title="Risk" rows={[["Risk Score", String(v.risk)], ["Status", v.status], ["Referred By", v.referredBy], ["Tags", (v.tags || []).join(", ") || "—"]]} />
        </div>
      ),
    },
  ];

  return (
    <StepWizard
      title="Customer"
      subtitle="Onboard a new customer with full KYC, contact, employment & risk profile"
      isEdit={isEdit}
      steps={steps}
      onClose={onClose}
      onSave={() => onSubmit(v)}
      pageMode={pageMode}
    />
  );
}

function SummarySection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{title}</div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-slate-200/70 py-1">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-semibold text-slate-800 text-right truncate">{val}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
