import { Link } from "@/shared/navigation";
import { ExternalLink } from "lucide-react";
import { useEntityStore } from "@/lib/state/useEntityStore";

/**
 * Renders a supplier name as a link to /purchases/suppliers/{id}.
 * Looks up the id from the suppliers store by matching name.
 * Stops propagation so it works inside table rows that also have an onRowClick.
 */
export function SupplierLink({ name }: { name?: string | null }) {
  const { items: suppliers } = useEntityStore<any>("qcrm.suppliers", []);
  if (!name) return <span className="text-muted-foreground">â€”</span>;
  const match = suppliers.find((s: any) => s?.name === name);
  if (!match) return <span>{name}</span>;
  return (
    <Link
      to="/purchases/suppliers/$supplierId"
      params={{ supplierId: String(match.id) }}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      title="View vendor profile"
    >
      {name}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </Link>
  );
}
