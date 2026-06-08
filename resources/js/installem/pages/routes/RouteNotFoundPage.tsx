import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function RouteNotFoundPage({ pathname }: { pathname: string }) {
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-5 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Route Not Wired</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This path does not have an explicit frontend page contract yet.
          </p>
          <code className="inline-flex rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground">
            {pathname}
          </code>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.navigate({ to: "/" })}>Go to dashboard</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
