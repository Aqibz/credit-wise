import { useMemo, useState } from "react";
import { Search, Download, CalendarDays, ClipboardCheck, Clock, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import {
  LEAVES, BRANCHES, DEPARTMENTS, LEAVE_TYPES, LEAVE_STATUSES,
  type Branch, type Department, type LeaveType, type LeaveStatus,
  downloadCSV,
} from "@/lib/ops-mock";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";

type AnyOpt<T extends string> = "All" | T;

function statusBadge(s: LeaveStatus) {
  const tone = s === "Approved" ? "success" : s === "Pending" ? "warning" : "destructive";
  return <Badge tone={tone}>{s}</Badge>;
}

function LeavesDrilldown() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<AnyOpt<Branch>>("All");
  const [dept, setDept] = useState<AnyOpt<Department>>("All");
  const [type, setType] = useState<AnyOpt<LeaveType>>("All");
  const [status, setStatus] = useState<AnyOpt<LeaveStatus>>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LEAVES.filter((r) => {
      if (branch !== "All" && r.branch !== branch) return false;
      if (dept !== "All" && r.department !== dept) return false;
      if (type !== "All" && r.type !== type) return false;
      if (status !== "All" && r.status !== status) return false;
      if (needle && !`${r.employee} ${r.empCode} ${r.reason}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, branch, dept, type, status]);

  const totals = useMemo(() => {
    const days = filtered.reduce((s, r) => s + r.days, 0);
    const pending = filtered.filter((r) => r.status === "Pending").length;
    const approved = filtered.filter((r) => r.status === "Approved").length;
    return { days, pending, approved, count: filtered.length };
  }, [filtered]);

  const anyFilter = q || branch !== "All" || dept !== "All" || type !== "All" || status !== "All";
  const reset = () => { setQ(""); setBranch("All"); setDept("All"); setType("All"); setStatus("All"); };

  function exportCSV() {
    downloadCSV(`hr-leaves-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Employee", "Code", "Department", "Branch", "Type", "From", "To", "Days", "Status", "Reason"],
      ...filtered.map((r) => [r.employee, r.empCode, r.department, r.branch, r.type, r.from, r.to, r.days, r.status, r.reason]),
    ]);
  }

  return (
    <>
      <PageHeader
        title="HR · Leaves Drilldown"
        description="Approved, pending and rejected leave requests across the workforce."
        actions={
          <button onClick={exportCSV} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Requests" value={totals.count} hint="Matching filters" icon={<KpiIcon icon={CalendarDays} />} tone="primary" />
        <StatCard label="Pending" value={totals.pending} hint="Awaiting approval" icon={<KpiIcons.clock />} tone="warning" />
        <StatCard label="Approved" value={totals.approved} hint="Ready to take" icon={<KpiIcon icon={ClipboardCheck} />} tone="success" />
        <StatCard label="Total Days" value={totals.days} hint="Sum of leave days" icon={<KpiIcon icon={CalendarDays} />} tone="primary" />
      </div>

      <div className="rounded-lg border border-border bg-card p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-2">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employee, code or reason…"
              className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <FilterSelect label="Branch" value={branch} onChange={(v) => setBranch(v as AnyOpt<Branch>)} options={["All", ...BRANCHES]} />
          <FilterSelect label="Department" value={dept} onChange={(v) => setDept(v as AnyOpt<Department>)} options={["All", ...DEPARTMENTS]} />
          <FilterSelect label="Type" value={type} onChange={(v) => setType(v as AnyOpt<LeaveType>)} options={["All", ...LEAVE_TYPES]} />
          <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as AnyOpt<LeaveStatus>)} options={["All", ...LEAVE_STATUSES]} />
        </div>
        {anyFilter && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">{filtered.length} of {LEAVES.length} requests</div>
            <button onClick={reset} className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <X className="h-3 w-3" /> Reset filters
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className={ui.tableHeadRow}>
              <tr className="text-left">
                <Th>Employee</Th><Th>Code</Th><Th>Department</Th><Th>Branch</Th>
                <Th>Type</Th><Th>From</Th><Th>To</Th><Th right>Days</Th><Th>Status</Th><Th>Reason</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-10 text-center text-muted-foreground">No leave requests match the current filters.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <Td className="font-medium">{r.employee}</Td>
                  <Td className="font-mono text-muted-foreground">{r.empCode}</Td>
                  <Td>{r.department}</Td>
                  <Td>{r.branch}</Td>
                  <Td><Badge tone="muted">{r.type}</Badge></Td>
                  <Td>{r.from}</Td>
                  <Td>{r.to}</Td>
                  <Td right className="tabular-nums">{r.days}</Td>
                  <Td>{statusBadge(r.status)}</Td>
                  <Td className="text-muted-foreground">{r.reason}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export { LeavesDrilldown as LeavesDrilldownPage };

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  return (
    <label className="block">
      <span className={`${ui.textKpiLabel} ${ui.textMuted} block text-[10px] mb-1`}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-8 px-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`${ui.tableHeadCell} ${right ? "!text-right" : ""}`}>{children}</th>;
}
function Td({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-2 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

