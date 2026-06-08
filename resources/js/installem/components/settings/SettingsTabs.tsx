import { useRouter } from "@tanstack/react-router";
import { Bell, Building2, CreditCard, Globe, Plug, Settings2, ShieldCheck, Smartphone, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";
import { EntityPageContent } from "@/components/EntityPage";
import { AppearanceConfig } from "@/components/AppearanceConfig";
import {
  branchesConfig,
  integrationSettingsConfig,
  masterSettingsConfig,
  notificationsConfig,
  settingsConfig,
} from "@/lib/entities";
import { useEntityStore } from "@/lib/useEntityStore";

const SETTINGS_TABS = [
  { key: "master", label: "Master Settings", to: "/settings/master", icon: Settings2 },
  { key: "integrations", label: "Integrations", to: "/settings/integrations", icon: Plug },
  { key: "appearance", label: "Appearance", to: "/settings/appearance", icon: Smartphone },
  { key: "notifications", label: "Notifications", to: "/settings/notifications", icon: Bell },
  { key: "users", label: "Users & Access", to: "/settings/users", icon: ShieldCheck },
  { key: "branches", label: "Branches", to: "/settings/branches", icon: Building2 },
] as const;

type SettingsTabKey = (typeof SETTINGS_TABS)[number]["key"];

function SettingsTabNav({ active }: { active: SettingsTabKey }) {
  const router = useRouter();

  return (
    <UnderlineTabBar className="mb-5 overflow-x-auto">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          <div key={tab.key} className="shrink-0">
            <UnderlineTab active={active === tab.key} onClick={() => router.navigate({ to: tab.to })}>
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </span>
            </UnderlineTab>
          </div>
        );
      })}
    </UnderlineTabBar>
  );
}

function IntegrationOverview() {
  const { items } = useEntityStore(integrationSettingsConfig.storageKey, integrationSettingsConfig.seed);

  const gatewayCount = items.filter((item) => item.type === "Payment Gateway").length;
  const communicationCount = items.filter((item) => ["SMS", "WhatsApp", "Email"].includes(item.type)).length;
  const connectedCount = items.filter((item) => item.status === "Connected").length;
  const unstableCount = items.filter((item) => item.status === "Error" || item.status === "Pending").length;

  const cards = [
    {
      title: "Payments",
      description: "Gateways and wallet rails",
      value: gatewayCount,
      hint: "JazzCash, EasyPaisa, bank PSPs",
      icon: Wallet,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      title: "Messaging",
      description: "SMS, WhatsApp and email rails",
      value: communicationCount,
      hint: "Customer alerts and reminders",
      icon: Globe,
      tone: "text-sky-600 bg-sky-500/10",
    },
    {
      title: "Connected",
      description: "Healthy live integrations",
      value: connectedCount,
      hint: "Ready for production traffic",
      icon: Plug,
      tone: "text-primary bg-primary/10",
    },
    {
      title: "Attention Needed",
      description: "Pending or failed connectors",
      value: unstableCount,
      hint: "Needs review or credential refresh",
      icon: CreditCard,
      tone: "text-amber-700 bg-amber-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} className="border-border/60 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-sm">{card.title}</CardTitle>
                  <CardDescription className="mt-1">{card.description}</CardDescription>
                </div>
                <div className={`h-9 w-9 rounded-lg grid place-items-center ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-foreground">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MasterSettingsIntro() {
  return (
    <Card className="mb-5 border-border/60 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Configuration Zones</CardTitle>
        <CardDescription>
          Core tenant-wide controls that influence invoices, tax, numbering, print behavior and defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Company Profile", "Identity, fiscal year and default business metadata"],
          ["Currency & Tax", "Base currency, GST/WHT and accounting assumptions"],
          ["Numbering", "Invoice, PO and operational prefixes"],
          ["Communication & Print", "Email/SMS templates and printable document defaults"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SettingsTabs({ initial = "master" }: { initial?: SettingsTabKey }) {
  const active = initial;
  const tabs = <SettingsTabNav active={active} />;

  if (active === "integrations") {
    return (
      <>
        {tabs}
        <IntegrationOverview />
        <EntityPageContent {...integrationSettingsConfig} headerSlot={null} />
      </>
    );
  }

  if (active === "appearance") {
    return (
      <>
        {tabs}
        <div className="space-y-6">
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
      </>
    );
  }

  if (active === "notifications") {
    return (
      <>
        {tabs}
        <EntityPageContent {...notificationsConfig} headerSlot={null} />
      </>
    );
  }

  if (active === "users") {
    return (
      <>
        {tabs}
        <EntityPageContent {...settingsConfig} headerSlot={null} />
      </>
    );
  }

  if (active === "branches") {
    return (
      <>
        {tabs}
        <EntityPageContent {...branchesConfig} headerSlot={null} />
      </>
    );
  }

  return (
    <>
      {tabs}
      <MasterSettingsIntro />
      <EntityPageContent {...masterSettingsConfig} headerSlot={null} />
    </>
  );
}
