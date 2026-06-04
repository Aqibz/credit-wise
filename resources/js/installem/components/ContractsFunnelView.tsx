import { ReactNode, useEffect, useMemo } from "react";
import { EntityPage, type Kpi } from "@/components/EntityPage";
import { hpCasesConfig } from "@/lib/entities";
import { useEntityStore } from "@/lib/useEntityStore";
import { fmtPKR as Rs } from "@/lib/currency";

/**
 * Shared filtered view over the master contracts store (qcrm.hp-cases).
 *
 * Trick: we re-key EntityPage with a per-view storage key but re-snapshot
 * the filtered slice into that key on every render BEFORE EntityPage's
 * internal store reads it. This keeps each funnel page in sync with master
 * data without rewriting EntityPage.
 *
 * Funnel pages are read-only by design (hideAdd + no edit). Status changes
 * happen on the contract detail / main Contracts page.
 */
export function ContractsFunnelView({
  title,
  description,
  viewKey,
  statuses,
  emptyHint,
  extraKpis,
  hideAdd = true,
}: {
  title: string;
  description: string;
  viewKey: string;
  statuses: string[];
  emptyHint?: string;
  extraKpis?: Kpi<any>[];
  hideAdd?: boolean;
}) {
  const { items } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);

  const filtered = useMemo(
    () => (statuses.length === 0 ? items : items.filter((i) => statuses.includes(i.status))),
    [items, statuses],
  );

  // Snapshot the filtered slice into the per-view key so EntityPage's store
  // reads fresh data instead of a stale, merged copy.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(viewKey, JSON.stringify(filtered));
    } catch {}
  }
  // Also re-write when filtered changes (covers later updates while mounted).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(viewKey, JSON.stringify(filtered));
    } catch {}
  }, [viewKey, filtered]);

  const portfolio = filtered.reduce((s: number, x: any) => s + Number(x.financed || 0), 0);

  const kpis: Kpi<any>[] = extraKpis ?? [
    {
      label: title,
      icon: hpCasesConfig.kpis![0].icon as ReactNode,
      tone: "primary",
      compute: () => filtered.length,
    },
    {
      label: "Portfolio Value",
      icon: hpCasesConfig.kpis![3].icon as ReactNode,
      tone: "primary",
      compute: () => Rs(portfolio),
    },
  ];

  return (
    <EntityPage
      {...(hpCasesConfig as any)}
      title={title}
      description={description}
      storageKey={viewKey}
      seed={filtered}
      kpis={kpis}
      hideAdd={hideAdd}
      addHref={hideAdd ? undefined : hpCasesConfig.addHref}
      editHref={undefined}
    />
  );
}
