import { Calendar } from "lucide-react";
import type { ReactNode } from "react";
import type { Role } from "@/lib/state/useCurrentUser";

export function FilterSelect({ icon, value, onChange, options }: { icon: ReactNode; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 pl-9 pr-8 appearance-none rounded-lg border border-border bg-background text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

export function RoleSelect({ roles, value, onChange }: { roles: readonly Role[]; value: Role; onChange: (role: Role) => void }) {
  return (
    <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-[12px] font-bold">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Role)}
        className="bg-transparent text-[12px] font-bold focus:outline-none cursor-pointer"
      >
        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
      </select>
    </label>
  );
}

export function DateInput({ label, value, onChange, min, max }: { label: string; value: string; onChange: (value: string) => void; min?: string; max?: string }) {
  return (
    <label className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-background text-sm font-semibold">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-semibold focus:outline-none"
      />
    </label>
  );
}
