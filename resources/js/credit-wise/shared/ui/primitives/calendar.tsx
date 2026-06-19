"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/helpers/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3 pointer-events-auto rdp-qistify", className)}
      captionLayout="dropdown"
      navLayout="around"
      startMonth={new Date(1950, 0)}
      endMonth={new Date(new Date().getFullYear() + 10, 11)}
      classNames={{
        month_caption: "mb-2 flex items-center justify-center gap-2",
        caption_label: "sr-only",
        dropdowns: "mb-2 flex items-center justify-center gap-2",
        dropdown_root: "relative inline-flex items-center",
        dropdown: "h-8 rounded-md border border-slate-200 bg-white px-2 pr-8 text-xs font-medium text-slate-700 shadow-none outline-none",
        months_dropdown: "h-8 rounded-md border border-slate-200 bg-white px-2 pr-8 text-xs font-medium text-slate-700 shadow-none outline-none",
        years_dropdown: "h-8 rounded-md border border-slate-200 bg-white px-2 pr-8 text-xs font-medium text-slate-700 shadow-none outline-none",
        chevron: "h-4 w-4 text-slate-500",
        previous_month_button: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40",
        next_month_button: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40",
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
