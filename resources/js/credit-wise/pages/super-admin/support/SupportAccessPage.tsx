import { AppShell } from "@/layouts/super-admin/AppShell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import type { PageDescriptor, PageMetric } from "@/shared/types/page";

export function SupportAccessPage() {
  const page: PageDescriptor = {
    eyebrow: "Support",
    title: "Support Access",
    description: "This area should later hold audited tenant impersonation, support access approvals, and operational support logs.",
  };
  const metrics: PageMetric[] = [
    { label: "Pending Requests", value: "4", hint: "Awaiting approval" },
    { label: "Open Sessions", value: "2", hint: "Support staff currently inside tenant scope" },
    { label: "Audited Today", value: "11", hint: "Access trail entries" },
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
