import { Link } from "@/shared/navigation";
import { useMemo, useState } from "react";
import { Search, Download, Wallet, Receipt, Users, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import {
  COLLECTIONS, BRANCHES, COLLECTION_METHODS, INSTALLMENT_STATUSES,
  type Branch, type CollectionMethod, type InstallmentStatus,
  fmtRs,
} from "@/lib/mocks/sales";
import { KpiIcons } from "@/components/kpi-icons";

type AnyOpt<T extends string> = "All" | T;

function instBadge(s?: InstallmentStatus) {
  if (!s) return <span className="text-[11px] text-muted-foreground"> - </span>;
  const tone = s === "On Track" ? "success" : s === "Due Soon" ? "warning" : s === "Overdue" ? "destructive" : "muted";
  return <Badge tone={tone}>{s}</Badge>;
}

export function CollectionsDrilldown() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<AnyOpt<Branch>>("All");
  const [method, setMethod] = useState<AnyOpt<CollectionMethod>>("All");
  const [instStatus, setInstStatus] = useState<AnyOpt<InstallmentStatus>>("All");
  const [customer, setCustomer] = useState<string>("All");

  const customers = useMemo(
    () => Array.from(new Set(COLLECTIONS.map((c) => c.customer))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return COLLECTIONS.filter((c) => {
      if (branch !== "All" && c.branch !== branch) return false;
      if (method !== "All" && c.method !== method) return false;
      if (customer !== "All" && c.customer !== customer) return false;
      if (instStatus !== "All" && c.installmentStatus !== instStatus) return false;
      if (needle && !`${c.receipt} ${c.invoice} ${c.customer} ${c.agent}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, branch, method, instStatus, customer]);

  const totals = useMemo(() => {
    const collected = filtered.reduce((s, x) => s + x.amount, 0);
    const uniqueCustomers = new Set(filtered.map((x) => x.customer)).size;
    const overdueCollected = filtered.filter((x) => x.installmentStatus === "Overdue").reduce((s, x) => s + x.amount, 0);
    return { collected, count: filtered.length, uniqueCustomers, overdueCollected };
  }, [filtered]);

  const anyFilter = q || branch !== "All" || method !== "All" || instStatus !== "All" || customer !== "All";
  const reset = () => { setQ(""); setBranch("All"); setMethod("All"); setInstStatus("All"); setCustomer("All"); };

  function exportCSV() {
    const rows = [
      ["Receipt", "Date", "Invoice", "Customer", "Branch", "Agent", "Method", "Amount", "Installment Status"],
      ...filtered.map((c) => [c.receipt, c.date, c.invoice, c.customer, c.branch, c.agent, c.method, c.amount, c.installmentStatus ?? ""]),
    ];
    const csv = rows
      .map((r) => r.map((v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-collections-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Sales - Collection Drilldown"
        description="Every receipt against open invoices, sliced by branch, customer and installment health."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/sales/invoices" className="text-[12px] text-primary font-medium hover:underline">View invoices -&gt;</Link>
            <button onClick={exportCSV} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-muted transition-colors">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Receipts" value={totals.count} hint="Matching filters" icon={<KpiIcons.invoice />} tone="primary" />
        <StatCard label="Collected" value={fmtRs(totals.collected)} hint="Across all receipts" icon={<KpiIcons.wallet />} tone="success" />
        <StatCard label="Customers Paid" value={totals.uniqueCustomers} hint="Unique payers" icon={<KpiIcons.customers />} tone="primary" />
        <StatCard label="From Overdue" value={fmtRs(totals.overdueCollected)} hint="Recovered from overdue accounts" icon={<KpiIcons.wallet />} tone="warning" />
      </div>

      <div className="rounded-lg border border-border bg-card p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search receipt, invoice, customer, agent..."
              className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <FilterSelect label="Branch" value={branch} onChange={(v) => setBranch(v as AnyOpt<Branch>)} options={["All", ...BRANCHES]} />
          <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={["All", ...customers]} />
          <FilterSelect label="Method" value={method} onChange={(v) => setMethod(v as AnyOpt<CollectionMethod>)} options={["All", ...COLLECTION_METHODS]} />
          <FilterSelect label="Installment" value={instStatus} onChange={(v) => setInstStatus(v as AnyOpt<InstallmentStatus>)} options={["All", ...INSTALLMENT_STATUSES]} />
        </div>
        {anyFilter && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">{filtered.length} of {COLLECTIONS.length} receipts</div>
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
                <Th>Receipt</Th><Th>Date</Th><Th>Invoice</Th><Th>Customer</Th>
                <Th>Branch</Th><Th>Agent</Th><Th>Method</Th><Th right>Amount</Th><Th>Installment</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                  No receipts match the current filters.
                </td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <Td className="font-mono font-medium">{c.receipt}</Td>
                  <Td>{c.date}</Td>
                  <Td className="font-mono text-muted-foreground">{c.invoice}</Td>
                  <Td className="font-medium">{c.customer}</Td>
                  <Td>{c.branch}</Td>
                  <Td>{c.agent}</Td>
                  <Td><Badge tone="muted">{c.method}</Badge></Td>
                  <Td right className="font-medium">{fmtRs(c.amount)}</Td>
                  <Td>{instBadge(c.installmentStatus)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  return (
    <label className="block">
      <span className={`${ui.textKpiLabel} ${ui.textMuted} block text-[10px] mb-1`}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`${ui.tableHeadCell} ${right ? "!text-right" : ""}`}>{children}</th>;
}
function Td({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-2 ${right ? "text-right tabular-nums" : ""} ${className}`}>{children}</td>;
}
