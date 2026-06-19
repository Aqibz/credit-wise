import { Link } from "@/shared/navigation";
import { Bell, Building2, Plug, Settings2, ShieldCheck, Smartphone } from "lucide-react";
import { UnderlineTabBar } from "@/components/ui/underline-tabs";

const SETTINGS_TABS = [
  { key: "master", label: "Master Settings", to: "/settings", icon: Settings2 },
  { key: "integrations", label: "Integrations", to: "/settings/integrations", icon: Plug },
  { key: "appearance", label: "Appearance", to: "/settings/appearance", icon: Smartphone },
  { key: "notifications", label: "Notifications", to: "/settings/notifications", icon: Bell },
  { key: "users", label: "Users & Access", to: "/settings/users", icon: ShieldCheck },
  { key: "branches", label: "Branches", to: "/settings/branches", icon: Building2 },
] as const;

type SettingsTabKey = (typeof SETTINGS_TABS)[number]["key"];

function SettingsTabNav({ active }: { active: SettingsTabKey }) {
  return (
    <UnderlineTabBar className="mb-5 overflow-x-auto">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          <div key={tab.key} className="shrink-0">
            <Link
              to={tab.to}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                active === tab.key
                  ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </span>
            </Link>
          </div>
        );
      })}
    </UnderlineTabBar>
  );
}

export function SettingsTabs({ initial = "master" }: { initial?: SettingsTabKey }) {
  return <SettingsTabNav active={initial} />;
}
