import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const EmployeesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/hr").then((m) => m.employeesConfig));
export const SalesTeamPage = createLegacyEntityRoutePage(() => import("@/lib/entities/sales").then((m) => m.salesTeamConfig));
export const ShiftsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/hr").then((m) => m.shiftsConfig));
export const HolidayCalendarPage = createLegacyEntityRoutePage(() => import("@/lib/entities/hr").then((m) => m.holidayCalendarConfig));
export const HrSettingsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/hr").then((m) => m.hrSettingsConfig));
