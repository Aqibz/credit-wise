import { Link } from "@/shared/navigation";
import { useMemo, useState, ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import { useEntityStore } from "@/lib/state/useEntityStore";
import {
  employeesConfig, attendanceConfig, payrollConfig, commissionsConfig,
  loanManagementConfig, leavesConfig, hrAssetsConfig,
} from "@/lib/entities";
import {
  ArrowLeft, User, Clock, Wallet, HandCoins, Calendar, Briefcase,
  Phone, Mail, MapPin, ShieldCheck, CreditCard, Box, FileText,
  CheckCircle2, Building2, Pencil,
} from "lucide-react";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type Tab = { key: string; label: string; icon: ReactNode };
const TABS: Tab[] = [
  { key: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
  { key: "attendance", label: "Attendance", icon: <Clock className="h-4 w-4" /> },
  { key: "leaves", label: "Leaves", icon: <Calendar className="h-4 w-4" /> },
  { key: "payroll", label: "Payroll", icon: <Wallet className="h-4 w-4" /> },
  { key: "commissions", label: "Commissions", icon: <HandCoins className="h-4 w-4" /> },
  { key: "loans", label: "Loans", icon: <CreditCard className="h-4 w-4" /> },
  { key: "assets", label: "Assets", icon: <Box className="h-4 w-4" /> },
  { key: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
];

export function EmployeeProfilePage({ employeeId }: { employeeId: string }) {
  const [tab, setTab] = useState("overview");

  const { items: employees } = useEntityStore<any>(employeesConfig.storageKey, employeesConfig.seed);
  const { items: attendance } = useEntityStore<any>(attendanceConfig.storageKey, attendanceConfig.seed);
  const { items: payroll } = useEntityStore<any>(payrollConfig.storageKey, payrollConfig.seed);
  const { items: commissions } = useEntityStore<any>(commissionsConfig.storageKey, commissionsConfig.seed);
  const { items: loans } = useEntityStore<any>(loanManagementConfig.storageKey, loanManagementConfig.seed);
  const { items: leaves } = useEntityStore<any>(leavesConfig.storageKey, leavesConfig.seed);
  const { items: assets } = useEntityStore<any>(hrAssetsConfig.storageKey, hrAssetsConfig.seed);

  const employee = employees.find((e) => e.id === employeeId);

  const eAttendance = useMemo(() => attendance.filter((a) => a.employee === employee?.name), [attendance, employee]);
  const ePayroll = useMemo(() => payroll.filter((p) => p.employee === employee?.name), [payroll, employee]);
  const eCommissions = useMemo(() => commissions.filter((c) => c.employee === employee?.name), [commissions, employee]);
  const eLoans = useMemo(() => loans.filter((l) => l.employee === employee?.name), [loans, employee]);
  const eLeaves = useMemo(() => leaves.filter((l) => l.employee === employee?.name), [leaves, employee]);
  const eAssets = useMemo(() => assets.filter((a) => a.assignedTo === employee?.name), [assets, employee]);

  const totalPaid = ePayroll.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.net || 0), 0);
  const totalCommission = eCommissions.reduce((s, c) => s + Number(c.amount || 0), 0);
  const presentDays = eAttendance.filter((a) => a.status === "Present").length;
  const absentDays = eAttendance.filter((a) => a.status === "Absent").length;
  const leaveDays = eAttendance.filter((a) => a.status === "Leave").length;
  const attendanceRate = eAttendance.length ? Math.round((presentDays / eAttendance.length) * 100) : 100;
  const activeLoans = eLoans.filter((l) => l.status === "Active").length;
  const loanBalance = eLoans.reduce((s, l) => s + Number(l.balance || 0), 0);

  if (!employee) {
    return (
      <AppShell>
        <PageHeader title="Employee Not Found" description="The employee you are looking for does not exist." />
        <div className="rounded-lg bg-card p-12 text-center text-muted-foreground">
          <Link to="/hr/employees" className="text-primary font-medium inline-flex items-center gap-1 hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Employees</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={employee.name}
        description={`${employee.code || "Employee"} â€¢ ${employee.designation || "â€”"} â€¢ ${employee.branch || "â€”"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/hr/employees/$employeeId/edit" params={{ employeeId }} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <Link to="/hr/employees" className="text-primary text-xs font-medium inline-flex items-center gap-1 hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </div>
        }
      />

      <div className="rounded-xl bg-card p-5 shadow-[0_4px_16px_-6px_rgba(16,24,40,0.10)] mb-4 animate-fade-in">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary grid place-items-center text-primary-foreground text-xl font-semibold shrink-0">
            {String(employee.name).split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">{employee.name}</h2>
              <Badge tone={employee.status === "Active" ? "success" : employee.status === "On Leave" ? "warning" : "muted"}>{employee.status || "Active"}</Badge>
              {employee.designation && <Badge tone="primary">{employee.designation}</Badge>}
              {employee.employmentType && <Badge tone="muted">{employee.employmentType}</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              {employee.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {employee.phone}</span>}
              {employee.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {employee.email}</span>}
              {employee.branch && <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {employee.branch}</span>}
              {employee.joinDate && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {employee.joinDate}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`${ui.textKpiLabel} ${ui.textMuted} text-[10px]`}>Basic Salary</div>
            <div className="text-2xl font-bold text-primary leading-none mt-0.5">{Rs(employee.salary)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">per month</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <StatCard label="Attendance" value={`${attendanceRate}%`} icon={<KpiIcons.success />} tone={attendanceRate >= 90 ? "success" : "warning"} hint={`${presentDays}P / ${absentDays}A / ${leaveDays}L`} />
        <StatCard label="Payroll Runs" value={ePayroll.length} icon={<KpiIcons.wallet />} tone="primary" hint={`${Rs(totalPaid)} paid`} />
        <StatCard label="Commissions" value={Rs(totalCommission)} icon={<KpiIcon icon={HandCoins} />} tone="success" hint={`${eCommissions.length} entries`} />
        <StatCard label="Active Loans" value={activeLoans} icon={<KpiIcons.card />} tone={loanBalance > 0 ? "warning" : "success"} hint={`${Rs(loanBalance)} balance`} />
        <StatCard label="Leaves" value={eLeaves.length} icon={<KpiIcons.calendar />} tone="primary" hint="All time" />
        <StatCard label="Assets" value={eAssets.length} icon={<KpiIcon icon={Box} />} tone="primary" hint="Assigned" />
      </div>

      <div className="rounded-xl bg-card shadow-[0_4px_16px_-6px_rgba(16,24,40,0.10)] overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto bg-muted/30">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors ${
                tab === t.key ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 animate-fade-in" key={tab}>
          {tab === "overview" && <OverviewTab employee={employee} />}

          {tab === "attendance" && (
            <Table
              headers={["Date", "Check In", "Check Out", "Status", "Notes"]}
              rows={eAttendance.map((a) => [a.date, a.checkIn || "â€”", a.checkOut || "â€”", <Badge key="s" tone={a.status === "Present" ? "success" : a.status === "Absent" ? "destructive" : a.status === "Leave" ? "warning" : "muted"}>{a.status}</Badge>, a.notes || "â€”"])}
              empty="No attendance records." />
          )}

          {tab === "leaves" && (
            <Table
              headers={["From", "To", "Days", "Type", "Reason", "Status"]}
              rows={eLeaves.map((l) => [l.from || l.startDate || "â€”", l.to || l.endDate || "â€”", l.days || "â€”", l.type || "â€”", l.reason || "â€”", <Badge key="s" tone={l.status === "Approved" ? "success" : l.status === "Rejected" ? "destructive" : "warning"}>{l.status}</Badge>])}
              empty="No leave applications." />
          )}

          {tab === "payroll" && (
            <Table
              headers={["Month", "Basic", "Allowances", "Deductions", "Net", "Status"]}
              rows={ePayroll.map((p) => [p.month, Rs(p.basic), Rs(p.allowances), Rs(p.deductions), Rs(p.net), <Badge key="s" tone={p.status === "Paid" ? "success" : p.status === "Approved" ? "primary" : "warning"}>{p.status}</Badge>])}
              empty="No payroll records." />
          )}

          {tab === "commissions" && (
            <Table
              headers={["Month", "Type", "Base", "Rate", "Amount", "Status"]}
              rows={eCommissions.map((c) => [c.month, c.type, Rs(c.base), `${c.rate || 0}%`, Rs(c.amount), <Badge key="s" tone={c.status === "Paid" ? "success" : "warning"}>{c.status}</Badge>])}
              empty="No commissions earned yet." />
          )}

          {tab === "loans" && (
            <Table
              headers={["Ref", "Date", "Amount", "Installment", "Balance", "Status"]}
              rows={eLoans.map((l) => [l.ref || l.id, l.date || "â€”", Rs(l.amount), Rs(l.installment), Rs(l.balance), <Badge key="s" tone={l.status === "Active" ? "primary" : l.status === "Closed" ? "success" : "warning"}>{l.status}</Badge>])}
              empty="No loans." />
          )}

          {tab === "assets" && (
            <Table
              headers={["Asset", "Category", "Tag #", "Assigned On", "Condition"]}
              rows={eAssets.map((a) => [a.name, a.category || "â€”", a.tag || "â€”", a.assignedDate || "â€”", <Badge key="s" tone={a.condition === "Good" ? "success" : a.condition === "Damaged" ? "destructive" : "warning"}>{a.condition || "â€”"}</Badge>])}
              empty="No assets assigned." />
          )}

          {tab === "documents" && (
            <div className="space-y-3">
              {(employee.documents || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No documents uploaded.</div>
              ) : (
                <Table
                  headers={["Type", "Name", "Expiry"]}
                  rows={(employee.documents || []).map((d: any) => [d.type, d.name, d.expiry || "â€”"])}
                  empty="No documents."
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function OverviewTab({ employee }: { employee: any }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal Details</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            ["Father / Husband", employee.father || "â€”"],
            ["CNIC", employee.cnic || "â€”"],
            ["Date of Birth", employee.dob || "â€”"],
            ["Gender", employee.gender || "â€”"],
            ["Blood Group", employee.blood || "â€”"],
            ["Marital Status", employee.maritalStatus || "â€”"],
            ["Mobile", employee.phone || "â€”"],
            ["Email", employee.email || "â€”"],
            ["City", employee.city || "â€”"],
            ["Address", employee.address || "â€”"],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center justify-between border-b border-border/60 py-2 gap-3">
              <span className="text-muted-foreground font-medium">{k}</span>
              <span className="text-foreground font-semibold text-right truncate max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3"><Briefcase className="h-3.5 w-3.5 text-primary" /> Employment</h3>
          <div className="space-y-2 text-sm">
            <Row k="Designation" v={employee.designation || "â€”"} />
            <Row k="Department" v={employee.department || "â€”"} />
            <Row k="Branch" v={employee.branch || "â€”"} />
            <Row k="Shift" v={employee.shift || "â€”"} />
            <Row k="Type" v={employee.employmentType || "â€”"} />
            <Row k="Reports To" v={employee.reportingTo || "â€”"} />
            <Row k="Join Date" v={employee.joinDate || "â€”"} />
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2 mb-3"><ShieldCheck className="h-3.5 w-3.5" /> Emergency Contact</h3>
          <div className="space-y-2 text-sm">
            <Row k="Name" v={employee.emergencyName || "â€”"} />
            <Row k="Relation" v={employee.emergencyRelation || "â€”"} />
            <Row k="Phone" v={employee.emergencyPhone || "â€”"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-1.5">
      <span className="text-muted-foreground text-xs font-medium">{k}</span>
      <span className="text-foreground font-semibold text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}

function Table({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty: string }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">{empty}</div>;
  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className={ui.tableHeadRow}>
          <tr>{headers.map((h) => <th key={h} className="text-left px-3 py-3">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/30">
              {r.map((c, j) => <td key={j} className="px-3 py-3 text-foreground/85 font-medium">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

void MapPin;
