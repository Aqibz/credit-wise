import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-white">
        <header className="h-16 border-b border-border bg-white/95 backdrop-blur px-4 xl:px-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Super Admin</div>
            <div className="text-[11px] text-muted-foreground">Landlord control plane</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Tenant provisioning, subscriptions, support access
          </div>
        </header>
        <main className="flex-1 bg-white px-4 xl:px-6 py-4 xl:py-6 text-[13px] xl:text-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
