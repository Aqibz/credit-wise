import { useState } from "react";
import { EntityPageContent } from "@/components/EntityPage";
import { AppShell } from "@/components/layout/AppShell";
import { hrAssetsConfig, exitManagementConfig } from "@/lib/entities";

type Tab = "assets" | "exit";

export function OperationsTabs({ initial = "assets" }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const tabs = (
    <div className="mb-5 -mt-2 flex items-center border-b border-border">
      <TabBtn active={tab === "assets"} onClick={() => setTab("assets")}>Assets</TabBtn>
      <TabBtn active={tab === "exit"} onClick={() => setTab("exit")}>Exit Management</TabBtn>
    </div>
  );
  return (
    <AppShell>
      {tab === "assets"
        ? <EntityPageContent {...hrAssetsConfig} headerSlot={tabs} />
        : <EntityPageContent {...exitManagementConfig} headerSlot={tabs} />}
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
