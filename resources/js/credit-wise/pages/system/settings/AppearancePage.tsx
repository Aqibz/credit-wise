import { Smartphone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit";
import { AppearanceConfig } from "@/pages/system/settings/components/AppearanceConfig";
import { SettingsTabs } from "@/pages/system/settings/SettingsTabs";

export function AppearancePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Appearance"
          description="Website branding, storefront defaults, app store links, and public-facing visual settings."
          icon={<Smartphone className="h-5 w-5 text-primary" />}
        />
        <SettingsTabs initial="appearance" />
        <Card className="border-border/60 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Website Appearance</CardTitle>
            <CardDescription>Brand colors, storefront behavior, app store links and social presence.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceConfig mode="website" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
