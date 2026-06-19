import { Link, useLocation } from "@/shared/navigation";
import { ChevronRight } from "lucide-react";
import userLogo from "@/assets/user-logo.png";
import { SUPER_ADMIN_NAV_SECTIONS } from "@/apps/super-admin/navigation";
import { APP_RELEASE } from "@/shared/lib/release";

export function Sidebar() {
  const location = useLocation();
  const activeItemClass =
    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_18%,white)]";

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 overflow-hidden">
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
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-scrollbar">
        {SUPER_ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.to ? location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) : false;

              return (
                <Link
                  key={item.to}
                  to={item.to as string}
                  className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                    active
                      ? activeItemClass
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  }`}
                >
                  <span className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
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
