import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EntityPage, type EntityPageProps } from "@/components/EntityPage";
import type { Entity } from "@/lib/state/useEntityStore";

type LoadConfig<T extends Entity> = () => Promise<EntityPageProps<T>>;

export function LegacyEntityRoute<T extends Entity>({
  loadConfig,
  initialSearch = "",
}: {
  loadConfig: LoadConfig<T>;
  initialSearch?: string;
}) {
  const [config, setConfig] = useState<EntityPageProps<T> | null>(null);

  useEffect(() => {
    let active = true;

    loadConfig().then((resolved) => {
      if (active) {
        setConfig(resolved);
      }
    });

    return () => {
      active = false;
    };
  }, [loadConfig]);

  if (!config) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading page...
        </div>
      </div>
    );
  }

  return <EntityPage {...config} initialSearch={initialSearch} />;
}
