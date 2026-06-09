import { AppShell } from "@/layouts/super-admin/AppShell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import type { PageDescriptor, PageMetric } from "@/shared/types/page";

export function SuperAdminDashboard() {
  const page: PageDescriptor = {
    eyebrow: "Landlord",
    title: "Super Admin Dashboard",
    description: "High-level control plane for tenants, subscriptions, support access, and rollout state.",
  };

  const metrics: PageMetric[] = [
    { label: "Active Tenants", value: "128", hint: "12 in trial" },
    { label: "MRR", value: "Rs. 4.8M", hint: "Across all plans" },
    { label: "Support Access Sessions", value: "7", hint: "Audited active sessions" },
    { label: "Flagged Incidents", value: "3", hint: "Require review" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader {...page} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
        </div>
      </div>
    </AppShell>
  );
}
