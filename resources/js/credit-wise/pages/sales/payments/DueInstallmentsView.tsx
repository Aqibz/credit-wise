import { useMemo, useState } from "react";
import { Link } from "@/shared/navigation";
import { Wallet, Calendar, AlertTriangle, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Avatar, ui } from "@/components/ui-kit";
import { hpCasesConfig, paymentsReceivedConfig } from "@/lib/entities";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { fmtPKR as Rs } from "@/lib/formatters/currency";

const ACTIVE_STATUSES = new Set([
  "Active",
  "Approved",
  "Under Process",
  "Under Verification",
  "Under Approval",
  "Defaulter",
]);

type Row = {
  key: string;
  contract: string;
  contractDate: string;
  customer: string;
  customerId?: string;
  installment: string;
  amount: number;
  dueDate: string; // ISO
  overdue: boolean;
};

function addMonthsISO(startISO: string, months: number): string {
  const d = new Date(startISO);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DueInstallmentsView({
  title,
  description,
  windowDays, // null = till closing
}: {
  title: string;
  description: string;
  windowDays: number | null;
}) {
  const { items: contracts } = useEntityStore<any>(
    hpCasesConfig.storageKey,
    hpCasesConfig.seed as any,
  );
  const { items: receipts } = useEntityStore<any>(
    paymentsReceivedConfig.storageKey,
    paymentsReceivedConfig.seed as any,
  );

  const rows: Row[] = useMemo(() => {
    const today = todayISO();
    let endDate: string | null = null;
    if (windowDays != null) {
      const d = new Date();
      d.setDate(d.getDate() + windowDays);
      endDate = d.toISOString().slice(0, 10);
    }

    const paidByContract = new Map<string, number>();
    for (const r of receipts) {
      if (r.status === "Cancelled" || r.status === "Bounced") continue;
      paidByContract.set(r.contract, (paidByContract.get(r.contract) || 0) + 1);
    }

    const out: Row[] = [];
    for (const c of contracts) {
      if (!ACTIVE_STATUSES.has(c.status)) continue;
      const tenure = Number(c.tenure || 0);
      const monthly = Number(c.monthly || 0);
      if (!tenure || !monthly || !c.startDate) continue;
      const paidCount = paidByContract.get(c.ref) || 0;
      for (let n = paidCount + 1; n <= tenure; n++) {
        const due = addMonthsISO(c.startDate, n - 1);
        if (!due) continue;
        if (endDate != null && due > endDate) continue;
        out.push({
          key: `${c.ref}-${n}`,
          contract: c.ref,
          contractDate: c.startDate,
          customer: c.customer,
          customerId: c.cnic,
          installment: `${n} of ${tenure}`,
          amount: monthly,
          dueDate: due,
          overdue: due < today,
        });
      }
    }
    out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return out;
  }, [contracts, receipts, windowDays]);

  const totalDue = rows.reduce((s, r) => s + r.amount, 0);
  const overdueCount = rows.filter((r) => r.overdue).length;

  // Toolbar state
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.contract, r.customer, r.customerId, r.installment, r.dueDate]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <AppShell>
      <PageHeader
        title={title}
        description={description}
      />


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard label="Installments" value={String(rows.length)} icon={<Calendar className="h-5 w-5" />} tone="primary" />
        <StatCard label="Total Due" value={Rs(totalDue)} icon={<Wallet className="h-5 w-5" />} tone="success" />
        <StatCard label="Overdue" value={String(overdueCount)} icon={<AlertTriangle className="h-5 w-5" />} tone={overdueCount ? "warning" : "muted"} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex items-center h-10 rounded-lg border border-border bg-card overflow-hidden">
          <span className="px-3 h-full inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border bg-muted/30">Show</span>
          <select
            value={String(perPage)}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="h-10 px-3 bg-card text-sm font-bold border-0 focus:outline-none"
          >
            {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className={`relative transition-all duration-200 ${searchOpen ? "flex-1 max-w-md" : "w-10"}`}>
          {searchOpen ? (
            <>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                autoFocus
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
                placeholder="Search contract, customerâ€¦"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search"
              aria-label="Search"
              className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="ml-auto">
          <Link
            to="/payments-received/new"
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm shadow-primary/30 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Record Payment
          </Link>
        </div>
      </div>


      <div className={`rounded-xl ${ui.border} ${ui.surfaceCard} ${ui.shadowCard} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={ui.tableHeadRow}>
              <tr>
                <th className={ui.tableHeadCell}>Contract</th>
                <th className={ui.tableHeadCell}>Customer</th>
                <th className={ui.tableHeadCell}>Installment</th>
                <th className={ui.tableHeadCell}>Amount Due</th>
                <th className={ui.tableHeadCell}>Due Date</th>
                <th className={ui.tableHeadCell}>Status</th>

              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No installments due in this window.
                  </td>
                </tr>
              )}
              {pageRows.map((r, idx) => (
                <tr key={r.key} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-2 py-3">
                    <div className="leading-tight">
                      <Link
                        to="/contracts"
                        className="font-semibold text-primary hover:underline"
                      >
                        {r.contract}
                      </Link>
                      {r.contractDate && (
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">{r.contractDate}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.customer} color={["primary","warning","destructive","info"][idx % 4] as any} />
                      <div className="leading-tight">
                        <div className="font-semibold text-foreground">{r.customer}</div>
                        {r.customerId && (
                          <div className="text-xs text-muted-foreground font-medium mt-0.5">{r.customerId}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 tabular-nums">{r.installment}</td>
                  <td className="px-2 py-3 tabular-nums font-medium">{Rs(r.amount)}</td>
                  <td className="px-2 py-3">
                    <span className={r.overdue ? "text-destructive font-medium" : "text-foreground"}>
                      {r.dueDate}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    {r.overdue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-destructive/15 text-destructive">
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
                        Unpaid
                      </span>
                    )}
                  </td>


                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing {(safePage - 1) * perPage + 1}â€“{Math.min(safePage * perPage, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
