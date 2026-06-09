import { AppShell } from "@/layouts/super-admin/AppShell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import type { PageDescriptor, PageMetric } from "@/shared/types/page";

export function TenantsPage() {
  const page: PageDescriptor = {
    eyebrow: "Tenants",
    title: "Tenant Directory",
    description: "Future home for tenant provisioning, plan assignment, domains, health status, and support access controls.",
  };
  const metrics: PageMetric[] = [
    { label: "Provisioned", value: "134", hint: "Across all environments" },
    { label: "Suspended", value: "5", hint: "Billing or policy hold" },
    { label: "Needs Attention", value: "9", hint: "Domain, SSL, or onboarding issues" },
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
