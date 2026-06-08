import { Link } from "@tanstack/react-router";
import { Info, UserCheck, Wallet, CalendarClock, AlertTriangle } from "lucide-react";
import { EntityPage } from "@/components/EntityPage";
import { customersConfig, guarantorsConfig, blacklistConfig } from "@/lib/entities/customers";
import { useEntityStore } from "@/lib/useEntityStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}

function Rs(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

const PRODUCTS = [
  { product: "Gree 1.5 Ton Inverter AC", category: "Air Conditioner" },
  { product: 'Samsung 55" Crystal UHD TV', category: "Television" },
  { product: "Haier 18 Cft Refrigerator", category: "Refrigerator" },
  { product: "Honda CD 70 Motorcycle", category: "Two Wheeler" },
  { product: "Dawlance Microwave Oven", category: "Kitchen Appliance" },
  { product: "Orient Washing Machine 10kg", category: "Home Appliance" },
  { product: "Infinix Note 30 Pro", category: "Smartphone" },
  { product: "HP Pavilion Laptop", category: "Computer" },
];

function pickFor(id: string) {
  const n = Math.abs(hash(id));
  const p = PRODUCTS[n % PRODUCTS.length];
  const contractNo = `INS-${9000 + (n % 900)}`;
  const start = new Date(2026, (n % 6) + 1, (n % 27) + 1);
  const months = [12, 18, 24, 36][n % 4];
  const due = new Date(start);
  due.setMonth(due.getMonth() + ((n % months) + 1));
  const rate = [18, 22, 25, 28, 30, 35][n % 6];

  return { product: p, contractNo, start, months, due, rate };
}

function CreditScoreInfo() {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="How credit score works"
            className="h-10 px-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Credit score</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" sideOffset={8} className="max-w-xs p-0 bg-popover text-popover-foreground border border-border shadow-lg rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">How it works</div>
            <div className="text-[13px] font-semibold text-foreground mt-0.5">Customer credit score</div>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              A 300-850 score blended from KYC, income, repayment history, and overdue exposure. Higher is safer.
            </p>
            <ul className="space-y-1.5 text-[12px]">
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-foreground"><span className="h-2 w-2 rounded-full bg-emerald-600" />750 - 850</span>
                <span className="text-muted-foreground tabular-nums">Excellent</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-foreground"><span className="h-2 w-2 rounded-full bg-primary" />650 - 749</span>
                <span className="text-muted-foreground tabular-nums">Good</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-foreground"><span className="h-2 w-2 rounded-full bg-amber-600" />550 - 649</span>
                <span className="text-muted-foreground tabular-nums">Fair</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-foreground"><span className="h-2 w-2 rounded-full bg-destructive" />300 - 549</span>
                <span className="text-muted-foreground tabular-nums">High risk</span>
              </li>
            </ul>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80 pt-1 border-t border-border/60">
              Updated on each payment, overdue event, or KYC change.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AllCustomersPage() {
  return (
    <EntityPage
      {...customersConfig}
      rowHref={(item: any) => `/customers/${item.id}`}
      addHref="/customers/new"
      editHref={(item: any) => `/customers/${item.id}/edit`}
      toolbarEndSlot={<CreditScoreInfo />}
    />
  );
}

export function ActiveCustomersPage() {
  const { items } = useEntityStore(customersConfig.storageKey, customersConfig.seed as any);
  const activeItems = items
    .filter((i: any) => i.status === "Active")
    .map((i: any) => {
      const meta = pickFor(i.id);
      const emi = i.receivable > 0 && meta.months ? Math.round((Number(i.receivable) / meta.months) / 100) * 100 : 0;

      return {
        ...i,
        _product: meta.product.product,
        _category: meta.product.category,
        _contract: meta.contractNo,
        _contractDate: fmtDate(meta.start),
        _emi: emi,
        _emiDue: fmtDate(meta.due),
        _duration: `${meta.months} months`,
        _rate: meta.rate,
      };
    });

  const config = customersConfig as any;
  const totalReceivable = activeItems.reduce((s: number, i: any) => s + Number(i.receivable || 0), 0);
  const next30 = activeItems.reduce((s: number, i: any) => s + Number(i._emi || 0), 0);
  const badDebt = activeItems.reduce((s: number, i: any) => s + (Number(i.overdue || 0) > 0 ? Number(i.overdue || 0) : 0), 0);

  return (
    <EntityPage
      {...config}
      title="Active Customers"
      description="Customers with running contracts and live receivables."
      storageKey="qcrm.customers.active.view"
      seed={activeItems}
      hideAdd
      editHref={undefined}
      kpis={[
        { label: "Active Customers", icon: <UserCheck className="h-5 w-5" />, tone: "success" as const, compute: () => activeItems.length },
        { label: "Total Receivable", icon: <Wallet className="h-5 w-5" />, tone: "primary" as const, compute: () => Rs(totalReceivable) },
        { label: "Receivable in 30 Days", icon: <CalendarClock className="h-5 w-5" />, tone: "warning" as const, compute: () => Rs(next30) },
        { label: "Bad Debt", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive" as const, compute: () => Rs(badDebt) },
      ]}
      columns={[
        config.columns.find((c: any) => c.key === "name"),
        {
          key: "_product",
          header: "Product",
          render: (i: any) => (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground">{i._product}</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">{i._category}</span>
            </div>
          ),
        },
        {
          key: "_contract",
          header: "Contract",
          render: (i: any) => (
            <div className="flex flex-col leading-tight">
              <Link
                to="/customers/$customerId"
                params={{ customerId: String(i.id) }}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-primary hover:underline underline-offset-2 tabular-nums"
              >
                {i._contract}
              </Link>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">{i._contractDate}</span>
            </div>
          ),
        },
        {
          key: "_emi",
          header: "EMI",
          render: (i: any) => (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground tabular-nums">{i._emi > 0 ? Rs(i._emi) : "-"}</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">Due {i._emiDue}</span>
            </div>
          ),
        },
        {
          key: "_duration",
          header: "Duration",
          render: (i: any) => (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground">{i._duration}</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">Rental Rate {i._rate}%</span>
            </div>
          ),
        },
        config.columns.find((c: any) => c.key === "assignedTo"),
      ].filter(Boolean)}
      rowHref={(item: any) => `/customers/${item.id}`}
    />
  );
}

export function GuarantorsPage() {
  return <EntityPage {...guarantorsConfig} hideAdd />;
}

export function BlacklistPage() {
  return <EntityPage {...blacklistConfig} hideAdd />;
}
