import { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type WidgetStatus = "ready" | "loading" | "error" | "empty";

type Props = {
  state: WidgetStatus;
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  className?: string;
  /** Skeleton variant shown while loading */
  skeleton?: "rows" | "chart" | "table" | "tiles" | "kpi";
  /** Empty state copy */
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: { label: string; to?: string; onClick?: () => void };
  /** Error state copy */
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function WidgetCard({
  state,
  title,
  description,
  rightSlot,
  className = "",
  skeleton = "rows",
  emptyTitle = "Nothing to show yet",
  emptyHint,
  emptyAction,
  errorMessage = "We couldn't load this widget.",
  onRetry,
  children,
}: Props) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 xl:p-5 animate-fade-in ${className}`}
      aria-busy={state === "loading"}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h2 className="text-sm xl:text-[15px] font-semibold truncate">{title}</h2>
          {description && (
            <p className="text-[11px] text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <div className="shrink-0">{rightSlot}</div>
      </div>

      {state === "loading" && <Skeleton variant={skeleton} />}
      {state === "error" && <ErrorState message={errorMessage} onRetry={onRetry} />}
      {state === "empty" && (
        <EmptyState title={emptyTitle} hint={emptyHint} action={emptyAction} />
      )}
      {state === "ready" && children}
    </div>
  );
}

function Bar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-md bg-muted/70 animate-pulse ${className}`} style={style} />;
}

function Skeleton({ variant }: { variant: NonNullable<Props["skeleton"]> }) {
  if (variant === "kpi") {
    return (
      <div className="space-y-2">
        <Bar className="h-3 w-20" />
        <Bar className="h-6 w-28" />
        <Bar className="h-2.5 w-16" />
      </div>
    );
  }
  if (variant === "chart") {
    return (
      <div className="h-[240px] flex items-end gap-2 px-1">
        {[55, 38, 72, 48, 84, 62, 45, 78, 56, 90, 64, 50].map((h, i) => (
          <Bar key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }
  if (variant === "tiles") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-16" />
        ))}
      </div>
    );
  }
  if (variant === "table") {
    return (
      <div className="space-y-2">
        <Bar className="h-3 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <Bar className="h-3.5 col-span-2" />
            <Bar className="h-3.5" />
            <Bar className="h-3.5" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 p-2.5">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Bar className="h-3 w-2/3" />
            <Bar className="h-2.5 w-1/3" />
          </div>
          <Bar className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: { label: string; to?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 rounded-lg border border-dashed border-border/70 bg-muted/20">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-[13px] font-medium">{title}</div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1 max-w-[280px]">{hint}</p>}
      {action && (action.to ? (
        <Link
          to={action.to as any}
          className="mt-3 inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90"
        >
          {action.label}
        </Link>
      ) : (
        <button
          onClick={action.onClick}
          className="mt-3 inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <div className="text-[13px] font-medium text-destructive">Something went wrong</div>
      <p className="text-[11px] text-muted-foreground mt-1 max-w-[280px]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-card text-[11px] font-medium hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

/** KPI-card variants for the dense top grid */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <Bar className="h-3 w-16" />
        <Bar className="h-6 w-6 rounded-full" />
      </div>
      <Bar className="h-6 w-24" />
      <Bar className="h-2.5 w-20" />
    </div>
  );
}
