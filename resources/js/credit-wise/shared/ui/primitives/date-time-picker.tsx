"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { format, isValid, parse } from "date-fns";

import { cn } from "@/lib/helpers/utils";
import { getFieldStateClass } from "@/shared/lib/form-validation";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const INPUT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm";
const DISPLAY_DATE_TIME_FORMAT = "dd/MM/yyyy, hh:mm a";
const INPUT_DATE_FORMAT = "yyyy-MM-dd";
const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

function parseDateTimeValue(value?: string) {
  const source = String(value ?? "").trim();
  if (!source) return undefined;

  const candidateFormats = [
    "yyyy-MM-dd HH:mm",
    "yyyy-MM-dd'T'HH:mm",
    "yyyy-MM-dd",
  ];

  for (const candidateFormat of candidateFormats) {
    const parsed = parse(source, candidateFormat, new Date());
    if (isValid(parsed)) {
      if (candidateFormat === "yyyy-MM-dd") {
        parsed.setHours(9, 0, 0, 0);
      }
      return parsed;
    }
  }

  const fallback = new Date(source);
  return isValid(fallback) ? fallback : undefined;
}

function toTimeValue(date?: Date) {
  return date ? format(date, "HH:mm") : "09:00";
}

function applyTime(date: Date, timeValue: string) {
  const [hours, minutes] = timeValue.split(":").map((part) => Number(part || 0));
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  title = "Select date and time",
  description = "Choose both a date and a time.",
  showTime = true,
  className,
  invalid,
  onBlur,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  showTime?: boolean;
  className?: string;
  invalid?: boolean;
  onBlur?: () => void;
}) {
  const parsedValue = useMemo(() => parseDateTimeValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(parsedValue);
  const [draftTime, setDraftTime] = useState(toTimeValue(parsedValue));
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setDraftDate(parsedValue);
      setDraftTime(toTimeValue(parsedValue));
    }
  }, [open, parsedValue]);

  const displayValue = parsedValue ? format(parsedValue, showTime ? DISPLAY_DATE_TIME_FORMAT : DISPLAY_DATE_FORMAT) : "";

  function handleSave() {
    const baseDate = draftDate ?? new Date();
    const next = showTime ? applyTime(baseDate, draftTime) : baseDate;
    onChange(format(next, showTime ? INPUT_DATE_TIME_FORMAT : INPUT_DATE_FORMAT));
    setOpen(false);
    onBlur?.();
  }

  function handleClear() {
    onChange("");
    setOpen(false);
    onBlur?.();
  }

  function handleTimeFieldClick() {
    const input = timeInputRef.current;
    if (!input) return;
    input.focus();
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    pickerInput.showPicker?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-[13px] transition",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          getFieldStateClass(invalid),
          className,
        )}
        aria-invalid={invalid || undefined}
      >
        <span className={displayValue ? "truncate text-[13px] font-normal text-slate-900" : "truncate text-[13px] font-normal text-slate-400"}>
          {displayValue || placeholder}
        </span>
        <span className="ml-3 inline-flex items-center gap-2 text-slate-500">
          {showTime && <Clock className="h-3.5 w-3.5" />}
          <CalendarDays className="h-4 w-4" />
        </span>
      </button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            onBlur?.();
          }
        }}
      >
        <DialogContent className="max-w-sm overflow-hidden bg-white p-0">
          <DialogHeader className="border-b border-slate-200 bg-white px-5 py-3">
            <DialogTitle className="text-base font-semibold text-slate-800">{title}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">{description}</DialogDescription>
          </DialogHeader>

          <div className="bg-white px-3 py-3">
            <Calendar
              mode="single"
              selected={draftDate}
              onSelect={(date) => setDraftDate(date ?? draftDate)}
            />

            {showTime && (
              <div className="px-3 pt-2">
                <label className="mb-1.5 block text-[12px] font-medium text-slate-700">Time</label>
                <button
                  type="button"
                  onClick={handleTimeFieldClick}
                  className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    ref={timeInputRef}
                    type="time"
                    value={draftTime}
                    onChange={(event) => setDraftTime(event.target.value)}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] font-normal text-slate-900 outline-none focus:ring-0"
                  />
                  <Clock className="h-4 w-4 text-slate-800" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white px-5 py-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
