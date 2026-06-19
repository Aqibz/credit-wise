import { Info } from "lucide-react";
import { EntityPage } from "@/components/EntityPage";
import { customersConfig } from "@/lib/entities/customers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      hideAdd
      editHref={(item: any) => `/customers/${item.id}/edit`}
      toolbarEndSlot={<CreditScoreInfo />}
    />
  );
}
