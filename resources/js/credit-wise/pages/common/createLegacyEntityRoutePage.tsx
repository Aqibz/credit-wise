import { useLocation } from "@/shared/navigation";
import { LegacyEntityRoute } from "@/pages/common/LegacyEntityRoute";
import type { EntityPageProps } from "@/components/EntityPage";
import type { Entity } from "@/lib/state/useEntityStore";

type LoadConfig<T extends Entity> = () => Promise<EntityPageProps<T>>;

export function createLegacyEntityRoutePage<T extends Entity>(loadConfig: LoadConfig<T>) {
  return function LegacyEntityRoutePage() {
    const { search } = useLocation();
    const initialSearch = typeof search?.q === "string" ? search.q : "";

    return <LegacyEntityRoute loadConfig={loadConfig} initialSearch={initialSearch} />;
  };
}
