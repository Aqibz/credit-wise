import { Link } from "@/shared/navigation";
import { useMemo, useState, ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, Badge, ui } from "@/components/ui-kit";
import { useEntityStore } from "@/lib/state/useEntityStore";
import {
  customersConfig, hpCasesConfig, salesConfig, deliveriesConfig,
  salesReturnsConfig, receiptsConfig, guarantorsConfig,
  customerComplaintsConfig, warrantyClaimsConfig, blacklistConfig,
} from "@/lib/entities";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toaster";
import {
  ArrowLeft, User, CreditCard, Wallet, Truck, ArrowLeftRight,
  Phone, Mail, MapPin, Calendar, Receipt, Users as UsersIcon, FileText,
  Pencil, Paperclip, Plus, ChevronDown, MoreHorizontal, PowerOff, Trash2,
  UserX, ClipboardCheck, ShieldCheck, MessageSquareWarning, ShieldAlert,
  ShoppingBag, Clock as ClockIcon, CheckCircle2, AlertCircle, CalendarClock,
  RotateCcw, PackageCheck, Download, Home, Briefcase, Camera, Eye,
  Building2, Banknote, BadgeCheck, AlertTriangle, MapPinned, FileCheck2,
  Upload, ExternalLink, IdCard, FileSignature, Landmark, Zap,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type Tab = { key: string; label: string; icon: ReactNode };
const TABS: Tab[] = [
  { key: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
  { key: "transactions", label: "Transactions", icon: <Receipt className="h-4 w-4" /> },
  { key: "kyc", label: "KYC & Guarantors", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "support", label: "Support", icon: <MessageSquareWarning className="h-4 w-4" /> },
];

type TxTab = "schedule" | "payments" | "activity";
const TX_TABS: { key: TxTab; label: string; icon: ReactNode }[] = [
  { key: "schedule", label: "Schedule", icon: <Calendar className="h-3.5 w-3.5" /> },
  { key: "payments", label: "Payments", icon: <Wallet className="h-3.5 w-3.5" /> },
  { key: "activity", label: "Activity", icon: <ClockIcon className="h-3.5 w-3.5" /> },
];
type ScheduleFilter = "all" | "due" | "paid";

export function CustomerProfilePage({ customerId }: { customerId: string }) {
  const [tab, setTab] = useState("overview");
  const [txTab, setTxTab] = useState<TxTab>("schedule");
  const [schedFilter, setSchedFilter] = useState<ScheduleFilter>("all");

  const { items: customers, update: updateCustomer } = useEntityStore<any>(customersConfig.storageKey, customersConfig.seed);
  const { create: addBlacklist } = useEntityStore<any>(blacklistConfig.storageKey, (blacklistConfig.seed || []) as any);
  const toast = useToast();
  const [blOpen, setBlOpen] = useState(false);
  const [blReason, setBlReason] = useState("");
  const [blSeverity, setBlSeverity] = useState("High");
  const { items: cases } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);
  const { items: sales } = useEntityStore<any>(salesConfig.storageKey, salesConfig.seed);
  const { items: deliveries } = useEntityStore<any>(deliveriesConfig.storageKey, deliveriesConfig.seed);
  const { items: returns } = useEntityStore<any>(salesReturnsConfig.storageKey, salesReturnsConfig.seed);
  const { items: receipts } = useEntityStore<any>(receiptsConfig.storageKey, receiptsConfig.seed);
  const { items: guarantors } = useEntityStore<any>(guarantorsConfig.storageKey, guarantorsConfig.seed);
  const { items: complaints } = useEntityStore<any>(customerComplaintsConfig.storageKey, customerComplaintsConfig.seed);
  const { items: warranty } = useEntityStore<any>(warrantyClaimsConfig.storageKey, warrantyClaimsConfig.seed);

  const customer = customers.find((c) => c.id === customerId);

  const cCases = useMemo(() => cases.filter((x) => x.customer === customer?.name), [cases, customer]);
  const cDeliveries = useMemo(() => deliveries.filter((x) => x.customer === customer?.name), [deliveries, customer]);
  const cReturns = useMemo(() => returns.filter((x) => x.customer === customer?.name), [returns, customer]);
  const cReceipts = useMemo(() => receipts.filter((x: any) => x.customer === customer?.name), [receipts, customer]);
  const cGuarantors = useMemo(() => guarantors.filter((g: any) => g.customer === customer?.name), [guarantors, customer]);
  const cComplaints = useMemo(() => complaints.filter((c: any) => c.customer === customer?.name), [complaints, customer]);
  const cWarranty = useMemo(() => warranty.filter((w: any) => w.customer === customer?.name), [warranty, customer]);

  const totalFinanced = cCases.reduce((s, c) => s + Number(c.financed || 0), 0);
  const totalEMI = cCases.reduce((s, c) => s + Number(c.monthly || 0), 0);
  const totalPaid = cReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
  const activeCases = cCases.filter((c) => ["Active", "Approved"].includes(c.status)).length;

  const installments = useMemo(() => buildInstallments(cCases, cReceipts), [cCases, cReceipts]);
  const totalDue = installments.reduce((s, i) => s + i.amount, 0);
  const totalCollected = installments.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = Math.max(0, totalDue - totalCollected);
  const overdueAmt = installments.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const onTime = installments.length ? Math.round((installments.filter((i) => i.status === "Paid" && !i.late).length / installments.length) * 100) : 100;


  if (!customer) {
    return (
      <AppShell>
        <div className="rounded-xl bg-card border border-border/60 p-12 text-center">
          <h1 className="text-lg font-semibold text-foreground mb-2">Customer Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">No customer matches the ID "{customerId}".</p>
          <Link to="/customers" className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Customers
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-end gap-3">
        <Link to="/customers" className="text-primary text-xs font-medium inline-flex items-center gap-1 hover:underline shrink-0">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </Link>
      </div>

      {/* Identity header â€” minimal */}
      <div className="rounded-xl bg-card border border-border/60 p-5 mb-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-14 w-14 rounded-xl bg-primary/10 grid place-items-center text-primary text-lg font-semibold shrink-0">
            {String(customer.name).split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">{customer.name}</h1>
              <Badge tone={customer.status === "Active" ? "success" : customer.status === "Blacklisted" ? "destructive" : "muted"}>{customer.status}</Badge>
              {customer.assignedTo && (
                <span className="text-[11px] font-medium text-muted-foreground">Â· {customer.assignedRole || "Officer"}: <span className="text-foreground">{customer.assignedTo}</span></span>
              )}
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground flex-wrap">
              {customer.cnic && <span className="font-medium font-mono">{customer.cnic}</span>}
              {customer.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>}
              {customer.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>}
              {(customer.area || customer.city) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {customer.area}{customer.city ? `, ${customer.city}` : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/customers/$customerId/edit"
              params={{ customerId: String(customer.id) }}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Attachments"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-sm font-semibold">KYC Documents</span>
                </div>
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No Files Attached
                </div>
                <div className="px-3 pb-3">
                  <button type="button" className="w-full flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 hover:bg-muted/60 py-4 transition-colors">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Paperclip className="h-4 w-4" /> Upload CNIC, salary slip, utility bill
                    </span>
                    <span className="text-[11px] text-muted-foreground">Max 10 files, 10MB each</span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm transition-colors">
                  <Plus className="h-3.5 w-3.5" /> New <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sales</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link to="/support/hp-cases/new"><CreditCard className="h-4 w-4 mr-2" /> HP Case</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/sales/invoices"><Receipt className="h-4 w-4 mr-2" /> Invoice</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/sales/receipts"><Wallet className="h-4 w-4 mr-2" /> Receipt</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/logistics/deliveries"><Truck className="h-4 w-4 mr-2" /> Delivery</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/support/complaints"><MessageSquareWarning className="h-4 w-4 mr-2" /> Complaint</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/support/warranty"><ShieldAlert className="h-4 w-4 mr-2" /> Warranty Claim</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="More" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Export Profile</DropdownMenuItem>
                <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Download Statement</DropdownMenuItem>
                <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Send Statement</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><PowerOff className="h-4 w-4 mr-2" /> Mark as Inactive</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => { e.preventDefault(); setBlReason(""); setBlSeverity("High"); setBlOpen(true); }}
                >
                  <UserX className="h-4 w-4 mr-2" /> Blacklist Customer
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Active Cases" value={activeCases} icon={<KpiIcons.card />} tone="primary" hint={`${cCases.length} total`} />
        <StatCard label="Total Financed" value={Rs(totalFinanced)} icon={<KpiIcons.trendUp />} tone="primary" hint={`EMI ${Rs(totalEMI)}/mo`} />
        <StatCard label="Outstanding" value={Rs(outstanding)} icon={<KpiIcons.invoice />} tone={outstanding > 0 ? "warning" : "success"} hint={overdueAmt > 0 ? `${Rs(overdueAmt)} overdue` : "On track"} />
        <StatCard label="Credit Score" value={customer.credit || 0} icon={<KpiIcons.star />} tone={Number(customer.credit) >= 750 ? "success" : Number(customer.credit) >= 650 ? "primary" : Number(customer.credit) >= 550 ? "warning" : "destructive"} hint={Number(customer.credit) >= 750 ? "Excellent" : Number(customer.credit) >= 650 ? "Good" : Number(customer.credit) >= 550 ? "Fair" : "High risk"} valueClassName={Number(customer.credit) >= 750 ? "text-emerald-600" : Number(customer.credit) >= 650 ? "text-primary" : Number(customer.credit) >= 550 ? "text-amber-600" : "text-destructive"} />
      </div>

      {/* Tabs */}
      <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
        <div className="flex border-b border-border px-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "overview" && <OverviewTab customer={customer} cases={cCases} guarantors={cGuarantors} />}

          {tab === "transactions" && (
            <TransactionsTab
              cases={cCases}
              installments={installments}
              receipts={cReceipts}
              deliveries={cDeliveries}
              returns={cReturns}
              tab={txTab}
              setTab={setTxTab}
              filter={schedFilter}
              setFilter={setSchedFilter}
            />
          )}

          {tab === "kyc" && <KycTab customer={customer} guarantors={cGuarantors} />}

          {tab === "support" && (
            <div className="space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageSquareWarning className="h-3.5 w-3.5" /> Complaints ({cComplaints.length})
                </h3>
                <HistoryTable
                  headers={["Complaint #", "Subject", "Category", "Severity", "Filed", "Assignee", "Status"]}
                  rows={cComplaints.map((c: any) => [c.ref, c.subject, c.category, <Badge key="sv" tone={c.severity === "Critical" ? "destructive" : c.severity === "High" ? "warning" : "muted"}>{c.severity}</Badge>, c.filedOn, c.assignee || "â€”", <Badge key="s" tone={c.status === "Resolved" || c.status === "Closed" ? "success" : c.status === "Escalated" ? "destructive" : "warning"}>{c.status}</Badge>])}
                  empty="No complaints filed." />
              </section>

              <section className="pt-4 border-t border-border/60">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5" /> Warranty Claims ({cWarranty.length})
                </h3>
                <HistoryTable
                  headers={["Claim #", "Product", "Serial #", "Issue", "Claimed", "Status"]}
                  rows={cWarranty.map((w: any) => [w.ref, w.product, w.serial, w.issue, w.claimedOn, <Badge key="s" tone={w.status === "Resolved" || w.status === "Approved" ? "success" : w.status === "Rejected" ? "destructive" : "warning"}>{w.status}</Badge>])}
                  empty="No warranty claims." />
              </section>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={blOpen}
        title={`Blacklist ${customer.name}?`}
        tone="destructive"
        confirmLabel="Blacklist Customer"
        cancelLabel="Cancel"
        icon={<UserX className="h-5 w-5" />}
        description={
          <div className="space-y-3">
            <p>
              This will block <span className="font-semibold text-foreground">{customer.name}</span> from future contracts and flag all linked guarantors. A reason is required for audit trail.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Severity</label>
              <div className="flex gap-1.5">
                {["Low", "Medium", "High", "Critical"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBlSeverity(s)}
                    className={`flex-1 h-8 rounded-md text-xs font-semibold border transition-colors ${blSeverity === s ? "bg-destructive text-destructive-foreground border-destructive" : "bg-card text-foreground border-border hover:bg-muted"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reason <span className="text-destructive">*</span></label>
              <textarea
                value={blReason}
                onChange={(e) => setBlReason(e.target.value)}
                rows={3}
                placeholder="e.g. Defaulted on 6+ EMIs, absconded, fraudulent CNIC, cheque bounceâ€¦"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        }
        onCancel={() => setBlOpen(false)}
        onConfirm={() => {
          const reason = blReason.trim();
          if (!reason) { toast.error("Please provide a reason"); return; }
          const today = new Date().toISOString().slice(0, 10);
          const primaryCase = cCases[0];
          const loss = Math.max(0, outstanding);
          addBlacklist({
            name: customer.name,
            cnic: customer.cnic || "",
            phone: customer.phone || "",
            city: customer.city || "",
            caseRef: primaryCase?.caseNo || primaryCase?.ref || "â€”",
            product: primaryCase?.product || "â€”",
            loss,
            recovered: 0,
            daysOverdue: 0,
            reason,
            severity: blSeverity,
            recoveryStatus: "In Recovery",
            blockedBy: "Ahmed Hassan",
            date: today,
            notes: reason,
          } as any);
          updateCustomer(customer.id, { status: "Blacklisted" } as any);
          toast.success(`${customer.name} blacklisted`);
          setBlOpen(false);
        }}
      />
    </AppShell>
  );
}

function OverviewTab({ customer, cases, guarantors }: { customer: any; cases: any[]; guarantors: any[] }) {
  const recentCases = [...cases].sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || ""))).slice(0, 5);
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Contact & Address</h3>
          <dl className="space-y-1.5 text-sm">
            {[
              ["Mobile", customer.phone || "â€”"],
              ["WhatsApp", customer.whatsapp || "â€”"],
              ["Email", customer.email || "â€”"],
              ["Area", customer.area || "â€”"],
              ["City", customer.city || "â€”"],
              ["Address", customer.address || "â€”"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-4 py-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground font-medium text-right truncate max-w-[60%]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Employment & Credit</h3>
          <dl className="space-y-1.5 text-sm">
            {[
              ["Occupation", customer.occupation || "â€”"],
              ["Employer", customer.employer || "â€”"],
              ["Monthly Income", customer.income ? Rs(customer.income) : "â€”"],
              ["Credit Score", customer.credit ? <CreditScoreCell key="cs" value={Number(customer.credit)} /> : "â€”"],
              ["Receivable", <span key="rcv" className="font-semibold tabular-nums">{Rs(customer.receivable || 0)}</span>],
              ["Overdue", <span key="od" className={Number(customer.overdue) > 0 ? "text-destructive font-semibold tabular-nums" : "text-muted-foreground font-medium tabular-nums"}>{Rs(customer.overdue || 0)}</span>],
              
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-4 py-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

    </div>
  );
}

function CreditScoreCell({ value }: { value: number }) {
  if (value <= 0) return <span className="text-muted-foreground">â€”</span>;
  const color = value >= 750 ? "text-emerald-600" : value >= 650 ? "text-primary" : value >= 550 ? "text-amber-600" : "text-destructive";
  return <span className={`font-semibold tabular-nums ${color}`}>{value}</span>;
}

function caseStatusBadge(status: string) {
  const tone =
    ["Active", "Approved", "Settled"].includes(status) ? "success" :
    ["Defaulter", "Repossessed"].includes(status) ? "destructive" :
    status === "Cancelled" ? "muted" : "warning";
  return <Badge key="s" tone={tone as any}>{status}</Badge>;
}

function HistoryTable({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty: string }) {
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

function downloadStatement(installments: Inst[], receipts: any[]) {
  const esc = (v: any) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines: string[] = [];
  lines.push("AMORTIZATION SCHEDULE");
  lines.push(["Case", "#", "Due Date", "Opening", "EMI", "Paid", "Closing", "Status", "Paid On"].join(","));
  for (const i of installments) {
    lines.push([i.case, i.n, i.dueDate, i.opening, i.amount, i.paidAmount, i.closing, i.status, i.paidOn || ""].map(esc).join(","));
  }
  lines.push("");
  lines.push("PAYMENTS");
  lines.push(["Date", "Receipt", "Case / Invoice", "Method", "Amount", "Collected By"].join(","));
  for (const r of receipts) {
    lines.push([r.date, r.ref || r.receipt || r.id, r.invoice || r.case || "", r.method || "", r.amount || 0, r.collectedBy || r.cashier || ""].map(esc).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `statement-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Inst = {
  case: string; n: number; total: number; dueDate: string;
  amount: number; paidAmount: number;
  opening: number; closing: number;
  status: "Paid" | "Overdue" | "Upcoming"; paidOn?: string; late?: boolean;
};

function buildInstallments(cases: any[], receipts: any[]): Inst[] {
  const today = new Date();
  const all: Inst[] = [];
  cases.forEach((c) => {
    if (!c.startDate || !c.tenure || !c.monthly) return;
    const start = new Date(c.startDate);
    const tenure = Number(c.tenure);
    const monthly = Number(c.monthly);
    const principalTotal = monthly * tenure; // total financed (incl. markup) repaid via EMIs
    const caseReceipts = receipts
      .filter((r) => (r.invoice && r.invoice === c.ref) || r.case === c.ref)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    let receiptIdx = 0;
    for (let n = 1; n <= tenure; n++) {
      const due = new Date(start.getFullYear(), start.getMonth() + n, start.getDate());
      const dueIso = due.toISOString().slice(0, 10);
      const opening = principalTotal - (n - 1) * monthly;
      const closing = Math.max(0, principalTotal - n * monthly);
      const r = caseReceipts[receiptIdx];
      let status: Inst["status"] = "Upcoming";
      let paidOn: string | undefined;
      let late = false;
      let paidAmount = 0;
      if (r) {
        status = "Paid";
        paidOn = r.date;
        paidAmount = Number(r.amount) || monthly;
        if (new Date(r.date) > due) late = true;
        receiptIdx++;
      } else if (due < today) {
        status = "Overdue";
      }
      all.push({ case: c.ref, n, total: tenure, dueDate: dueIso, amount: monthly, paidAmount, opening, closing, status, paidOn, late });
    }
  });
  // Order by case then installment number â€” gives a proper amortization read.
  all.sort((a, b) => a.case.localeCompare(b.case) || a.n - b.n);
  return all;
}

const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
const fmtDate = (iso: string) => {
  if (!iso) return "â€”";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function TransactionsTab({
  cases, installments, receipts, deliveries, returns: rets,
  tab, setTab, filter, setFilter,
}: {
  cases: any[]; installments: Inst[]; receipts: any[]; deliveries: any[]; returns: any[];
  tab: TxTab; setTab: (t: TxTab) => void;
  filter: ScheduleFilter; setFilter: (f: ScheduleFilter) => void;
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = installments.filter((i) => i.status === "Upcoming");
  const overdue = installments.filter((i) => i.status === "Overdue");
  const paid = installments.filter((i) => i.status === "Paid");
  const overdueAmt = overdue.reduce((s, i) => s + i.amount, 0);
  const maxDpd = overdue.reduce((m, i) => Math.max(m, daysBetween(today, new Date(i.dueDate))), 0);
  const next = upcoming[0];
  const nextDpd = next ? daysBetween(new Date(next.dueDate), today) : null;
  const lastPay = [...receipts].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const onTimeRate = paid.length ? Math.round((paid.filter((p) => !p.late).length / paid.length) * 100) : null;

  const filtered =
    filter === "due" ? installments.filter((i) => i.status !== "Paid") :
    filter === "paid" ? paid :
    installments;

  type Event = { date: string; kind: string; title: string; sub: string; tone: string; icon: ReactNode };
  const events: Event[] = [];
  cases.forEach((c) => events.push({ date: c.startDate || "", kind: "case", title: `Case opened Â· ${c.ref}`, sub: `${c.product} Â· ${c.tenure}mo @ Rs ${Number(c.monthly || 0).toLocaleString()}/mo`, tone: "primary", icon: <CreditCard className="h-3.5 w-3.5" /> }));
  deliveries.forEach((d) => events.push({ date: d.scheduled || d.date || "", kind: "delivery", title: `Delivery Â· ${d.ref}`, sub: `${d.status}${d.driver ? ` Â· ${d.driver}` : ""}`, tone: d.status === "Delivered" ? "success" : "warning", icon: <PackageCheck className="h-3.5 w-3.5" /> }));
  rets.forEach((r) => events.push({ date: r.date || "", kind: "return", title: `Return Â· ${r.ref}`, sub: `${r.product || r.reason || ""} Â· ${r.status}`, tone: r.status === "Approved" ? "warning" : "muted", icon: <RotateCcw className="h-3.5 w-3.5" /> }));
  receipts.forEach((r) => events.push({ date: r.date || "", kind: "payment", title: `Payment received Â· Rs ${Number(r.amount).toLocaleString()}`, sub: `${r.method || "â€”"}${r.collectedBy ? ` Â· ${r.collectedBy}` : ""}${r.invoice ? ` Â· ${r.invoice}` : ""}`, tone: "success", icon: <Wallet className="h-3.5 w-3.5" /> }));
  events.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const counts: Record<TxTab, number> = { schedule: overdue.length + upcoming.length, payments: receipts.length, activity: events.length };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <HealthTile
          label="Next Payment"
          icon={<CalendarClock className="h-4 w-4" />}
          tone={nextDpd === null ? "muted" : nextDpd <= 7 ? "warning" : "primary"}
          primary={next ? `Rs ${next.amount.toLocaleString()}` : "â€”"}
          secondary={next ? `${fmtDate(next.dueDate)} Â· ${nextDpd! < 0 ? `${Math.abs(nextDpd!)}d ago` : nextDpd === 0 ? "today" : `in ${nextDpd}d`}` : "No upcoming"}
        />
        <HealthTile
          label="Overdue"
          icon={<AlertCircle className="h-4 w-4" />}
          tone={overdue.length ? "destructive" : "success"}
          primary={overdue.length ? `Rs ${overdueAmt.toLocaleString()}` : "Rs 0"}
          secondary={overdue.length ? `${overdue.length} installment${overdue.length > 1 ? "s" : ""} Â· ${maxDpd}d max DPD` : "Clean record"}
        />
        <HealthTile
          label="On-Time Rate"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={onTimeRate === null ? "muted" : onTimeRate >= 90 ? "success" : onTimeRate >= 70 ? "warning" : "destructive"}
          primary={onTimeRate === null ? "â€”" : `${onTimeRate}%`}
          secondary={paid.length ? `${paid.length} payment${paid.length > 1 ? "s" : ""} cleared` : "No history yet"}
        />
        <HealthTile
          label="Last Payment"
          icon={<Wallet className="h-4 w-4" />}
          tone={lastPay ? "primary" : "muted"}
          primary={lastPay ? `Rs ${Number(lastPay.amount).toLocaleString()}` : "â€”"}
          secondary={lastPay ? `${fmtDate(lastPay.date)} Â· ${lastPay.method || "â€”"}` : "Awaiting first payment"}
        />
      </div>


      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit">
          {TX_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => downloadStatement(installments, receipts)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download Statement
        </button>
      </div>

      {tab === "schedule" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-xs">
            {(["all", "due", "paid"] as ScheduleFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f === "all" ? `All (${installments.length})` : f === "due" ? `Due (${overdue.length + upcoming.length})` : `Paid (${paid.length})`}
              </button>
            ))}
          </div>
          <ScheduleTable rows={filtered} today={today} />
        </div>
      )}

      {tab === "payments" && (
        <HistoryTable
          headers={["Date", "Receipt", "Case / Invoice", "Method", "Amount", "Collected By"]}
          rows={receipts.map((r) => [
            fmtDate(r.date),
            <span key="r" className="font-mono text-xs">{r.ref || r.receipt || r.id}</span>,
            r.invoice || r.case || "â€”",
            <span key="m" className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{r.method || "â€”"}</span>,
            <span key="a" className="font-semibold tabular-nums text-success">Rs {Number(r.amount).toLocaleString()}</span>,
            r.collectedBy || r.cashier || "â€”",
          ])}
          empty="No payments recorded yet."
        />
      )}

      {tab === "activity" && <ActivityTimeline events={events} />}
    </div>
  );
}

function HealthTile({ label, icon, tone, primary, secondary }: { label: string; icon: ReactNode; tone: "primary" | "success" | "warning" | "destructive" | "muted"; primary: string; secondary: string }) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">{label}</span>
        <span className={`h-7 w-7 rounded-md grid place-items-center ${toneCls}`}>{icon}</span>
      </div>
      <div className="text-[18px] font-semibold tracking-tight tabular-nums text-foreground leading-tight">{primary}</div>
      <div className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{secondary}</div>
    </div>
  );
}

function ScheduleTable({ rows, today }: { rows: Inst[]; today: Date }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">Nothing here.</div>;

  // Group by case so each block reads like a proper amortization schedule.
  const groups = rows.reduce<Record<string, Inst[]>>((acc, r) => {
    (acc[r.case] ||= []).push(r);
    return acc;
  }, {});
  const caseRefs = Object.keys(groups);
  const showGroupHeader = caseRefs.length > 1;

  return (
    <div className="space-y-4">
      {caseRefs.map((ref) => {
        const list = groups[ref];
        const totalEmi = list.reduce((s, i) => s + i.amount, 0);
        const totalPaid = list.reduce((s, i) => s + i.paidAmount, 0);
        const remaining = Math.max(0, totalEmi - totalPaid);
        return (
          <div key={ref} className="rounded-lg border border-border overflow-hidden">
            {showGroupHeader && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/40 border-b border-border text-xs">
                <span className="font-semibold text-foreground font-mono">{ref}</span>
                <span className="text-muted-foreground tabular-nums">
                  Scheduled <span className="text-foreground font-semibold">Rs {totalEmi.toLocaleString()}</span>
                  <span className="mx-2">Â·</span>
                  Paid <span className="text-success font-semibold">Rs {totalPaid.toLocaleString()}</span>
                  <span className="mx-2">Â·</span>
                  Remaining <span className={`font-semibold ${remaining > 0 ? "text-foreground" : "text-success"}`}>Rs {remaining.toLocaleString()}</span>
                </span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={ui.tableHeadRow}>
                  <tr>
                    <th className="text-left px-3 py-2.5 w-14">#</th>
                    <th className="text-left px-3 py-2.5">Due Date</th>
                    <th className="text-right px-3 py-2.5">Opening Balance</th>
                    <th className="text-right px-3 py-2.5">EMI</th>
                    <th className="text-right px-3 py-2.5">Paid</th>
                    <th className="text-right px-3 py-2.5">Closing Balance</th>
                    <th className="text-left px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.map((i, idx) => {
                    const due = new Date(i.dueDate);
                    const dpd = daysBetween(today, due);
                    return (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 text-muted-foreground font-medium tabular-nums">{i.n}<span className="text-muted-foreground/60">/{i.total}</span></td>
                        <td className="px-3 py-2.5">
                          <div className="text-foreground font-medium">{fmtDate(i.dueDate)}</div>
                          {i.status === "Upcoming" && (
                            <div className="text-[11px] text-muted-foreground">{dpd >= 0 ? "today" : `in ${-dpd}d`}</div>
                          )}
                          {i.status === "Overdue" && (
                            <div className="text-[11px] text-destructive font-semibold">{dpd}d overdue</div>
                          )}
                          {i.status === "Paid" && i.paidOn && (
                            <div className="text-[11px] text-muted-foreground">paid {fmtDate(i.paidOn)}</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">Rs {i.opening.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">Rs {i.amount.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {i.paidAmount > 0
                            ? <span className="font-semibold text-success">Rs {i.paidAmount.toLocaleString()}</span>
                            : <span className="text-muted-foreground/60">â€”</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-foreground">Rs {i.closing.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          {i.status === "Paid" ? (
                            <Badge tone={i.late ? "warning" : "success"}>{i.late ? "Paid late" : "Paid"}</Badge>
                          ) : i.status === "Overdue" ? (
                            <Badge tone="destructive">Overdue</Badge>
                          ) : (
                            <Badge tone="muted">Upcoming</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/30 border-t border-border">
                  <tr className="text-xs">
                    <td colSpan={3} className="px-3 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-wider">Totals</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-foreground">Rs {totalEmi.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-success">Rs {totalPaid.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-foreground">Rs {remaining.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTimeline({ events }: { events: { date: string; kind: string; title: string; sub: string; tone: string; icon: ReactNode }[] }) {
  if (!events.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No activity yet.</div>;
  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/20 text-warning-foreground ring-warning/30",
    destructive: "bg-destructive/10 text-destructive ring-destructive/30",
    muted: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <ol className="relative border-l border-border/70 ml-3 space-y-4">
      {events.map((e, i) => (
        <li key={i} className="pl-5 relative">
          <span className={`absolute -left-[13px] top-0.5 h-6 w-6 rounded-full grid place-items-center ring-2 ring-background ${toneCls[e.tone]}`}>
            {e.icon}
          </span>
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">{e.title}</div>
            <div className="text-[11.5px] text-muted-foreground tabular-nums shrink-0">{fmtDate(e.date)}</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground mt-0.5">{e.sub}</div>
        </li>
      ))}
    </ol>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ KYC & Guarantors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type KycDoc = {
  key: string;
  label: string;
  icon: ReactNode;
  status: "Verified" | "Pending" | "Missing" | "Expired";
  uploadedOn?: string;
  expires?: string;
  size?: string;
  pages?: number;
};

type GuarantorDetail = {
  name: string;
  relation: string;
  cnic: string;
  cnicIssue: string;
  cnicExpiry: string;
  phone: string;
  whatsapp: string;
  dob: string;
  occupation: string;
  employer: string;
  designation: string;
  monthlyIncome: number;
  yearsEmployed: number;
  address: string;
  area: string;
  residence: "Owned" | "Rented" | "Family-owned";
  status: "Verified" | "Pending" | "Rejected";
  verifiedBy?: string;
  verifiedOn?: string;
  visited: boolean;
  docs: { cnicFront: boolean; cnicBack: boolean; salarySlip: boolean; utilityBill: boolean };
};

function buildKycProfile(customer: any) {
  return {
    residence: {
      type: "Owned" as const,
      yearsAtAddress: 8,
      houseSize: "5 Marla",
      rooms: 4,
      ownerName: customer?.name ?? "â€”",
      rentAmount: 0,
      landmark: "Near Iqbal Park, opposite Faysal Mosque",
      geo: { lat: 31.5497, lng: 74.3436, mapsUrl: "https://maps.google.com/?q=31.5497,74.3436" },
      utilityBillNo: "LESCO-04-13-217-3344-U",
      utilityProvider: "LESCO",
      lastVisit: "2025-04-12",
    },
    employment: {
      employer: customer?.employer || "Allied Bank Ltd.",
      designation: customer?.designation || "Branch Operations Officer",
      sector: "Banking / Private",
      employeeId: "ABL-44219",
      monthsEmployed: 56,
      monthlyIncome: customer?.income || 145000,
      otherIncome: customer?.otherIncome || 20000,
      employerPhone: "+92 42 111-225-225",
      employerAddress: "Allied Bank, Main Boulevard, Gulberg III, Lahore",
      hrContact: "Mr. Faisal Mehmood (HR)",
      verifiedBy: "Asad Iqbal Â· Field Officer",
      verifiedOn: "2025-04-12",
      salarySlipsOnFile: 3,
    },
    documents: [
      { key: "cnic-f", label: "CNIC â€” Front", icon: <IdCard className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-03-04", expires: "2029-08-12", size: "1.4 MB" },
      { key: "cnic-b", label: "CNIC â€” Back", icon: <IdCard className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-03-04", expires: "2029-08-12", size: "1.2 MB" },
      { key: "util", label: "Utility Bill (LESCO)", icon: <Zap className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-02", size: "640 KB" },
      { key: "bank", label: "Bank Statement (6 mo)", icon: <Landmark className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-10", pages: 12, size: "3.1 MB" },
      { key: "salary", label: "Salary Slips (last 3)", icon: <Banknote className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-10", pages: 3, size: "880 KB" },
      { key: "cheque", label: "Security Cheque", icon: <FileSignature className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-12", size: "520 KB" },
      { key: "contract", label: "Signed HP Contract", icon: <FileCheck2 className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-14", pages: 6, size: "1.8 MB" },
      { key: "selfie", label: "Customer Selfie w/ CNIC", icon: <Camera className="h-4 w-4" />, status: "Verified", uploadedOn: "2025-04-12", size: "1.1 MB" },
      { key: "ref", label: "Reference Letter", icon: <FileText className="h-4 w-4" />, status: "Pending", size: "â€”" },
    ] as KycDoc[],
  };
}

function buildGuarantors(existing: any[], customer: any): GuarantorDetail[] {
  const defaults: GuarantorDetail[] = [
    {
      name: "Imran Yousaf",
      relation: "Elder Brother",
      cnic: "35202-7714928-3",
      cnicIssue: "2018-06-11",
      cnicExpiry: "2028-06-10",
      phone: "+92 321 4458876",
      whatsapp: "+92 321 4458876",
      dob: "1982-09-14",
      occupation: "Government Service",
      employer: "WAPDA â€” Lahore Region",
      designation: "Assistant Manager (BPS-17)",
      monthlyIncome: 165000,
      yearsEmployed: 11,
      address: "House 22-B, Street 7, Model Town, Lahore",
      area: "Model Town",
      residence: "Owned",
      status: "Verified",
      verifiedBy: "Asad Iqbal Â· Field Officer",
      verifiedOn: "2025-04-12",
      visited: true,
      docs: { cnicFront: true, cnicBack: true, salarySlip: true, utilityBill: true },
    },
    {
      name: "Tariq Mehmood",
      relation: "Colleague (10+ yrs)",
      cnic: "35202-0091334-7",
      cnicIssue: "2020-01-22",
      cnicExpiry: "2030-01-21",
      phone: "+92 300 8841120",
      whatsapp: "+92 300 8841120",
      dob: "1985-02-03",
      occupation: "Private Service",
      employer: "NestlÃ© Pakistan Ltd.",
      designation: "Senior Sales Executive",
      monthlyIncome: 210000,
      yearsEmployed: 8,
      address: "Flat 4-C, Askari XI, Lahore Cantt",
      area: "Askari XI",
      residence: "Rented",
      status: "Verified",
      verifiedBy: "Asad Iqbal Â· Field Officer",
      verifiedOn: "2025-04-13",
      visited: true,
      docs: { cnicFront: true, cnicBack: true, salarySlip: true, utilityBill: false },
    },
  ];
  const mapped: GuarantorDetail[] = existing.map((g, i) => ({
    ...defaults[i % 2],
    name: g.name || defaults[i % 2].name,
    cnic: g.cnic || defaults[i % 2].cnic,
    phone: g.phone || defaults[i % 2].phone,
    relation: g.relation || defaults[i % 2].relation,
    occupation: g.occupation || defaults[i % 2].occupation,
    status: (g.status as any) || defaults[i % 2].status,
  }));
  // Always ensure exactly 2 guarantors
  while (mapped.length < 2) mapped.push(defaults[mapped.length]);
  return mapped.slice(0, 2);
}

function KycTab({ customer, guarantors }: { customer: any; guarantors: any[] }) {
  const kyc = useMemo(() => buildKycProfile(customer), [customer]);
  const gList = useMemo(() => buildGuarantors(guarantors, customer), [guarantors, customer]);

  const verifiedDocs = kyc.documents.filter((d) => d.status === "Verified").length;
  const pctComplete = Math.round((verifiedDocs / kyc.documents.length) * 100);

  return (
    <div className="space-y-6">
      {/* Verification status banner */}
      <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
          <ShieldCheck className="h-[18px] w-[18px]" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">KYC Verification</h3>
            <Badge tone={pctComplete === 100 ? "success" : pctComplete >= 70 ? "primary" : "warning"}>
              {pctComplete === 100 ? "Verified" : pctComplete >= 70 ? "In Review" : "Incomplete"}
            </Badge>
            <span className="ml-auto text-xs font-semibold tabular-nums text-foreground">{pctComplete}%</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pctComplete}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1.5 tabular-nums">
            {verifiedDocs}/{kyc.documents.length} docs Â· Visited {kyc.residence.lastVisit}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
          <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Residence â€” visual hero card with photo + live map */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground inline-flex items-center gap-2">
            <span className="text-primary"><Home className="h-4 w-4" /></span> Residence Verification
          </h4>
          <div className="flex items-center gap-2">
            <Badge tone="success">Verified</Badge>
            <a
              href={kyc.residence.geo.mapsUrl}
              target="_blank" rel="noreferrer"
              className="text-[11px] inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open in Maps
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {/* House photo */}
          <div className="relative group aspect-[16/10] md:aspect-auto md:min-h-[260px] bg-muted overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80"
              alt="House front"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/55 backdrop-blur px-2 py-1 text-[10.5px] font-semibold text-white uppercase tracking-wider">
                <Camera className="h-3 w-3" /> House Front
              </span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
              <div className="text-[11px] text-white/90 leading-tight">
                <div className="font-semibold">{kyc.residence.houseSize} Â· {kyc.residence.type}</div>
                <div className="text-white/70">Captured {kyc.residence.lastVisit} Â· Geo-tagged</div>
              </div>
              <button className="h-7 px-2 inline-flex items-center gap-1 rounded bg-white/90 hover:bg-white text-[11px] font-semibold text-foreground">
                <Eye className="h-3 w-3" /> View
              </button>
            </div>
          </div>

          {/* Live map */}
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px] bg-muted">
            <iframe
              title="Customer residence location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${kyc.residence.geo.lng - 0.004},${kyc.residence.geo.lat - 0.0025},${kyc.residence.geo.lng + 0.004},${kyc.residence.geo.lat + 0.0025}&layer=mapnik&marker=${kyc.residence.geo.lat},${kyc.residence.geo.lng}`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
            />
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/55 backdrop-blur px-2 py-1 text-[10.5px] font-semibold text-white uppercase tracking-wider">
                <MapPinned className="h-3 w-3" /> Geo-tagged
              </span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 rounded-md bg-white/95 backdrop-blur px-2 py-1 text-[10.5px] font-mono text-foreground shadow-sm">
              {kyc.residence.geo.lat.toFixed(4)}, {kyc.residence.geo.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Detail strip */}
        <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-border/60 divide-x divide-border/60">
          {[
            ["Years at Address", `${kyc.residence.yearsAtAddress} yrs`],
            ["Rooms", `${kyc.residence.rooms}`],
            ["Owner", kyc.residence.ownerName],
            ["Utility", `${kyc.residence.utilityProvider}`],
          ].map(([k, v]) => (
            <div key={k as string} className="px-4 py-3 min-w-0">
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="text-[13px] font-medium text-foreground truncate mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 text-[11.5px] text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> {kyc.residence.landmark}
        </div>
      </section>

      {/* Employment */}
      <KycPanel
        icon={<Briefcase className="h-4 w-4" />}
        title="Employment Verification"
        status={<Badge tone="success">Verified</Badge>}
      >
        <div className="grid md:grid-cols-2 gap-x-8">
          <KycRows
            rows={[
              ["Employer", kyc.employment.employer],
              ["Designation", kyc.employment.designation],
              ["Sector", kyc.employment.sector],
              ["Employee ID", kyc.employment.employeeId],
              ["Duration", `${Math.floor(kyc.employment.monthsEmployed / 12)} yrs ${kyc.employment.monthsEmployed % 12} mo`],
            ]}
          />
          <KycRows
            rows={[
              ["Monthly Income", Rs(kyc.employment.monthlyIncome)],
              ["Other Income", Rs(kyc.employment.otherIncome)],
              ["HR Contact", kyc.employment.hrContact],
              ["Employer Phone", kyc.employment.employerPhone],
              ["Verified By", `${kyc.employment.verifiedBy} Â· ${kyc.employment.verifiedOn}`],
            ]}
          />
        </div>
      </KycPanel>

      {/* Document Vault */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileCheck2 className="h-3.5 w-3.5" /> Document Vault ({kyc.documents.length})
          </h3>
          <div className="text-[11px] text-muted-foreground">
            <span className="text-emerald-600 font-semibold">{kyc.documents.filter(d => d.status === "Verified").length}</span> verified Â·{" "}
            <span className="text-amber-600 font-semibold">{kyc.documents.filter(d => d.status === "Pending").length}</span> pending Â·{" "}
            <span className="text-destructive font-semibold">{kyc.documents.filter(d => d.status === "Missing" || d.status === "Expired").length}</span> missing
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {kyc.documents.map((d) => <DocCard key={d.key} doc={d} />)}
        </div>
      </section>

      {/* Guarantors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <UsersIcon className="h-3.5 w-3.5" /> Guarantors ({gList.length} / 2 required)
          </h3>
          <div className="text-[11px] text-muted-foreground">
            Combined income:{" "}
            <span className="text-foreground font-semibold tabular-nums">
              {Rs(gList.reduce((s, g) => s + g.monthlyIncome, 0))}
            </span>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {gList.map((g, i) => <GuarantorCard key={i} g={g} index={i + 1} />)}
        </div>
      </section>
    </div>
  );
}

function KycPanel({ icon, title, status, children }: { icon: ReactNode; title: string; status?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground inline-flex items-center gap-2">
          <span className="text-primary">{icon}</span> {title}
        </h4>
        {status}
      </div>
      {children}
    </section>
  );
}

function KycRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-1.5 border-b border-border/30 last:border-0">
          <dt className="text-muted-foreground text-[12.5px]">{k}</dt>
          <dd className="text-foreground font-medium text-right text-[12.5px] truncate max-w-[60%]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PhotoTile({ label, tone = "muted" }: { label: string; tone?: "primary" | "muted" }) {
  return (
    <div className={`rounded-lg border border-border ${tone === "primary" ? "bg-primary/5" : "bg-muted/30"} p-3 flex flex-col gap-1.5 hover:bg-muted/50 transition-colors cursor-pointer group`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Camera className="h-3 w-3" /> {label}
        </span>
        <Eye className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
      </div>
      <div className="aspect-[4/3] rounded-md bg-gradient-to-br from-muted to-muted/40 grid place-items-center">
        <Home className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <div className="text-[10px] text-muted-foreground">Captured 2025-04-12 Â· Geo-tagged</div>
    </div>
  );
}

function DocCard({ doc }: { doc: KycDoc }) {
  const tone =
    doc.status === "Verified" ? "success" :
    doc.status === "Pending" ? "warning" :
    "destructive";
  const isMissing = doc.status === "Missing";
  return (
    <div className={`rounded-lg border ${isMissing ? "border-dashed border-border bg-muted/20" : "border-border bg-card hover:border-primary/30 hover:shadow-sm"} p-3 transition-all group`}>
      <div className="flex items-start gap-2.5">
        <div className={`h-9 w-9 rounded-md grid place-items-center shrink-0 ${isMissing ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          {doc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13px] font-semibold text-foreground truncate">{doc.label}</div>
            <Badge tone={tone as any}>{doc.status}</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {doc.uploadedOn ? (
              <>Uploaded {doc.uploadedOn}{doc.pages ? ` Â· ${doc.pages} pages` : ""}{doc.size ? ` Â· ${doc.size}` : ""}</>
            ) : (
              <>Not uploaded yet</>
            )}
          </div>
          {doc.expires && (
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Expires {doc.expires}</div>
          )}
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isMissing ? (
              <>
                <button className="h-7 px-2 inline-flex items-center gap-1 rounded text-[11px] font-medium border border-border bg-card hover:bg-muted">
                  <Eye className="h-3 w-3" /> View
                </button>
                <button className="h-7 px-2 inline-flex items-center gap-1 rounded text-[11px] font-medium border border-border bg-card hover:bg-muted">
                  <Download className="h-3 w-3" /> Download
                </button>
              </>
            ) : (
              <button className="h-7 px-2 inline-flex items-center gap-1 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-3 w-3" /> Upload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuarantorCard({ g, index }: { g: GuarantorDetail; index: number }) {
  const initials = g.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const docCount = Object.values(g.docs).filter(Boolean).length;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-start gap-3">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guarantor #{index}</span>
            <Badge tone={g.status === "Verified" ? "success" : g.status === "Rejected" ? "destructive" : "warning"}>
              <BadgeCheck className="h-3 w-3 mr-0.5 inline" /> {g.status}
            </Badge>
            {g.visited && <Badge tone="primary">Field-Visited</Badge>}
          </div>
          <div className="text-sm font-semibold text-foreground mt-0.5">{g.name}</div>
          <div className="text-[11px] text-muted-foreground">{g.relation} Â· {g.occupation}</div>
        </div>
        <button className="h-7 w-7 grid place-items-center rounded-md border border-border bg-card hover:bg-muted shrink-0">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Body */}
      <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
        <GRow icon={<IdCard className="h-3 w-3" />} label="CNIC" value={<span className="font-mono">{g.cnic}</span>} />
        <GRow icon={<Calendar className="h-3 w-3" />} label="CNIC Expiry" value={g.cnicExpiry} />
        <GRow icon={<Phone className="h-3 w-3" />} label="Mobile" value={g.phone} />
        <GRow icon={<Calendar className="h-3 w-3" />} label="DOB" value={g.dob} />
        <GRow icon={<Building2 className="h-3 w-3" />} label="Employer" value={g.employer} />
        <GRow icon={<Briefcase className="h-3 w-3" />} label="Designation" value={g.designation} />
        <GRow icon={<ClockIcon className="h-3 w-3" />} label="Years Employed" value={`${g.yearsEmployed} yrs`} />
        <GRow icon={<Banknote className="h-3 w-3" />} label="Monthly Income" value={<span className="font-semibold tabular-nums">{Rs(g.monthlyIncome)}</span>} />
        <GRow icon={<Home className="h-3 w-3" />} label="Residence" value={g.residence} />
        <GRow icon={<MapPin className="h-3 w-3" />} label="Area" value={g.area} />
        <div className="col-span-2 pt-1 border-t border-border/40">
          <div className="text-[11px] text-muted-foreground mb-0.5">Address</div>
          <div className="text-foreground">{g.address}</div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-muted-foreground">Docs:</span>
          <DocChip ok={g.docs.cnicFront} label="CNIC F" />
          <DocChip ok={g.docs.cnicBack} label="CNIC B" />
          <DocChip ok={g.docs.salarySlip} label="Salary" />
          <DocChip ok={g.docs.utilityBill} label="Utility" />
          <span className="text-muted-foreground ml-1">({docCount}/4)</span>
        </div>
        <div className="text-[10.5px] text-muted-foreground">
          {g.verifiedBy ? <>Verified by {g.verifiedBy} Â· {g.verifiedOn}</> : "Not yet verified"}
        </div>
      </div>
    </div>
  );
}

function GRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">{icon} {label}</div>
      <div className="text-foreground font-medium truncate">{value}</div>
    </div>
  );
}

function DocChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 h-5 rounded text-[10px] font-semibold ${ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground border border-border"}`}>
      {ok ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}
