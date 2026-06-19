import { useState } from "react";
import { StepWizard, WField, WInput, WTextarea, WSelect, WGrid, WChips, WSwitch } from "@/components/StepWizard";

const DESIGNATIONS = ["Branch Manager", "Salesman", "Cashier", "Recovery Agent", "Accountant", "Inventory Manager", "HR Manager", "IT Support", "Driver", "Security Guard"];
const DEPARTMENTS = ["Sales", "Recovery", "Accounts", "HR", "Inventory", "IT", "Operations", "Management"];
const BRANCHES = ["Head Office", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Bahria Town"];
const SHIFTS = ["Morning (9-6)", "Evening (2-11)", "Night (11-8)", "Rotational"];
const EMP_TYPES = ["Permanent", "Contract", "Probation", "Internship", "Daily Wages"];
const STATUSES = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"];
const PAY_METHODS = ["Bank Transfer", "Cash", "Cheque"];
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function EmployeeWizard({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    // Basic
    code: initial?.code ?? `EMP-${String(Math.floor(Math.random() * 900) + 100)}`,
    name: initial?.name ?? "",
    father: initial?.father ?? "",
    gender: initial?.gender ?? "Male",
    dob: initial?.dob ?? "",
    blood: initial?.blood ?? "",
    maritalStatus: initial?.maritalStatus ?? "Single",
    cnic: initial?.cnic ?? "",
    cnicExpiry: initial?.cnicExpiry ?? "",
    nationality: initial?.nationality ?? "Pakistani",
    // Employment
    designation: initial?.designation ?? "",
    department: initial?.department ?? "",
    branch: initial?.branch ?? "Head Office",
    shift: initial?.shift ?? "Morning (9-6)",
    employmentType: initial?.employmentType ?? "Permanent",
    joinDate: initial?.joinDate ?? "",
    probationEnd: initial?.probationEnd ?? "",
    reportingTo: initial?.reportingTo ?? "",
    status: initial?.status ?? "Active",
    // Contact & Address
    phone: initial?.phone ?? "",
    altPhone: initial?.altPhone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "Lahore",
    emergencyName: initial?.emergencyName ?? "",
    emergencyRelation: initial?.emergencyRelation ?? "",
    emergencyPhone: initial?.emergencyPhone ?? "",
    // Compensation
    salary: initial?.salary ?? 0,
    allowanceFuel: initial?.allowanceFuel ?? 0,
    allowanceMedical: initial?.allowanceMedical ?? 0,
    allowanceMobile: initial?.allowanceMobile ?? 0,
    deductionEobi: initial?.deductionEobi ?? 0,
    deductionTax: initial?.deductionTax ?? 0,
    payMethod: initial?.payMethod ?? "Bank Transfer",
    bankName: initial?.bankName ?? "",
    accountTitle: initial?.accountTitle ?? "",
    accountNo: initial?.accountNo ?? "",
    iban: initial?.iban ?? "",
    // Skills & Documents
    skills: initial?.skills ?? [],
    documents: initial?.documents ?? [],
    notes: initial?.notes ?? "",
    // Portal access
    portalEnabled: initial?.portalEnabled ?? false,
    portalEmail: initial?.portalEmail ?? "",
    portalPassword: initial?.portalPassword ?? "",
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
      key: "basic", title: "Basic Info", description: "Personal & ID details",
      validate: () => !v.name ? "Employee name is required" : !v.cnic ? "CNIC is required" : null,
      render: () => (
        <WGrid>
          <WField label="Employee Code" required><WInput value={v.code} onChange={(e) => set("code", e.target.value)} placeholder="EMP-001" /></WField>
          <WField label="Full Name" required><WInput value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Bilal Ahmed" /></WField>
          <WField label="Father / Husband Name"><WInput value={v.father} onChange={(e) => set("father", e.target.value)} /></WField>
          <WField label="Gender"><WSelect value={v.gender} onChange={(x) => set("gender", x)} options={["Male", "Female", "Other"]} /></WField>
          <WField label="Date of Birth"><WInput type="date" value={v.dob} onChange={(e) => set("dob", e.target.value)} /></WField>
          <WField label="Blood Group"><WSelect value={v.blood} onChange={(x) => set("blood", x)} options={BLOOD} /></WField>
          <WField label="Marital Status"><WSelect value={v.maritalStatus} onChange={(x) => set("maritalStatus", x)} options={["Single", "Married", "Widowed", "Divorced"]} /></WField>
          <WField label="Nationality"><WInput value={v.nationality} onChange={(e) => set("nationality", e.target.value)} /></WField>
          <WField label="CNIC" required><WInput value={v.cnic} onChange={(e) => set("cnic", e.target.value)} placeholder="XXXXX-XXXXXXX-X" /></WField>
          <WField label="CNIC Expiry"><WInput type="date" value={v.cnicExpiry} onChange={(e) => set("cnicExpiry", e.target.value)} /></WField>
        </WGrid>
      ),
    },
    {
      key: "employment", title: "Employment", description: "Designation, branch & joining",
      validate: () => !v.designation ? "Designation is required" : !v.joinDate ? "Join date is required" : null,
      render: () => (
        <WGrid>
          <WField label="Designation" required><WSelect value={v.designation} onChange={(x) => set("designation", x)} options={DESIGNATIONS} /></WField>
          <WField label="Department"><WSelect value={v.department} onChange={(x) => set("department", x)} options={DEPARTMENTS} /></WField>
          <WField label="Branch"><WSelect value={v.branch} onChange={(x) => set("branch", x)} options={BRANCHES} /></WField>
          <WField label="Shift"><WSelect value={v.shift} onChange={(x) => set("shift", x)} options={SHIFTS} /></WField>
          <WField label="Employment Type"><WSelect value={v.employmentType} onChange={(x) => set("employmentType", x)} options={EMP_TYPES} /></WField>
          <WField label="Status"><WSelect value={v.status} onChange={(x) => set("status", x)} options={STATUSES} /></WField>
          <WField label="Join Date" required><WInput type="date" value={v.joinDate} onChange={(e) => set("joinDate", e.target.value)} /></WField>
          <WField label="Probation End"><WInput type="date" value={v.probationEnd} onChange={(e) => set("probationEnd", e.target.value)} /></WField>
          <WField label="Reporting To"><WInput value={v.reportingTo} onChange={(e) => set("reportingTo", e.target.value)} placeholder="Manager name" /></WField>
        </WGrid>
      ),
    },
    {
      key: "contact", title: "Contact & Address", description: "Phones, address & emergency",
      validate: () => !v.phone ? "Phone is required" : null,
      render: () => (
        <div className="space-y-4">
          <WGrid>
            <WField label="Mobile" required><WInput type="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="300 1234567" /></WField>
            <WField label="Alt Phone"><WInput type="tel" value={v.altPhone} onChange={(e) => set("altPhone", e.target.value)} /></WField>
            <WField label="Email"><WInput type="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="employee@company.com" /></WField>
            <WField label="City"><WInput value={v.city} onChange={(e) => set("city", e.target.value)} /></WField>
          </WGrid>
          <WField label="Address" full><WTextarea value={v.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area, city" /></WField>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Emergency Contact</div>
            <WGrid>
              <WField label="Name"><WInput value={v.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} /></WField>
              <WField label="Relation"><WInput value={v.emergencyRelation} onChange={(e) => set("emergencyRelation", e.target.value)} placeholder="Father / Spouse / Brother" /></WField>
              <WField label="Phone"><WInput type="tel" value={v.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} /></WField>
            </WGrid>
          </div>
        </div>
      ),
    },
    {
      key: "compensation", title: "Compensation", description: "Salary, allowances & banking",
      validate: () => !v.salary ? "Basic salary is required" : null,
      render: () => (
        <div className="space-y-5">
          <WGrid>
            <WField label="Basic Salary (Rs.)" required><WInput type="number" moneyField value={v.salary} onChange={(e) => set("salary", Number(e.target.value))} /></WField>
            <WField label="Fuel Allowance"><WInput type="number" moneyField value={v.allowanceFuel} onChange={(e) => set("allowanceFuel", Number(e.target.value))} /></WField>
            <WField label="Medical Allowance"><WInput type="number" moneyField value={v.allowanceMedical} onChange={(e) => set("allowanceMedical", Number(e.target.value))} /></WField>
            <WField label="Mobile Allowance"><WInput type="number" moneyField value={v.allowanceMobile} onChange={(e) => set("allowanceMobile", Number(e.target.value))} /></WField>
            <WField label="EOBI Deduction"><WInput type="number" moneyField value={v.deductionEobi} onChange={(e) => set("deductionEobi", Number(e.target.value))} /></WField>
            <WField label="Tax Deduction"><WInput type="number" moneyField value={v.deductionTax} onChange={(e) => set("deductionTax", Number(e.target.value))} /></WField>
          </WGrid>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Salary Disbursement</div>
            <WGrid>
              <WField label="Pay Method"><WSelect value={v.payMethod} onChange={(x) => set("payMethod", x)} options={PAY_METHODS} /></WField>
              <WField label="Bank Name"><WInput value={v.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="HBL / MCB / Meezan" /></WField>
              <WField label="Account Title"><WInput value={v.accountTitle} onChange={(e) => set("accountTitle", e.target.value)} /></WField>
              <WField label="Account Number"><WInput value={v.accountNo} onChange={(e) => set("accountNo", e.target.value)} /></WField>
              <WField label="IBAN"><WInput value={v.iban} onChange={(e) => set("iban", e.target.value)} placeholder="PK00 ABCD ..." /></WField>
            </WGrid>
          </div>
        </div>
      ),
    },
    {
      key: "skills", title: "Skills & Notes", description: "Capabilities & remarks",
      render: () => (
        <div className="space-y-5">
          <WField label="Skills" full hint="Quick labels — language, software, certifications">
            <WChips value={v.skills} onToggle={(x) => toggle("skills", x)} options={["MS Office", "Accounting", "Customer Service", "Field Recovery", "Driving", "Inventory", "POS", "Negotiation", "Urdu", "Punjabi", "English"]} />
          </WField>
          <WField label="Internal Notes" full><WTextarea value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="HR remarks, performance notes…" /></WField>
        </div>
      ),
    },
    {
      key: "portal", title: "Portal Access", description: "Optional self-service login",
      validate: () => v.portalEnabled && (!v.portalEmail || !v.portalPassword) ? "Email and temporary password are required when portal access is enabled." : null,
      render: () => (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <WSwitch
              checked={v.portalEnabled}
              onChange={(c) => set("portalEnabled", c)}
              label="Enable Employee Portal Access"
              hint="Employee can log in to view their attendance, payslips and apply for leaves."
            />
          </div>
          {v.portalEnabled && (
            <WGrid>
              <WField label="Login Email" required>
                <WInput type="email" value={v.portalEmail} onChange={(e) => set("portalEmail", e.target.value)} placeholder={v.email || "employee@company.com"} />
              </WField>
              <WField label="Temporary Password" required hint="Share securely. Employee will reset on first login.">
                <div className="flex gap-2">
                  <WInput value={v.portalPassword} onChange={(e) => set("portalPassword", e.target.value)} placeholder="Tmp@1234" />
                  <button type="button" onClick={() => set("portalPassword", `Emp-${Math.random().toString(36).slice(2, 8)}`)} className="h-11 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0">Generate</button>
                </div>
              </WField>
            </WGrid>
          )}
        </div>
      ),
    },
    {
      key: "review", title: "Review & Save", description: "Confirm before saving",
      render: () => {
        const gross = Number(v.salary || 0) + Number(v.allowanceFuel || 0) + Number(v.allowanceMedical || 0) + Number(v.allowanceMobile || 0);
        const net = gross - Number(v.deductionEobi || 0) - Number(v.deductionTax || 0);
        return (
          <div className="space-y-4 text-sm">
            <SummarySection title="Basic" rows={[["Code", v.code], ["Name", v.name], ["CNIC", v.cnic], ["DOB", v.dob || "—"]]} />
            <SummarySection title="Employment" rows={[["Designation", v.designation || "—"], ["Department", v.department || "—"], ["Branch", v.branch], ["Type", v.employmentType], ["Status", v.status], ["Join Date", v.joinDate || "—"]]} />
            <SummarySection title="Contact" rows={[["Mobile", v.phone], ["Email", v.email || "—"], ["City", v.city], ["Emergency", `${v.emergencyName || "—"} (${v.emergencyPhone || "—"})`]]} />
            <SummarySection title="Compensation" rows={[["Basic", `Rs. ${Number(v.salary || 0).toLocaleString()}`], ["Gross", `Rs. ${gross.toLocaleString()}`], ["Net Pay", `Rs. ${net.toLocaleString()}`], ["Pay Method", v.payMethod]]} />
            <SummarySection title="Portal" rows={[["Enabled", v.portalEnabled ? "Yes" : "No"], ["Login Email", v.portalEnabled ? v.portalEmail || "—" : "—"]]} />
          </div>
        );
      },
    },
  ];

  return (
    <StepWizard
      title="Employee"
      subtitle="Onboard a new team member with full HR, payroll & portal setup"
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
