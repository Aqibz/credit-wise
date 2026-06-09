import { useState } from "react";
import { EntityPageContent } from "@/components/EntityPage";
import { AppShell } from "@/components/layout/AppShell";
import { departmentsConfig, designationsConfig } from "@/lib/entities";

type Tab = "dept" | "desig";

export function OrgStructureTabs({ initial = "dept" }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const tabs = (
    <div className="mb-5 -mt-2 flex items-center border-b border-border">
      <TabBtn active={tab === "dept"} onClick={() => setTab("dept")}>Departments</TabBtn>
      <TabBtn active={tab === "desig"} onClick={() => setTab("desig")}>Designations</TabBtn>
    </div>
  );
  return (
    <AppShell>
      {tab === "dept"
        ? <EntityPageContent {...departmentsConfig} headerSlot={tabs} />
        : <EntityPageContent {...designationsConfig} headerSlot={tabs} />}
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
