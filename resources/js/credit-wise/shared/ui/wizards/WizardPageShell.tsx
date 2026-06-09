import { ReactNode } from "react";
import { Link } from "@/shared/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

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

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        <Link to={backTo} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
      </div>
      {children}
    </AppShell>
  );
}
