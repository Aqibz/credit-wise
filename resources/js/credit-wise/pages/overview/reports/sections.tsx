import {
  Building2,
  CalendarClock,
  FileText,
  Folder,
  FolderOpen,
  Mail,
  MessageSquare,
  Pause,
  Pencil,
  Phone,
  Play,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import type { ReportSchedule } from "@/components/reports/schedule-types";
import type { Role } from "@/lib/state/useCurrentUser";
import { MODULES, REPORT_ROUTES } from "./catalog";
import { RoleSelect } from "./controls";
import { formatNext } from "./utils";
import type { ModuleTab, Report } from "./types";

type RbacBannerProps = {
  user: {
    name: string;
    role: Role;
    branches: string[];
  };
  roles: readonly Role[];
  allowedModules: ModuleTab[];
  setUser: (user: { name: string; role: Role; branches: string[] }) => void;
};

export function ReportsRbacBanner({ user, roles, allowedModules, setUser }: RbacBannerProps) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/5 p-3 mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 grid place-items-center rounded-lg bg-primary/15 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Signed in as</div>
          <div className="text-[13px] font-bold text-foreground">{user.name}</div>
        </div>
      </div>
      <RoleSelect roles={roles} value={user.role} onChange={(role) => setUser({ ...user, role })} />
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
        <Building2 className="h-3.5 w-3.5" />
        Branch scope:
        <span className="text-foreground">
          {user.branches.includes("*") ? "All Branches" : user.branches.join(", ") || "-"}
        </span>
      </div>
      <div className="ml-auto text-[11px] text-muted-foreground font-semibold">
        {allowedModules.length} of {MODULES.length} modules accessible
      </div>
    </div>
  );
}

type ReportsSidebarProps = {
  search: string;
  setSearch: (value: string) => void;
  tab: string;
  setTab: (tab: string) => void;
  favorites: string[];
  allowedModules: ModuleTab[];
};

export function ReportsSidebar({
  search,
  setSearch,
  tab,
  setTab,
  favorites,
  allowedModules,
}: ReportsSidebarProps) {
  const isFavoritesView = tab === "__favorites";

  return (
    <aside className="rounded-xl border border-border bg-card overflow-hidden h-fit lg:sticky lg:top-4">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reports..."
            className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setTab("__favorites")}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium border-b border-border transition-colors ${
          isFavoritesView ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60"
        }`}
      >
        <Star className={`h-4 w-4 ${isFavoritesView ? "fill-primary text-primary" : ""}`} strokeWidth={1.75} />
        <span className="flex-1 text-left">Favorites</span>
        {favorites.length > 0 && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isFavoritesView ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {favorites.length}
          </span>
        )}
      </button>

      <div className="px-3 pt-3 pb-1.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Report Category
        </div>
      </div>
      <nav className="pb-2">
        {allowedModules.map((moduleTab) => {
          const activeCategory = !isFavoritesView && tab === moduleTab.id;
          const FolderIcon = activeCategory ? FolderOpen : Folder;

          return (
            <button
              key={moduleTab.id}
              type="button"
              onClick={() => setTab(moduleTab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors group ${
                activeCategory ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/60"
              }`}
            >
              <FolderIcon
                className={`h-4 w-4 shrink-0 ${
                  activeCategory ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
                strokeWidth={1.75}
              />
              <span className="flex-1 text-left truncate">{moduleTab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeCategory ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/80"
                }`}
              >
                {moduleTab.reports.length}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

type ScheduledDeliveriesProps = {
  active: ModuleTab;
  schedules: ReportSchedule[];
  runNow: (schedule: ReportSchedule) => void;
  togglePause: (schedule: ReportSchedule) => void;
  openSchedule: (report: Report, schedule?: ReportSchedule) => void;
  removeSchedule: (schedule: ReportSchedule) => void;
};

export function ScheduledDeliveriesPanel({
  active,
  schedules,
  runNow,
  togglePause,
  openSchedule,
  removeSchedule,
}: ScheduledDeliveriesProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-semibold text-foreground tracking-tight text-sm">Scheduled Deliveries</h2>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {schedules.length}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">Auto-delivered via Email / SMS / WhatsApp</span>
      </div>
      <ul className="divide-y divide-border">
        {schedules.map((schedule) => {
          const report = active.reports.find((item) => item.id === schedule.reportId);

          return (
            <li key={schedule.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-[13px] truncate">{schedule.reportName}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      schedule.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {schedule.frequency}
                  {schedule.dayOfWeek ? ` • ${schedule.dayOfWeek}` : ""}
                  {schedule.dayOfMonth ? ` • day ${schedule.dayOfMonth}` : ""}
                  {` at ${schedule.time} • next: ${formatNext(schedule.nextRun)}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {schedule.channels.includes("Email") && (
                  <span className="h-7 w-7 grid place-items-center rounded-md bg-primary/10 text-primary" title="Email">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                )}
                {schedule.channels.includes("SMS") && (
                  <span className="h-7 w-7 grid place-items-center rounded-md bg-info/10 text-info" title="SMS">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                )}
                {schedule.channels.includes("WhatsApp") && (
                  <span className="h-7 w-7 grid place-items-center rounded-md bg-success/15 text-success" title="WhatsApp">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => runNow(schedule)}
                  title="Send now"
                  className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90"
                >
                  <Zap className="h-3 w-3" /> Run Now
                </button>
                <button
                  onClick={() => togglePause(schedule)}
                  title={schedule.status === "Active" ? "Pause" : "Resume"}
                  className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted"
                >
                  {schedule.status === "Active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                {report && (
                  <button
                    onClick={() => openSchedule(report, schedule)}
                    title="Edit"
                    className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => removeSchedule(schedule)}
                  title="Delete"
                  className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReportsEmptyState({ isFavoritesView }: { isFavoritesView: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted text-muted-foreground grid place-items-center mb-3">
        {isFavoritesView ? <Star className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </div>
      <h3 className="font-semibold text-[14px]">
        {isFavoritesView ? "No favorites yet" : "No reports match your search"}
      </h3>
      <p className="text-[12px] text-muted-foreground mt-1 max-w-sm mx-auto">
        {isFavoritesView
          ? "Star any report to pin it here for one-click access."
          : "Try a different keyword or pick a category from the sidebar."}
      </p>
    </div>
  );
}

type ReportCardsGridProps = {
  active: ModuleTab;
  favoriteReports: { report: Report; module: ModuleTab }[];
  visibleReports: Report[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isFavoritesView: boolean;
  schedules: ReportSchedule[];
  navigateTo: (path: string) => void;
};

export function ReportCardsGrid({
  active,
  favoriteReports,
  visibleReports,
  favorites,
  toggleFavorite,
  isFavorite,
  isFavoritesView,
  schedules,
  navigateTo,
}: ReportCardsGridProps) {
  if (visibleReports.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 animate-fade-in">
      {visibleReports.map((report, index) => {
        const cardModule = isFavoritesView
          ? favoriteReports.find((item) => item.report.id === report.id)?.module ?? active
          : active;
        const favoriteKey = `${cardModule.id}:${report.id}`;
        const favorite = isFavorite(favoriteKey);
        const scheduledCount = schedules.filter(
          (schedule) => schedule.moduleId === cardModule.id && schedule.reportId === report.id,
        ).length;
        const customRoute = REPORT_ROUTES[cardModule.id]?.[report.id];
        const targetRoute = customRoute ?? `/reports/${cardModule.id}/${report.id}`;
        const freqTone =
          report.frequency === "Daily"
            ? "bg-primary"
            : report.frequency === "Weekly"
              ? "bg-info"
              : report.frequency === "Monthly"
                ? "bg-warning"
                : "bg-muted-foreground/40";
        const freqText =
          report.frequency === "Daily"
            ? "text-primary"
            : report.frequency === "Weekly"
              ? "text-info"
              : report.frequency === "Monthly"
                ? "text-warning-foreground"
                : "text-muted-foreground";
        const sequence = String(index + 1).padStart(2, "0");

        return (
          <div
            key={`${cardModule.id}-${report.id}`}
            role="button"
            tabIndex={0}
            title={report.description}
            onClick={() => navigateTo(targetRoute)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigateTo(targetRoute);
              }
            }}
            className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.18)] cursor-pointer"
          >
            <div className="relative h-16 bg-gradient-to-br from-muted/40 to-muted/10 border-b border-border/60 overflow-hidden">
              <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-[3px] ${freqTone}`} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-end gap-[3px] px-3 pb-2 h-full pointer-events-none">
                {Array.from({ length: 9 }).map((_, barIndex) => {
                  const seed = (report.id.charCodeAt(barIndex % report.id.length) + barIndex * 13) % 100;
                  const height = 18 + (seed % 28);

                  return (
                    <span
                      key={barIndex}
                      className={`w-[3px] rounded-sm ${freqTone} opacity-25 group-hover:opacity-60 transition-opacity`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              <span className={`absolute left-3 top-3 h-8 w-8 grid place-items-center rounded-md bg-card border border-border shadow-sm ${freqText}`}>
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span aria-hidden className="absolute -right-3 -top-2 text-[44px] font-black leading-none tabular-nums text-foreground/[0.06] select-none tracking-tighter">
                {sequence}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(favoriteKey);
                }}
                title={favorite ? "Unpin" : "Pin to favorites"}
                className={`absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded transition-all ${
                  favorite
                    ? "text-warning opacity-100"
                    : "text-muted-foreground/50 hover:text-warning opacity-0 group-hover:opacity-100"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${favorite ? "fill-warning" : ""}`} strokeWidth={2} />
              </button>
            </div>

            <div className="relative px-3 py-2.5 flex flex-col gap-1.5">
              <h3 className="font-semibold text-[12.5px] text-foreground tracking-tight leading-snug line-clamp-2 min-h-[2.2em]">
                {report.name}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground/70 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${freqTone}`} />
                  <span className="truncate">{report.frequency}</span>
                </div>
                {(isFavoritesView || scheduledCount > 0) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {isFavoritesView && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[80px]">
                        {cardModule.label}
                      </span>
                    )}
                    {scheduledCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-success/15 text-success">
                        <CalendarClock className="h-2.5 w-2.5" /> {scheduledCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <span
              aria-hidden
              className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            />
          </div>
        );
      })}
    </div>
  );
}
