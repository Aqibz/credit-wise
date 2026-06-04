import { Outlet } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SidebarProvider } from "./sidebar-context";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 px-4 xl:px-6 py-4 xl:py-6 text-[13px] xl:text-sm">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
