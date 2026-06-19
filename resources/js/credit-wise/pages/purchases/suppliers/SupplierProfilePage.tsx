import { Link } from "@/shared/navigation";
import { useMemo, useState, ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, Badge, PageHeader, Breadcrumbs, ui } from "@/components/ui-kit";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { PageMeta } from "@/shared/ui/core/PageMeta";
import {
  suppliersConfig, purchaseOrdersConfig, grnConfig, billsConfig, paymentsMadeConfig, purchaseReturnsConfig,
} from "@/lib/entities";
import {
  ArrowLeft, Truck, ShoppingCart, ClipboardCheck, Receipt, Wallet, ArrowLeftRight, BookOpen, FileText,
  Phone, Mail, MapPin, Users, Percent, Handshake, Target, AlertTriangle, Calendar, TrendingUp,
  Search, Plus, UserX, Pencil, Paperclip, ChevronDown, MoreHorizontal, PowerOff, Trash2, Globe,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

type Tab = { key: string; label: string; icon: ReactNode };
const TABS: Tab[] = [
  { key: "overview", label: "Overview", icon: <Truck className="h-4 w-4" /> },
  { key: "transactions", label: "Transactions", icon: <Receipt className="h-4 w-4" /> },
  { key: "ledger", label: "Ledger", icon: <BookOpen className="h-4 w-4" /> },
  { key: "terms", label: "Terms & Policies", icon: <Handshake className="h-4 w-4" /> },
];

type TxTab = "po" | "grn" | "bills" | "payments" | "returns";
const TX_TABS: { key: TxTab; label: string; icon: ReactNode }[] = [
  { key: "po", label: "Purchase Orders", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
  { key: "grn", label: "GRN", icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
  { key: "bills", label: "Bills", icon: <Receipt className="h-3.5 w-3.5" /> },
  { key: "payments", label: "Payments", icon: <Wallet className="h-3.5 w-3.5" /> },
  { key: "returns", label: "Returns", icon: <ArrowLeftRight className="h-3.5 w-3.5" /> },
];

export function SupplierProfilePage({ supplierId }: { supplierId: string }) {
  const [tab, setTab] = useState("overview");
  const [txTab, setTxTab] = useState<TxTab>("po");

  const { items: suppliers } = useEntityStore<any>(suppliersConfig.storageKey, suppliersConfig.seed);
  const { items: pos } = useEntityStore<any>(purchaseOrdersConfig.storageKey, purchaseOrdersConfig.seed);
  const { items: grns } = useEntityStore<any>(grnConfig.storageKey, grnConfig.seed);
  const { items: bills } = useEntityStore<any>(billsConfig.storageKey, billsConfig.seed);
  const { items: payments, create: createPayment } = useEntityStore<any>(paymentsMadeConfig.storageKey, paymentsMadeConfig.seed);
  const { items: returns } = useEntityStore<any>(purchaseReturnsConfig.storageKey, purchaseReturnsConfig.seed);

  const supplier = suppliers.find((s) => s.id === supplierId);

  const sPos = useMemo(() => pos.filter((x) => x.supplier === supplier?.name), [pos, supplier]);
  const sGrns = useMemo(() => grns.filter((x) => x.supplier === supplier?.name), [grns, supplier]);
  const sBills = useMemo(() => bills.filter((x) => x.supplier === supplier?.name), [bills, supplier]);
  const sPayments = useMemo(() => payments.filter((x) => x.supplier === supplier?.name), [payments, supplier]);
  const sReturns = useMemo(() => returns.filter((x) => x.supplier === supplier?.name), [returns, supplier]);

  const totalPurchases = sBills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const outstanding = sBills.reduce((s, b) => s + Number(b.outstanding || 0), 0);
  const totalPaid = sPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const onTime = sBills.length ? Math.round((sBills.filter((b) => b.status === "Paid").length / sBills.length) * 100) : 0;

  const ledger = useMemo(() => {
    const events: any[] = [];
    sPayments.forEach((p) => {
      const isAdv = String(p.type || "").toLowerCase().includes("advance");
      events.push({ kind: isAdv ? "advance" : "payment", date: p.date, ref: p.ref, src: p });
    });
    sBills.forEach((b) => events.push({ kind: "bill", date: b.date, ref: b.ref, src: b }));
    sReturns.forEach((r) => { if (r.status === "Approved") events.push({ kind: "return", date: r.date, ref: r.ref, src: r }); });
    events.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    // FIFO advance lots, so each bill consumption can be attributed to the
    // originating advance payment(s) - required to reconcile the pool.
    const lots: { ref: string; date: string; source: "Advance" | "Return"; remaining: number }[] = [];
    const allocations: {
      date: string; billRef: string; billAmount: number;
      sourceRef: string; sourceDate: string; sourceKind: "Advance" | "Return";
      amount: number; poolAfter: number;
    }[] = [];
    let payable = 0;
    const rows: any[] = [];

    const poolBalance = () => lots.reduce((s, l) => s + l.remaining, 0);

    events.forEach((e) => {
      if (e.kind === "advance") {
        const amt = Number(e.src.amount || 0);
        lots.push({ ref: e.ref, date: e.date, source: "Advance", remaining: amt });
        rows.push({ date: e.date, ref: e.ref, type: "Advance Paid", description: `Method: ${e.src.method || "-"}`, debit: amt, credit: 0, advanceBalance: poolBalance() });
      } else if (e.kind === "payment") {
        const amt = Number(e.src.amount || 0);
        payable -= amt;
        rows.push({ date: e.date, ref: e.ref, type: `Payment (${e.src.method || "-"})`, description: `Bill ${e.src.bill || "-"}`, debit: amt, credit: 0, advanceBalance: poolBalance() });
      } else if (e.kind === "bill") {
        const amt = Number(e.src.amount || 0);
        payable += amt;
        rows.push({ date: e.date, ref: e.ref, type: "Bill", description: `PO ${e.src.po || "-"} - ${Rs(amt)}`, debit: 0, credit: amt, advanceBalance: poolBalance() });

        // Auto-deduct from advance pool (FIFO), capped at remaining payable
        let needed = Math.min(poolBalance(), payable);
        const usedSources: { ref: string; date: string; source: "Advance" | "Return"; amount: number }[] = [];
        for (const lot of lots) {
          if (needed <= 0) break;
          if (lot.remaining <= 0) continue;
          const take = Math.min(lot.remaining, needed);
          lot.remaining -= take;
          needed -= take;
          payable -= take;
          usedSources.push({ ref: lot.ref, date: lot.date, source: lot.source, amount: take });
          allocations.push({
            date: e.date, billRef: e.ref, billAmount: amt,
            sourceRef: lot.ref, sourceDate: lot.date, sourceKind: lot.source,
            amount: take, poolAfter: poolBalance(),
          });
        }
        if (usedSources.length) {
          const totalUsed = usedSources.reduce((s, u) => s + u.amount, 0);
          const sourceList = usedSources.map((u) => `${u.ref} (${Rs(u.amount)})`).join(", ");
          rows.push({
            date: e.date, ref: `${e.ref} - ADV`, type: "Advance Applied",
            description: `${Rs(totalUsed)} of bill ${e.ref} (${Rs(amt)}) <- ${sourceList}`,
            debit: 0, credit: -totalUsed, advanceBalance: poolBalance(), isAdvanceApplied: true,
            allocSources: usedSources, billRef: e.ref, billAmount: amt,
          });
        }
      } else if (e.kind === "return") {
        const amt = Number(e.src.amount || 0);
        payable -= amt;
        rows.push({ date: e.date, ref: e.ref, type: "Return", description: e.src.reason, debit: amt, credit: 0, advanceBalance: poolBalance() });
        if (payable < 0) {
          const recredit = -payable;
          payable = 0;
          lots.push({ ref: e.ref, date: e.date, source: "Return", remaining: recredit });
          rows.push({
            date: e.date, ref: `${e.ref} - ADV`, type: "Advance Re-credited",
            description: `Approved return exceeded payable - ${Rs(recredit)} credited to advance pool`,
            debit: 0, credit: recredit, advanceBalance: poolBalance(), isAdvanceRecredit: true,
          });
        }
      }
    });

    let bal = 0;
    const withBal = rows.map((r) => { bal += r.credit - r.debit; return { ...r, balance: bal }; });
    return Object.assign(withBal, { allocations, poolRemaining: poolBalance() });
  }, [sBills, sPayments, sReturns]);

  if (!supplier) {
    return (
      <AppShell>
        <PageHeader
          title="Supplier Not Found"
          description={`No supplier matches the ID "${supplierId}". It may have been removed or renamed.`}
          actions={
            <Link to="/purchases/suppliers" className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Back to Suppliers
            </Link>
          }
        />
        <SupplierNotFound suppliers={suppliers} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageMeta title={supplier.name} description="Supplier Profile" />
      <Breadcrumbs title={supplier.name} />

      <div className="mb-4 flex items-center justify-end gap-3">
        <Link to="/purchases/suppliers" className="text-primary text-xs font-medium inline-flex items-center gap-1 hover:underline shrink-0">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Suppliers
        </Link>
      </div>

      {/* Identity header - minimal, single line of meta */}
      <div className="rounded-xl bg-card border border-border/60 p-5 mb-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-14 w-14 rounded-xl bg-primary/10 grid place-items-center text-primary text-lg font-semibold shrink-0">
            {String(supplier.name).split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Supplier Profile</div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">{supplier.name}</h1>
              <Badge tone={supplier.status === "Active" ? "success" : supplier.status === "Blacklisted" ? "destructive" : "muted"}>{supplier.status}</Badge>
              {supplier.type && <span className="text-[11px] font-medium text-muted-foreground"> -  {supplier.type}</span>}
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium">{supplier.code}</span>
              {supplier.category && <span> -  {supplier.category}</span>}
              {supplier.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</span>}
              {supplier.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {supplier.email}</span>}
              {supplier.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {supplier.city}{supplier.country ? `, ${supplier.country}` : ""}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/purchases/suppliers/$supplierId/edit"
              params={{ supplierId: String(supplier.id) }}
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
                  <span className="text-sm font-semibold">Attachments</span>
                </div>
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No Files Attached
                </div>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    className="w-full flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 hover:bg-muted/60 py-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Paperclip className="h-4 w-4" /> Upload your Files
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      You can upload a maximum of 10 files, 10MB each
                    </span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> New Transaction
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Purchases
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/bills"><Receipt className="h-4 w-4 mr-2" /> Bill</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/payments"><Wallet className="h-4 w-4 mr-2" /> Bill Payment</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/expenses"><Receipt className="h-4 w-4 mr-2" /> Expense</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/bills"><Receipt className="h-4 w-4 mr-2" /> Recurring Bill</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/expenses"><Receipt className="h-4 w-4 mr-2" /> Recurring Expense</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/orders/new"><ShoppingCart className="h-4 w-4 mr-2" /> Purchase Order</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/purchases/returns"><ArrowLeftRight className="h-4 w-4 mr-2" /> Vendor Credit</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  More <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Export Profile</DropdownMenuItem>
                <DropdownMenuItem><BookOpen className="h-4 w-4 mr-2" /> View Ledger</DropdownMenuItem>
                <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Send Statement</DropdownMenuItem>
                <DropdownMenuItem><Globe className="h-4 w-4 mr-2" /> Configure Vendor Portal</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><PowerOff className="h-4 w-4 mr-2" /> Mark as Inactive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <UserX className="h-4 w-4 mr-2" /> Blacklist Supplier
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* KPI strip - flat, minimal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Purchases" value={Rs(totalPurchases)} icon={<KpiIcons.cart />} tone="primary" hint={`${sBills.length} bills`} />
        <StatCard label="Total Paid" value={Rs(totalPaid)} icon={<KpiIcons.wallet />} tone="success" hint={`${sPayments.length} payments`} />
        <StatCard label="Outstanding" value={Rs(outstanding)} icon={<KpiIcons.invoice />} tone={outstanding > 0 ? "warning" : "success"} hint="Payable balance" />
        <StatCard label="On-Time Rate" value={`${onTime}%`} icon={<KpiIcon icon={ClipboardCheck} />} tone="primary" hint={`Lead ${supplier.leadTime || "-"} days`} />
      </div>

      {/* Tabs - underline style, SaaS standard */}
      <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
        <div className="flex border-b border-border px-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Company</h3>
                  <dl className="space-y-1.5 text-sm">
                    {[
                      ["Legal Name", supplier.name],
                      ["Display Name", supplier.displayName || "-"],
                      ["Code", supplier.code],
                      ["Type", supplier.supplierType || "-"],
                      ["Origin", supplier.type || "-"],
                      ["NTN", supplier.ntn || "-"],
                      ["STRN / GST", supplier.strn || "-"],
                      ["Industry", supplier.industry || "-"],
                      ["Website", supplier.website || "-"],
                      ["Contact Person", supplier.contactPerson || "-"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between gap-4 py-1.5">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="text-foreground font-medium text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Banking & Commercial</h3>
                  <dl className="space-y-1.5 text-sm">
                    {[
                      ["Bank", supplier.bankName || "-"],
                      ["Account Title", supplier.accountTitle || "-"],
                      ["Account #", supplier.accountNo || "-"],
                      ["IBAN", supplier.iban || "-"],
                      ["Currency", supplier.currency || "PKR"],
                      ["Credit Limit", Rs(supplier.creditLimit)],
                      ["Opening Balance", `${Rs(supplier.balance)} ${supplier.balanceType || ""}`],
                      ["Lead Time", `${supplier.leadTime || "-"} days`],
                      ["MOQ", String(supplier.moq || "-")],
                      ["Warehouse", supplier.warehouse || "-"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between gap-4 py-1.5">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="text-foreground font-medium text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>

              {Array.isArray(supplier.brands) && supplier.brands.length > 0 && (
                <section className="pt-4 border-t border-border/60">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Brands Carried</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {supplier.brands.map((b: string) => <span key={b} className="text-xs px-2.5 py-1 rounded-md bg-muted text-foreground font-medium">{b}</span>)}
                  </div>
                </section>
              )}

              <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-border/60">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Documents
                  </h3>
                  {Array.isArray(supplier.documents) && supplier.documents.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                      {supplier.documents.map((d: any, i: number) => (
                        <li key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-foreground font-medium">{d.name}</span>
                          <span className="text-xs text-muted-foreground">{d.type}{d.expiry ? ` - exp ${d.expiry}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                  )}
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> Primary Contact
                  </h3>
                  <div className="text-sm space-y-1">
                    <div className="text-foreground font-medium">{supplier.contactPerson || "-"}</div>
                    {supplier.phone && <div className="text-muted-foreground inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {supplier.phone}</div>}
                    {supplier.email && <div className="text-muted-foreground inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {supplier.email}</div>}
                  </div>
                </section>
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div>
              <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-muted/50 w-fit">
                {TX_TABS.map((t) => {
                  const count =
                    t.key === "po" ? sPos.length :
                    t.key === "grn" ? sGrns.length :
                    t.key === "bills" ? sBills.length :
                    t.key === "payments" ? sPayments.length :
                    sReturns.length;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTxTab(t.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        txTab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                      <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${txTab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {txTab === "po" && <HistoryTable
                headers={["PO #", "Date", "Branch", "Amount", "Status"]}
                rows={sPos.map((p) => [p.ref, p.date, p.branch, Rs(p.amount), <Badge key="b" tone={p.status === "Approved" ? "success" : p.status === "Pending" ? "warning" : "muted"}>{p.status}</Badge>])}
                empty="No purchase orders for this supplier." />}

              {txTab === "grn" && <HistoryTable
                headers={["GRN #", "PO #", "Date", "Amount", "Status"]}
                rows={sGrns.map((g) => [g.ref, g.po, g.date, Rs(g.amount), <Badge key="b" tone={g.status === "Received" ? "success" : "warning"}>{g.status}</Badge>])}
                empty="No goods received notes." />}

              {txTab === "bills" && <HistoryTable
                headers={["Bill #", "Date", "Due", "Amount", "Outstanding", "Status"]}
                rows={sBills.map((b) => [b.ref, b.date, b.due, Rs(b.amount), Rs(b.outstanding), <Badge key="b" tone={b.status === "Paid" ? "success" : b.status === "Overdue" ? "destructive" : "warning"}>{b.status}</Badge>])}
                empty="No bills raised by this supplier." />}

              {txTab === "payments" && <HistoryTable
                headers={["Payment #", "Date", "Bill", "Method", "Type", "Amount", "Status"]}
                rows={sPayments.map((p) => [p.ref, p.date, p.bill, p.method, p.type, Rs(p.amount), <Badge key="b" tone={p.status === "Paid" ? "success" : "warning"}>{p.status}</Badge>])}
                empty="No payments made." />}

              {txTab === "returns" && <HistoryTable
                headers={["Return #", "Date", "GRN", "Reason", "Qty", "Amount", "Status"]}
                rows={sReturns.map((r) => [r.ref, r.date, r.grn, r.reason, r.qty, Rs(r.amount), <Badge key="b" tone={r.status === "Approved" ? "success" : "warning"}>{r.status}</Badge>])}
                empty="No purchase returns." />}
            </div>
          )}

          {tab === "ledger" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <StatCard label="Total Bills" value={Rs(ledger.filter((r) => r.type === "Bill").reduce((s, r) => s + r.credit, 0))} icon={<KpiIcons.invoice />} tone="warning" />
                <StatCard label="Total Paid (cash)" value={Rs(ledger.filter((r) => !r.isAdvanceApplied && !r.isAdvanceRecredit && r.debit > 0 && r.type !== "Advance Paid" && r.type !== "Return").reduce((s, r) => s + r.debit, 0))} icon={<KpiIcons.wallet />} tone="success" />
                <StatCard label="Advance Applied" value={Rs(ledger.filter((r) => r.isAdvanceApplied).reduce((s, r) => s + Math.abs(r.credit), 0))} icon={<KpiIcons.trendUp />} tone="primary" hint="Auto-deducted into bills" />
                <StatCard label="Advance Re-credited" value={Rs(ledger.filter((r) => r.isAdvanceRecredit).reduce((s, r) => s + r.credit, 0))} icon={<KpiIcon icon={ArrowLeftRight} />} tone="success" hint="From approved returns" />
                <StatCard label="Running Balance" value={Rs(ledger.length ? ledger[ledger.length - 1].balance : 0)} icon={<KpiIcon icon={BookOpen} />} tone="primary" />
              </div>
              <HistoryTable
                headers={["Date", "Ref", "Type", "Description", "Debit", "Credit", "Adv Pool", "Balance"]}
                rows={ledger.map((l) => [
                  l.date,
                  (l.isAdvanceApplied || l.isAdvanceRecredit) ? <span key="r" className="text-primary">{l.ref}</span> : l.ref,
                  l.isAdvanceApplied
                    ? <Badge key="t" tone="primary">down Advance Applied</Badge>
                    : l.isAdvanceRecredit
                    ? <Badge key="t" tone="success">up Advance Re-credited</Badge>
                    : l.type === "Advance Paid"
                    ? <Badge key="t" tone="success">{l.type}</Badge>
                    : l.type,
                  l.description,
                  l.debit ? Rs(l.debit) : "-",
                  l.isAdvanceApplied
                    ? <span key="c" className="text-primary font-semibold">- {Rs(Math.abs(l.credit))}</span>
                    : l.isAdvanceRecredit
                    ? <span key="c" className="text-success-foreground font-semibold">+ {Rs(l.credit)}</span>
                    : l.credit ? Rs(l.credit) : "-",
                  <span key="a" className="text-xs font-mono text-muted-foreground">{Rs(l.advanceBalance)}</span>,
                  Rs(l.balance),
                ])}
                 empty="No ledger activity." />
            </>
          )}

          {tab === "terms" && (
            <PaymentTermsView supplier={supplier} payments={sPayments} bills={sBills} onAddAdvance={() => {}} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function HistoryTable({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty: string }) {
  if (!rows.length) {
    return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">{empty}</div>;
  }
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

function PaymentTermsView({ supplier, payments, bills, onAddAdvance }: { supplier: any; payments: any[]; bills: any[]; onAddAdvance: (p: any) => void }) {
  const term = supplier.paymentTerms || "Net 30";
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Standard Terms</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        {[
          ["Payment Term", term],
          ["Currency", supplier.currency || "PKR"],
          ["Credit Limit", Rs(supplier.creditLimit || 0)],
          ["Lead Time", `${supplier.leadTime || "-"} days`],
          ["MOQ", String(supplier.moq || "-")],
          ["Preferred Method", supplier.paymentMethod || "Bank Transfer"],
          ["Bank", supplier.bankName || "-"],
          ["IBAN", supplier.iban || "-"],
          ["Late Fee", supplier.lateFee || "1.5% / month after due date"],
          ["Early Payment Discount", supplier.earlyPaymentDiscount || "2% if paid within 7 days"],
        ].map(([k, v]) => (
          <div key={k as string} className="flex items-center justify-between border-b border-border/60 py-2">
            <span className="text-muted-foreground font-medium">{k}</span>
            <span className="text-foreground font-semibold">{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function _LegacyPaymentTermsView({ supplier, payments, bills, onAddAdvance }: { supplier: any; payments: any[]; bills: any[]; onAddAdvance: (p: any) => void }) {
  const term = supplier.paymentTerms || "Net 30";
  const advancePaid = payments.filter((p) => String(p.type || "").toLowerCase().includes("advance")).reduce((s, p) => s + Number(p.amount || 0), 0);
  const billed = bills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const otherPaid = payments.filter((p) => !String(p.type || "").toLowerCase().includes("advance")).reduce((s, p) => s + Number(p.amount || 0), 0);
  const advanceRemaining = Math.max(0, advancePaid - Math.max(0, billed - otherPaid));

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-5">
          <div className="flex items-center gap-2 mb-2"><Handshake className="h-4 w-4 text-primary" /><span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active Term</span></div>
          <div className="text-2xl font-bold text-foreground">{term}</div>
          <div className="text-xs text-muted-foreground mt-1.5">{supplier.currency || "PKR"} - Credit limit {Rs(supplier.creditLimit || 0)}</div>
        </div>
        <StatCard label="Advance Paid" value={Rs(advancePaid)} icon={<KpiIcons.trendUp />} tone="success" hint="Pre-paid to vendor" />
        <StatCard label="Advance Remaining" value={Rs(advanceRemaining)} icon={<KpiIcons.wallet />} tone={advanceRemaining > 0 ? "primary" : "muted" as any} hint="Auto-deducted as bills arrive" />
      </div>


      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Standard Terms</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            ["Payment Term", term],
            ["Currency", supplier.currency || "PKR"],
            ["Credit Limit", Rs(supplier.creditLimit || 0)],
            ["Lead Time", `${supplier.leadTime || "-"} days`],
            ["MOQ", String(supplier.moq || "-")],
            ["Preferred Method", supplier.paymentMethod || "Bank Transfer"],
            ["Bank", supplier.bankName || "-"],
            ["IBAN", supplier.iban || "-"],
            ["Late Fee", supplier.lateFee || "1.5% / month after due date"],
            ["Early Payment Discount", supplier.earlyPaymentDiscount || "2% if paid within 7 days"],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center justify-between border-b border-border/60 py-2">
              <span className="text-muted-foreground font-medium">{k}</span>
              <span className="text-foreground font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function PoliciesView({ supplier, payments = [], bills = [] }: { supplier: any; payments?: any[]; bills?: any[] }) {
  const discountTiers: { qty: number; discount: number; note?: string }[] = supplier.discountTiers || [
    { qty: 10, discount: 3, note: "Wholesale starter" },
    { qty: 50, discount: 5, note: "Bulk order" },
    { qty: 100, discount: 8, note: "Premium volume" },
    { qty: 250, discount: 12, note: "Strategic partner" },
  ];
  const targets: { period: string; target: number; reward: string }[] = supplier.targets || [
    { period: "Quarterly", target: 5000000, reward: "2% rebate on total invoices" },
    { period: "Annual", target: 25000000, reward: "5% rebate + extended Net 45 terms" },
  ];
  const policies: { title: string; description: string; tone: "success" | "warning" | "primary" }[] = supplier.policies || [
    { title: "Damaged Goods Returns", description: "Full credit note within 7 days of delivery for visible damages.", tone: "success" },
    { title: "Warranty Coverage", description: "12 months on all white-goods, 6 months on small appliances.", tone: "primary" },
    { title: "Price Protection", description: "If list price drops within 30 days of purchase, vendor issues credit for the difference.", tone: "primary" },
    { title: "Late Delivery Penalty", description: "0.5% per day on undelivered value capped at 10%.", tone: "warning" },
  ];

  return (
    <div className="space-y-5">
      <PolicyCalculator supplier={supplier} discountTiers={discountTiers} targets={targets} payments={payments} bills={bills} />
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Percent className="h-4 w-4 text-primary" /> Volume Discount Tiers</h3>
        <p className="text-xs text-muted-foreground mb-4">Vendor offers tiered discounts based on order quantity per PO.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {discountTiers.map((t, i) => (
            <div key={i} className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
              <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Buy {t.qty}+</div>
              <div className="text-3xl font-bold text-primary mt-1">{t.discount}%</div>
              <div className="text-xs text-foreground/80 mt-2 font-medium">{t.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Sales Targets &amp; Rebates</h3>
        <div className="space-y-2">
          {targets.map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary grid place-items-center"><TrendingUp className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.period} target {Rs(t.target)}</div>
                  <div className="text-xs text-muted-foreground">{t.reward}</div>
                </div>
              </div>
              <Badge tone="primary">{t.period}</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-primary" /> Vendor Policies</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {policies.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone={p.tone}>{p.title}</Badge>
              </div>
              <p className="text-sm text-foreground/85 mt-2 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PolicyCalculator({
  supplier, discountTiers, targets, payments, bills,
}: {
  supplier: any;
  discountTiers: { qty: number; discount: number; note?: string }[];
  targets: { period: string; target: number; reward: string }[];
  payments: any[];
  bills: any[];
}) {
  const [qty, setQty] = useState<number>(50);
  const [unitPrice, setUnitPrice] = useState<number>(10000);
  const [payDays, setPayDays] = useState<number>(7);
  const [useAdvance, setUseAdvance] = useState<boolean>(true);

  // Advance available
  const advancePaid = payments.filter((p) => String(p.type || "").toLowerCase().includes("advance")).reduce((s, p) => s + Number(p.amount || 0), 0);
  const billed = bills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const otherPaid = payments.filter((p) => !String(p.type || "").toLowerCase().includes("advance")).reduce((s, p) => s + Number(p.amount || 0), 0);
  const advanceAvailable = Math.max(0, advancePaid - Math.max(0, billed - otherPaid));

  // Tier discount: highest tier whose qty threshold is met
  const sortedTiers = [...discountTiers].sort((a, b) => a.qty - b.qty);
  const matchedTier = [...sortedTiers].reverse().find((t) => qty >= t.qty);
  const tierPct = matchedTier?.discount || 0;
  const nextTier = sortedTiers.find((t) => t.qty > qty);

  // Early-payment discount (parsed from supplier.earlyPaymentDiscount like "2% if paid within 7 days")
  const epStr: string = supplier.earlyPaymentDiscount || "2% if paid within 7 days";
  const epMatch = epStr.match(/(\d+(?:\.\d+)?)\s*%[^\d]*?(\d+)\s*day/i);
  const epPct = epMatch ? Number(epMatch[1]) : 0;
  const epWindow = epMatch ? Number(epMatch[2]) : 0;
  const epQualifies = epPct > 0 && payDays <= epWindow;

  const gross = qty * unitPrice;
  const tierDiscount = gross * (tierPct / 100);
  const afterTier = gross - tierDiscount;
  const earlyDiscount = epQualifies ? afterTier * (epPct / 100) : 0;
  const netBill = afterTier - earlyDiscount;
  const advanceUsed = useAdvance ? Math.min(advanceAvailable, netBill) : 0;
  const cashDue = Math.max(0, netBill - advanceUsed);

  // Target progress (annual target if defined)
  const annual = targets.find((t) => /year|annual/i.test(t.period)) || targets[0];
  const ytdSpend = billed;
  const projected = ytdSpend + netBill;
  const targetVal = Number(annual?.target || 0);
  const beforePct = targetVal ? Math.min(100, (ytdSpend / targetVal) * 100) : 0;
  const afterPct = targetVal ? Math.min(100, (projected / targetVal) * 100) : 0;
  const crossesTarget = targetVal > 0 && ytdSpend < targetVal && projected >= targetVal;

  return (
    <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-[0_4px_16px_-6px_rgba(16,24,40,0.10)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Percent className="h-4 w-4" /> Policies &amp; Terms - Preview Calculator
          </h3>
          <p className="text-xs text-muted-foreground mt-1">See expected discount, advance deduction, and target impact before saving an order.</p>
        </div>
        <Badge tone="primary">What-if</Badge>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Quantity</span>
            <input type="number" min={0} value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price (Rs.)</span>
            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pay In (days)</span>
            <input type="number" min={0} value={payDays} onChange={(e) => setPayDays(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <span className="text-[11px] text-muted-foreground mt-1 block">Early-payment policy: {epStr}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={useAdvance} onChange={(e) => setUseAdvance(e.target.checked)} className="h-4 w-4 rounded border-border" />
            <span className="text-xs font-medium">Auto-deduct from advance ({Rs(advanceAvailable)} available)</span>
          </label>
        </div>

        {/* Output */}
        <div className="lg:col-span-3 space-y-2.5">
          <Row label="Gross order" value={Rs(gross)} muted />
          <Row
            label={`Volume discount${matchedTier ? ` - ${matchedTier.qty}+ tier (${tierPct}%)` : ` - no tier (need ${sortedTiers[0]?.qty || 0}+)`}`}
            value={`- ${Rs(tierDiscount)}`}
            tone={tierPct > 0 ? "success" : "muted"}
          />
          <Row
            label={`Early-payment discount${epQualifies ? ` - ${epPct}% (paid <= ${epWindow}d)` : ` - not qualifying (>${epWindow}d)`}`}
            value={`- ${Rs(earlyDiscount)}`}
            tone={epQualifies ? "success" : "muted"}
          />
          <Row label="Net bill" value={Rs(netBill)} bold />
          <Row label={`Advance applied${useAdvance ? "" : " (off)"}`} value={`- ${Rs(advanceUsed)}`} tone="primary" />
          <div className="rounded-xl border-2 border-primary/40 bg-primary/10 p-3 flex items-center justify-between mt-2">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Cash Due Now</span>
            <span className="text-2xl font-bold text-primary">{Rs(cashDue)}</span>
          </div>
          {nextTier && (
            <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              Order <b>{nextTier.qty - qty}</b> more units to unlock <b className="text-primary">{nextTier.discount}%</b> tier discount.
            </div>
          )}

          {/* Target impact */}
          {targetVal > 0 && (
            <div className="rounded-lg border border-border p-3 mt-2">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">{annual?.period} target impact</span>
                <span className="font-mono">{Rs(projected)} / {Rs(targetVal)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-muted-foreground/30" style={{ width: `${beforePct}%` }} />
                <div className="absolute inset-y-0 left-0 bg-primary transition-all" style={{ width: `${afterPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>Before: {beforePct.toFixed(1)}%</span>
                <span>After: <b className="text-primary">{afterPct.toFixed(1)}%</b></span>
              </div>
              {crossesTarget && (
                <div className="mt-2 text-[11px] text-success-foreground bg-success/15 rounded px-2 py-1.5 font-medium">
                  OK This order crosses the target - unlocks reward: <b>{annual.reward}</b>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, tone, bold, muted }: { label: string; value: string; tone?: "success" | "primary" | "muted"; bold?: boolean; muted?: boolean }) {
  const toneCls =
    tone === "success" ? "text-success-foreground" :
    tone === "primary" ? "text-primary" :
    tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <div className={`flex items-center justify-between border-b border-border/50 pb-1.5 ${muted ? "text-muted-foreground" : ""}`}>
      <span className="text-xs">{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-bold text-foreground" : `font-semibold ${toneCls}`}`}>{value}</span>
    </div>
  );
}

function AdvancePaymentForm({ supplier, advanceRemaining, onSubmit }: { supplier: any; advanceRemaining: number; onSubmit: (p: any) => void }) {
  const [open, setOpen] = useState(false);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: todayIso,
    amount: "",
    method: supplier.paymentMethod || "Bank Transfer",
    reference: "",
    notes: "",
  });
  const [allowNegative, setAllowNegative] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // zod schema - validates shape, ranges, and enforces explicit override
  // when the resulting pool would be negative.
  const advanceSchema = useMemo(() => z.object({
    date: z.string().min(1, "Date is required"),
    amount: z.number().refine((n) => n !== 0, "Amount cannot be zero")
      .refine((n) => Math.abs(n) <= 100_000_000, "Amount exceeds the allowed limit"),
    method: z.string().min(1),
    reference: z.string().max(60, "Reference is too long").optional(),
    notes: z.string().max(500, "Notes are too long").optional(),
    allowNegative: z.boolean(),
  }).superRefine((v, ctx) => {
    const projected = advanceRemaining + v.amount;
    if (projected < 0 && !v.allowNegative) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `This entry would push the advance pool to ${Rs(projected)}. Tick "Allow negative balance" to override.`,
      });
    }
  }), [advanceRemaining]);

  const amt = Number(form.amount || 0);
  const projected = advanceRemaining + amt;
  const wouldGoNegative = projected < 0;

  function reset() {
    setForm({ date: todayIso, amount: "", method: supplier.paymentMethod || "Bank Transfer", reference: "", notes: "" });
    setAllowNegative(false);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = advanceSchema.safeParse({
      date: form.date,
      amount: amt,
      method: form.method,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
      allowNegative,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid entry");
      return;
    }
    const ref = form.reference.trim() || `ADV-${Date.now().toString().slice(-6)}`;
    onSubmit({
      date: form.date,
      ref,
      type: "Advance",
      method: form.method,
      amount: amt,
      bill: "",
      status: "Paid",
      notes: form.notes.trim(),
    });
    reset();
    setOpen(false);
  }

  return (
    <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-[0_4px_16px_-6px_rgba(16,24,40,0.10)]">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Record Advance Payment
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Pre-pay this vendor, or enter a negative amount to reverse/adjust. Future bills auto-deduct from the advance pool.</p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm">
            + New Advance
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm" />
          </Field>
          <Field label="Amount (Rs.) - negative to reverse">
            <input type="number" step="0.01" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(null); }} placeholder="0" required className={`w-full h-9 px-2.5 rounded-md border bg-background text-sm font-semibold ${wouldGoNegative && !allowNegative ? "border-destructive" : "border-border"}`} />
          </Field>
          <Field label="Method">
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm">
              {["Bank Transfer", "Cheque", "Cash", "Online", "Wire"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Reference">
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} maxLength={60} placeholder="Auto" className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm font-mono" />
          </Field>
          <Field label="Notes">
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} placeholder="Optional" className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm" />
          </Field>

          {wouldGoNegative && (
            <div className="md:col-span-2 lg:col-span-5 rounded-lg border border-warning/40 bg-warning/10 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-foreground shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-foreground">This entry would make the advance pool negative</div>
                <div className="text-muted-foreground mt-0.5">
                  Current pool {Rs(advanceRemaining)} + this entry {Rs(amt)} ={" "}
                  <b className={projected < 0 ? "text-destructive" : "text-foreground"}>{Rs(projected)}</b>.
                </div>
                <label className="mt-2 inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowNegative}
                    onChange={(e) => { setAllowNegative(e.target.checked); setError(null); }}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="font-medium">Allow negative balance (I take responsibility for this adjustment)</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="md:col-span-2 lg:col-span-5 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-5 flex items-center justify-between gap-3 pt-2 mt-1 border-t border-border/60">
            <div className="text-xs text-muted-foreground">
              Current advance: <b className="text-foreground">{Rs(advanceRemaining)}</b>
              <span className="mx-2 text-muted-foreground/50">-&gt;</span>
              After this entry: <b className={wouldGoNegative ? "text-destructive" : "text-primary"}>{Rs(projected)}</b>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { reset(); setOpen(false); }} className="h-9 px-4 rounded-md border border-border bg-card text-xs font-semibold hover:bg-muted">Cancel</button>
              <button
                type="submit"
                disabled={!amt || (wouldGoNegative && !allowNegative)}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Advance
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={`${ui.textKpiLabel} ${ui.textMuted} text-[11px]`}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SupplierNotFound({ suppliers }: { suppliers: any[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!term) return [] as any[];
    return suppliers
      .filter((s) =>
        [s.name, s.code, s.city, s.category, s.phone, s.email]
          .filter(Boolean)
          .some((v: string) => String(v).toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [suppliers, term]);

  return (
    <div className="rounded-xl bg-card border border-border/60 shadow-[0_2px_8px_-4px_rgba(16,24,40,0.08)] p-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-warning/15 text-warning-foreground grid place-items-center mb-3">
          <UserX className="h-7 w-7" />
        </div>
        <h2 className="text-base font-semibold text-foreground">We couldn't find that supplier</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Search by name, code, city, or category to jump straight to the right supplier - or browse the full list.
        </p>

        <div className="w-full mt-5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {term && (
            <div className="mt-3 text-left">
              {matches.length === 0 ? (
                <div className="text-xs text-muted-foreground px-2 py-3">No suppliers match "{q}".</div>
              ) : (
                <ul className="rounded-lg border border-border/60 divide-y divide-border/60 overflow-hidden bg-background">
                  {matches.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/purchases/suppliers/$supplierId"
                        params={{ supplierId: s.id }}
                        className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {s.code || "-"}{s.city ? ` - ${s.city}` : ""}{s.category ? ` - ${s.category}` : ""}
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/purchases/suppliers"
              search={term ? ({ q: term } as any) : undefined}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              <Search className="h-4 w-4" /> {term ? `Search "${q}" in Suppliers` : "Browse all suppliers"}
            </Link>
            <Link
              to="/purchases/suppliers/new"
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> Add new supplier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
