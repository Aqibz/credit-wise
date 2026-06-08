import { ReactNode } from "react";
import { Construction } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui-kit";

export function ComingSoon({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary-soft text-primary grid place-items-center mb-4">
          <Construction className="h-7 w-7" />
        </div>
        <h3 className="font-semibold text-lg">Module coming soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          This section is part of the CreditWise blueprint. The UI scaffold and design system are ready — wire up data and workflows next.
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </AppShell>
  );
}
