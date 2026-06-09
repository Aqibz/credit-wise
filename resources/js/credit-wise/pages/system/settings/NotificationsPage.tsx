import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { EntityPageContent } from "@/components/EntityPage";
import { notificationsConfig } from "@/lib/entities/settings";
import { SettingsTabs } from "@/pages/system/settings/SettingsTabs";

export function NotificationsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="SMS, WhatsApp, email and reminder rules for tenant-wide communication."
        icon={<Bell className="h-5 w-5 text-primary" />}
      />
      <SettingsTabs initial="notifications" />
      <EntityPageContent {...notificationsConfig} headerSlot={null} />
    </div>
  );
}
