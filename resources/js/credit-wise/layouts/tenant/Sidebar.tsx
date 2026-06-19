import { Link, useLocation } from "@/shared/navigation";
import {
  ChevronRight, AlertTriangle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSidebarState } from "./SidebarContext";
import userLogo from "@/assets/user-logo.png";
import { useActionCounts, ACTION_REQUIRED_ROUTES } from "@/lib/state/useActionCounts";
import { TENANT_NAV_SECTIONS } from "@/apps/tenant/navigation";
import { APP_RELEASE } from "@/shared/lib/release";

export function Sidebar() {
  const location = useLocation();
  const { collapsed } = useSidebarState();
  const actionCounts = useActionCounts();
  // SSR-safe initial state - deterministic, based only on current pathname.
  // Restoration from sessionStorage happens in useEffect after hydration.
  // Accordion mode: only one parent group open at a time.
  const findActiveParent = (pathname: string): string | null => {
    for (const s of TENANT_NAV_SECTIONS) {
      for (const it of s.items) {
        if (!it.children) continue;
        const onActive = it.children.some((c) => {
          if (c.to && (pathname === c.to || pathname.startsWith(`${c.to}/`))) return true;
          return c.children?.some((g) => g.to && (pathname === g.to || pathname.startsWith(`${g.to}/`))) ?? false;
        });
        if (onActive) return it.label;
      }
    }
    return null;
  };

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const active = findActiveParent(location.pathname);
    return active ? { [active]: true } : {};
  });

  // Auto-collapse other groups whenever the active route belongs to a different group.
  useEffect(() => {
    const active = findActiveParent(location.pathname);
    if (!active) return;
    setOpen((prev) => (prev[active] ? prev : { [active]: true }));
  }, [location.pathname]);

  // Persist & restore scroll position so sidebar doesn't "jump" between pages
  const navRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = Number(sessionStorage.getItem("qcrm.sidebar.scroll") || "0");
    if (saved > 0) el.scrollTop = saved;
    const onScroll = () => sessionStorage.setItem("qcrm.sidebar.scroll", String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const activeItemClass =
    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_18%,white)]";
  const activeSubItemClass =
    "bg-primary-soft/80 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_16%,white)]";

  return (
    <aside
      aria-hidden={collapsed}
      style={{ willChange: "width" }}
      className={`hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 overflow-hidden transition-[width] duration-200 ease-out ${
        collapsed ? "w-0 border-r-0 pointer-events-none" : "w-64"
      }`}
    >
      <div className="px-4 py-3 border-b border-sidebar-border bg-muted/60 dark:bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-card grid place-items-center shadow-sm ring-1 ring-border overflow-hidden">
            <img src={userLogo} alt="CreditWise logo" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <div className="font-semibold text-foreground leading-tight tracking-tight">CreditWise</div>
            <div className="text-[11px] text-muted-foreground">Retail Credit Management System</div>
          </div>
        </div>
      </div>
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-scrollbar">
        {TENANT_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const hasActive = item.children.some((c) => {
                  if (c.to && (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`))) return true;
                  return c.children?.some((g) => g.to && (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`))) ?? false;
                });
                const isOpen = Boolean(open[item.label]);
                // Sum of dynamic action counts across this item's children
                const dynChildSum = item.children.reduce((sum, c) => sum + (c.to && actionCounts[c.to] ? actionCounts[c.to] : 0), 0);
                const parentBadge = dynChildSum || item.badge || 0;
                const parentNeedsAction = dynChildSum > 0;
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen((s) => (s[item.label] ? {} : { [item.label]: true }));
                      }}
                    className={`group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                        hasActive
                          ? activeItemClass
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      }`}
                    >
                      <span className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${hasActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {parentBadge ? (
                        <span className={`h-5 min-w-[20px] px-1.5 inline-flex items-center justify-center gap-0.5 rounded-full text-[10px] font-bold ${parentNeedsAction ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}`}>
                          {parentNeedsAction ? <AlertTriangle className="h-2.5 w-2.5" /> : null}
                          {parentBadge}
                        </span>
                      ) : null}
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-[22px] mt-1 mb-1 space-y-0.5 border-l border-sidebar-border/70 pl-3">
                        {item.children.map((c, idx) => {
                          if (c.header) {
                            return (
                              <div
                                key={`hdr-${c.label}-${idx}`}
                                className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70"
                              >
                                {c.label}
                              </div>
                            );
                          }
                          if (c.children) {
                            const groupKey = `${item.label}::${c.label}`;
                            const groupActive = c.children.some((g) => g.to && (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`)));
                            const groupOpen = open[groupKey] ?? groupActive;
                            return (
                              <div key={groupKey}>
                                <button
                                  type="button"
                                  onClick={() => setOpen((s) => ({ ...s, [groupKey]: !(s[groupKey] ?? groupActive) }))}
                                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                                    groupActive ? activeSubItemClass : "text-muted-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                                  }`}
                                >
                                  <span className="flex-1 text-left">{c.label}</span>
                                  <ChevronRight className={`h-3 w-3 transition-transform ${groupOpen ? "rotate-90" : ""}`} />
                                </button>
                                {groupOpen && (
                                  <div className="ml-2 mt-0.5 mb-1 space-y-0.5 border-l border-sidebar-border/60 pl-3">
                                    {c.children.map((g, gi) => {
                                      const gActive = g.to ? (location.pathname === g.to || location.pathname.startsWith(`${g.to}/`)) : false;
                                      return (
                                        <Link
                                          key={`${g.to}-${gi}`}
                                          to={g.to as any}
                                          search={(g.search as any) ?? undefined}
                                          className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                            gActive
                                              ? `${activeSubItemClass} font-semibold`
                                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                          }`}
                                        >
                                          <span className="flex-1">{g.label}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          const pathMatch = c.to ? (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)) : false;
                          // If a sibling has a more specific (longer) `to` that also matches, defer to it
                          const moreSpecificSibling = c.to
                            ? item.children!.some((s) => s.to && s.to !== c.to &&
                                s.to.length > (c.to as string).length &&
                                (location.pathname === s.to || location.pathname.startsWith(`${s.to}/`)))
                            : false;
                          const currentTab = (location.search as any)?.tab as string | undefined;
                          const tabSiblings = item.children!.filter((s) => s.to && s.to === c.to && s.search?.tab);
                          const myTab = c.search?.tab;
                          let active = false;
                          if (pathMatch && !moreSpecificSibling) {
                            if (tabSiblings.length > 0) {
                              active = myTab ? currentTab === myTab : !currentTab;
                            } else {
                              active = true;
                            }
                          }
                          const dynCount = c.to ? actionCounts[c.to] : 0;
                          const childBadge = dynCount || c.badge || 0;
                          const childWarn = !!dynCount && c.to ? ACTION_REQUIRED_ROUTES.has(c.to) : false;
                          return (
                            <Link
                              key={`${c.to}-${myTab ?? idx}`}
                              to={c.to as any}
                              search={(c.search as any) ?? undefined}
                              className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                active
                                  ? `${activeSubItemClass} font-semibold`
                                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                              }`}
                            >
                              <span className="flex-1">{c.label}</span>
                              {childBadge ? (
                                <span className={`h-4 min-w-[18px] px-1 inline-flex items-center justify-center gap-0.5 rounded-full text-[9px] font-bold ${childWarn ? "bg-warning text-warning-foreground" : "bg-destructive/90 text-destructive-foreground"}`}>
                                  {childWarn ? <AlertTriangle className="h-2.5 w-2.5" /> : null}
                                  {childBadge}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const active = location.pathname === item.to;
              const dynamicBadge = item.to ? actionCounts[item.to] : 0;
              const itemBadge = dynamicBadge || item.badge || 0;
              const itemWarn = !!dynamicBadge && item.to ? ACTION_REQUIRED_ROUTES.has(item.to) : false;
              return (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                    active
                      ? `${activeItemClass} font-semibold`
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  }`}
                >
                  <span className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {itemBadge ? (
                    <span className={`h-5 min-w-[20px] px-1.5 inline-flex items-center justify-center gap-0.5 rounded-full text-[10px] font-bold ${itemWarn ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}`}>
                      {itemWarn ? <AlertTriangle className="h-2.5 w-2.5" /> : null}
                      {itemBadge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-3 bg-muted/30">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Release</div>
        <div className="mt-1 text-[11px] font-medium text-sidebar-foreground/80">{APP_RELEASE}</div>
      </div>
    </aside>
  );
}
