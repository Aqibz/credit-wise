import { Search, Bell, Maximize2, Sun, Moon, ChevronDown, PanelLeftClose, PanelLeftOpen, Building2, Check, CheckCircle2, AlertTriangle, CreditCard, UserPlus, Settings, LifeBuoy, KeyRound, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSidebarState } from "./SidebarContext";

const BRANCHES = [
  { id: "mt", name: "Model Town", code: "MT-LHR" },
  { id: "gb", name: "Gulberg", code: "GB-LHR" },
  { id: "dha", name: "DHA Phase 5", code: "DHA-LHR" },
  { id: "jt", name: "Johar Town", code: "JT-LHR" },
];

type Notif = { id: string; title: string; body: string; time: string; tone: "info" | "success" | "warning" | "destructive"; icon: any; unread?: boolean };

const NOTIFS: Notif[] = [
  { id: "1", title: "New payment received", body: "Rs. 12,500 from Ali Raza (INV-2041)", time: "2m ago", tone: "success", icon: CreditCard, unread: true },
  { id: "2", title: "Installment overdue", body: "3 customers crossed grace period today", time: "18m ago", tone: "destructive", icon: AlertTriangle, unread: true },
  { id: "3", title: "New customer onboarded", body: "Bilal Ahmed signed up at Model Town", time: "1h ago", tone: "info", icon: UserPlus, unread: true },
  { id: "4", title: "Daily target achieved", body: "Gulberg branch hit 86% of monthly target", time: "3h ago", tone: "success", icon: CheckCircle2 },
];

function useClickAway<T extends HTMLElement>(onAway: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onAway]);
  return ref;
}

export function Topbar() {
  const { toggle, collapsed, theme, toggleTheme } = useSidebarState();
  const [branchOpen, setBranchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState(BRANCHES[0]);

  const profileRef = useClickAway<HTMLDivElement>(() => setProfileOpen(false));

  const branchRef = useClickAway<HTMLDivElement>(() => setBranchOpen(false));
  const bellRef = useClickAway<HTMLDivElement>(() => setBellOpen(false));

  const unread = NOTIFS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-6 h-16">
        <button
          onClick={toggle}
          className="h-10 w-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted text-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search products, customers, CNIC, IMEI…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:bg-card focus:border-border focus:outline-none text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Branch selector */}
          <div className="relative" ref={branchRef}>
            <button
              onClick={() => setBranchOpen((v) => !v)}
              className="hidden md:flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card text-sm hover:bg-muted"
            >
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="font-semibold">{activeBranch.name}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${branchOpen ? "rotate-180" : ""}`} />
            </button>
            {branchOpen && (
              <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Branch
                </div>
                <div className="py-1 max-h-72 overflow-y-auto no-scrollbar">
                  {BRANCHES.map((b) => {
                    const active = b.id === activeBranch.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => { setActiveBranch(b); setBranchOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted ${active ? "bg-primary-soft/60" : ""}`}
                      >
                        <span className={`h-8 w-8 grid place-items-center rounded-md ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <Building2 className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-left">
                          <div className="font-semibold text-foreground">{b.name}</div>
                          <div className="text-[11px] text-muted-foreground">{b.code}</div>
                        </span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <Link to="/branches" onClick={() => setBranchOpen(false)} className="block px-3 py-2.5 text-xs font-semibold text-primary hover:bg-muted border-t border-border text-center">
                  Manage all branches →
                </Link>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-10 w-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className="h-10 w-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted text-foreground">
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative h-10 w-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-12 z-30 w-[360px] rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-primary text-primary-foreground">
                  <div>
                    <div className="font-semibold text-sm">Notifications</div>
                    <div className="text-[11px] opacity-90">{unread} unread • {NOTIFS.length} total</div>
                  </div>
                  <button className="text-[11px] font-semibold underline-offset-2 hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[380px] overflow-y-auto no-scrollbar divide-y divide-border">
                  {NOTIFS.map((n) => {
                    const Icon = n.icon;
                    const toneBg: Record<string, string> = {
                      info: "bg-info/15 text-info",
                      success: "bg-success/15 text-success-foreground",
                      warning: "bg-warning/20 text-warning-foreground",
                      destructive: "bg-destructive/15 text-destructive",
                    };
                    return (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-muted/50 ${n.unread ? "bg-primary-soft/30" : ""}`}>
                        <span className={`h-9 w-9 shrink-0 grid place-items-center rounded-lg ${toneBg[n.tone]}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-[13px] font-semibold text-foreground truncate">{n.title}</div>
                            {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                          </div>
                          <div className="text-[12px] text-muted-foreground truncate">{n.body}</div>
                          <div className="text-[10px] text-muted-foreground/80 mt-0.5">{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="relative h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground text-[12px] font-bold">
                AR
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
              </span>
              <span className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[12px] font-semibold text-foreground">Ali Raza</span>
                <span className="text-[10px] text-muted-foreground">Administrator</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 z-30 w-72 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-primary to-primary text-primary-foreground">
                  <span className="h-11 w-11 rounded-lg bg-primary-foreground/15 backdrop-blur grid place-items-center text-sm font-bold">
                    AR
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">Ali Raza</div>
                    <div className="text-[11px] opacity-90 truncate">ali.raza@creditwise.pk</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold bg-primary-foreground/15 px-1.5 py-0.5 rounded">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" /> Administrator
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  {[
                    { label: "My Profile", icon: UserCircle2, to: "/hr/employees" },
                    { label: "Account Settings", icon: Settings, to: "/settings" },
                    { label: "Security & Access", icon: KeyRound, to: "/security/user-access" },
                    { label: "Help & Support", icon: LifeBuoy, to: "/support/tickets" },
                  ].map((it) => {
                    const Icon = it.icon;
                    return (
                      <Link
                        key={it.label}
                        to={it.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{it.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-border py-1">
                  <Link
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-semibold">Sign out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
