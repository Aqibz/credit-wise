import { ReactNode } from "react";
import { Link } from "@/shared/navigation";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageMeta } from "@/shared/ui/core/PageMeta";

export function WizardPageShell({
  backTo,
  backLabel,
  crumb,
  title,
  children,
}: {
  backTo: string;
  backLabel: string;
  crumb: { label: string; to?: string }[];
  title: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <PageMeta title={title} />

      <nav className="mb-3 flex items-center gap-1.5 overflow-hidden text-[12px] text-muted-foreground">
        <Link to="/" className="font-semibold text-primary hover:opacity-80">
          Dashboard
        </Link>
        {crumb.map((item, index) => {
          const isLast = index === crumb.length - 1;
          const content = <span className={isLast ? "font-semibold text-foreground" : undefined}>{item.label}</span>;

          return (
            <span key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              {item.to && !isLast ? (
                <Link to={item.to} className="truncate hover:text-foreground">
                  {content}
                </Link>
              ) : (
                content
              )}
            </span>
          );
        })}
      </nav>

      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
      </div>
      {children}
    </AppShell>
  );
}
