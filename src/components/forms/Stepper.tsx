import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Form progress">
      {steps.map((label, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={on ? "step" : undefined}>
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-300",
                done ? "bg-[var(--mint)] text-[#0f172a]" : on ? "bg-brand text-brand-fg" : "bg-surface-2 text-subtle ring-1 ring-border",
              )}
            >
              {done ? <Check size={17} aria-hidden /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-semibold sm:inline", on ? "text-fg" : "text-subtle")}>{label}</span>
            {i < steps.length - 1 ? <span aria-hidden className={cn("h-0.5 flex-1 rounded-full transition-colors duration-500", done ? "bg-[var(--mint)]" : "bg-border")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
