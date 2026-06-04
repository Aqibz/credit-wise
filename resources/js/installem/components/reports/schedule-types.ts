// Lightweight type + utility module split out of ScheduleDialog so route
// bundles can import the type/util without pulling the dialog UI chunk.

export type ReportSchedule = {
  id: string;
  reportId: string;
  reportName: string;
  moduleId: string;
  moduleLabel: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  dayOfWeek?: string;
  dayOfMonth?: number;
  time: string;
  channels: ("Email" | "SMS" | "WhatsApp")[];
  recipients: string;
  branch: string;
  period: string;
  status: "Active" | "Paused";
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function computeNextRun(
  s: Pick<ReportSchedule, "frequency" | "dayOfWeek" | "dayOfMonth" | "time">
): string {
  const now = new Date();
  const [hh, mm] = (s.time || "09:00").split(":").map((x) => Number(x) || 0);
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(hh, mm, 0, 0);

  if (s.frequency === "Daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (s.frequency === "Weekly") {
    const target = DAYS.indexOf(s.dayOfWeek || "Mon");
    const cur = (now.getDay() + 6) % 7;
    let diff = (target - cur + 7) % 7;
    if (diff === 0 && next <= now) diff = 7;
    next.setDate(now.getDate() + diff);
  } else {
    const dom = Math.min(28, Math.max(1, s.dayOfMonth || 1));
    next.setDate(dom);
    if (next <= now) {
      const monthsAdvance = s.frequency === "Quarterly" ? 3 : 1;
      next.setMonth(next.getMonth() + monthsAdvance);
    }
  }
  return next.toISOString();
}

export function buildSchedule(
  input: Omit<ReportSchedule, "id" | "createdAt" | "nextRun" | "status"> & {
    status?: ReportSchedule["status"];
  }
): Omit<ReportSchedule, "id"> {
  return {
    ...input,
    status: input.status ?? "Active",
    nextRun: computeNextRun(input),
    createdAt: new Date().toISOString(),
  };
}

export function recomputeNextRun(s: ReportSchedule): string {
  return computeNextRun(s);
}
