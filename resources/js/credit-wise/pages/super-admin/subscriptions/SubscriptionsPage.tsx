import { AppShell } from "@/layouts/super-admin/AppShell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import type { PageDescriptor, PageMetric } from "@/shared/types/page";

export function SubscriptionsPage() {
  const page: PageDescriptor = {
    eyebrow: "Billing",
    title: "Subscriptions",
    description: "Plan catalog, tenant subscriptions, renewals, grace periods, and revenue visibility belong here.",
  };
  const metrics: PageMetric[] = [
    { label: "Starter Plans", value: "42", hint: "Active subscriptions" },
    { label: "Business Plans", value: "61", hint: "Main production tier" },
    { label: "Enterprise Plans", value: "25", hint: "Custom contract tier" },
  ];
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader {...page} />
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
        </div>
      </div>
    </AppShell>
  );
}
