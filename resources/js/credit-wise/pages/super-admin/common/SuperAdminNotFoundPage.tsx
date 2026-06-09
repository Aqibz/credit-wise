import { AppShell } from "@/layouts/super-admin/AppShell";
import { Button } from "@/components/ui/button";
import type { RouteNotFoundProps } from "@/shared/types/page";

export function SuperAdminNotFoundPage({ pathname }: RouteNotFoundProps) {
  return (
    <AppShell>
      <div className="min-h-[60vh] grid place-items-center">
        <div className="max-w-lg text-center space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Super Admin Route
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            This control-plane page is not wired yet
          </h1>
          <p className="text-sm text-muted-foreground">
            No super-admin page was registered for <span className="font-medium text-foreground">{pathname}</span>.
          </p>
          <Button asChild>
            <a href="/super-admin">Back to dashboard</a>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
