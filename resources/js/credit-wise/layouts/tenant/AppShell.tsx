import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SidebarProvider } from "./SidebarContext";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-white text-foreground">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-white">
          <Topbar />
          <main className="flex-1 bg-white px-4 xl:px-6 py-4 xl:py-6 text-[13px] xl:text-sm">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
