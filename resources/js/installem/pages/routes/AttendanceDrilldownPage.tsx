import { useMemo, useState } from "react";
import { Search, Download, Users, UserCheck, UserX, Clock, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import {
  ATTENDANCE, BRANCHES, DEPARTMENTS, ATTENDANCE_STATUSES,
  type Branch, type Department, type AttendanceStatus,
  downloadCSV,
} from "@/lib/ops-mock";
import { KpiIcons } from "@/components/kpi-icons";

type AnyOpt<T extends string> = "All" | T;

function statusBadge(s: AttendanceStatus) {
  const tone =
    s === "Present" ? "success" :
    s === "Late" ? "warning" :
    s === "Absent" ? "destructive" :
    s === "Leave" ? "primary" : "muted";
  return <Badge tone={tone}>{s}</Badge>;
}

function AttendanceDrilldown() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<AnyOpt<Branch>>("All");
  const [dept, setDept] = useState<AnyOpt<Department>>("All");
  const [status, setStatus] = useState<AnyOpt<AttendanceStatus>>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ATTENDANCE.filter((r) => {
      if (branch !== "All" && r.branch !== branch) return false;
      if (dept !== "All" && r.department !== dept) return false;
      if (status !== "All" && r.status !== status) return false;
      if (needle && !`${r.employee} ${r.empCode}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, branch, dept, status]);

  const totals = useMemo(() => {
    const present = filtered.filter((r) => r.status === "Present").length;
    const late = filtered.filter((r) => r.status === "Late").length;
    const absent = filtered.filter((r) => r.status === "Absent").length;
    const leave = filtered.filter((r) => r.status === "Leave").length;
    const hours = filtered.reduce((s, r) => s + r.hours, 0);
    const pct = filtered.length ? Math.round(((present + late) / filtered.length) * 100) : 0;
    return { present, late, absent, leave, hours, pct, count: filtered.length };
  }, [filtered]);

  const anyFilter = q || branch !== "All" || dept !== "All" || status !== "All";
  const reset = () => { setQ(""); setBranch("All"); setDept("All"); setStatus("All"); };

  function exportCSV() {
    downloadCSV(`hr-attendance-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Employee", "Code", "Department", "Branch", "Date", "Status", "Check In", "Check Out", "Hours"],
      ...filtered.map((r) => [r.employee, r.empCode, r.department, r.branch, r.date, r.status, r.checkIn ?? "", r.checkOut ?? "", r.hours]),
    ]);
  }

  return (
    <>
      <PageHeader
        title="HR · Attendance Drilldown"
        description="Today's roll-call across branches and departments."
        actions={
          <button onClick={exportCSV} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="Headcount" value={totals.count} hint="Filtered roster" icon={<KpiIcons.customers />} tone="primary" />
        <StatCard label="Present" value={totals.present} hint={`${totals.pct}% attendance`} icon={<KpiIcons.activeUser />} tone="success" />
        <StatCard label="Late" value={totals.late} hint="After 10:00 AM" icon={<KpiIcons.clock />} tone="warning" />
        <StatCard label="Absent" value={totals.absent} hint="No check-in" icon={<KpiIcons.inactiveUser />} tone="destructive" />
        <StatCard label="Hours Logged" value={totals.hours.toFixed(1)} hint="Across filtered staff" icon={<KpiIcons.clock />} tone="primary" />
      </div>

      <div className="rounded-lg border border-border bg-card p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employee or code…"
              className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <FilterSelect label="Branch" value={branch} onChange={(v) => setBranch(v as AnyOpt<Branch>)} options={["All", ...BRANCHES]} />
          <FilterSelect label="Department" value={dept} onChange={(v) => setDept(v as AnyOpt<Department>)} options={["All", ...DEPARTMENTS]} />
          <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as AnyOpt<AttendanceStatus>)} options={["All", ...ATTENDANCE_STATUSES]} />
        </div>
        {anyFilter && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">{filtered.length} of {ATTENDANCE.length} records</div>
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
                <Th>Date</Th><Th>Status</Th><Th>Check In</Th><Th>Check Out</Th><Th right>Hours</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">No records match the current filters.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <Td className="font-medium">{r.employee}</Td>
                  <Td className="font-mono text-muted-foreground">{r.empCode}</Td>
                  <Td>{r.department}</Td>
                  <Td>{r.branch}</Td>
                  <Td>{r.date}</Td>
                  <Td>{statusBadge(r.status)}</Td>
                  <Td>{r.checkIn ?? "—"}</Td>
                  <Td>{r.checkOut ?? "—"}</Td>
                  <Td right className="tabular-nums">{r.hours.toFixed(1)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export { AttendanceDrilldown as AttendanceDrilldownPage };

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

