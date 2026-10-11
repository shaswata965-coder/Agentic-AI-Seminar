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
                "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-[background-color,color,box-shadow,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                done
                  ? "bg-[var(--mint)] text-[#0f172a]"
                  : on
                    ? "scale-110 bg-brand text-brand-fg shadow-[0_0_0_6px_color-mix(in_oklab,var(--brand)_16%,transparent)]"
                    : "bg-surface-2 text-subtle ring-1 ring-border",
              )}
            >
              {done ? <Check size={17} aria-hidden className="animate-pop" /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-semibold sm:inline", on ? "text-fg" : "text-subtle")}>{label}</span>
            {i < steps.length - 1 ? (
              <span aria-hidden className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <span className={cn("block h-full origin-left rounded-full bg-[var(--mint)] transition-[scale] duration-500 ease-out", done ? "scale-x-100" : "scale-x-0")} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
