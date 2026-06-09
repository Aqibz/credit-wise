import { useRouter } from "@/shared/navigation";
import { Bell, Building2, Plug, Settings2, ShieldCheck, Smartphone } from "lucide-react";
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";

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

export function SettingsTabs({ initial = "master" }: { initial?: SettingsTabKey }) {
  return <SettingsTabNav active={initial} />;
}
