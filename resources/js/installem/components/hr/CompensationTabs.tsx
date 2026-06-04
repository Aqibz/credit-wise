import { useState } from "react";
import { EntityPageContent } from "@/components/EntityPage";
import { AppShell } from "@/components/layout/AppShell";
import { payrollConfig, commissionsConfig, loanManagementConfig } from "@/lib/entities";

type Tab = "payroll" | "comm" | "loans";

export function CompensationTabs({ initial = "payroll" }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const tabs = (
    <div className="mb-5 -mt-2 flex items-center border-b border-border">
      <TabBtn active={tab === "payroll"} onClick={() => setTab("payroll")}>Payrolls</TabBtn>
      <TabBtn active={tab === "comm"} onClick={() => setTab("comm")}>Commissions</TabBtn>
      <TabBtn active={tab === "loans"} onClick={() => setTab("loans")}>Loans</TabBtn>
    </div>
  );
  return (
    <AppShell>
      {tab === "payroll" && <EntityPageContent {...payrollConfig} headerSlot={tabs} />}
      {tab === "comm" && <EntityPageContent {...commissionsConfig} headerSlot={tabs} />}
      {tab === "loans" && <EntityPageContent {...loanManagementConfig} headerSlot={tabs} />}
    </AppShell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-[13px] font-semibold transition-colors ${
        active
          ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
