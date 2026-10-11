"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counter;
    setItems((list) => [...list.slice(-2), { id, kind, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => {
          const Icon = t.kind === "success" ? CircleCheck : t.kind === "error" ? CircleAlert : Info;
          return (
            <div
              key={t.id}
              className={cn(
                "mi-toast pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-fg shadow-card-lg",
                t.kind === "success" && "tone-mint",
                t.kind === "error" && "tone-blush",
                t.kind === "info" && "tone-azure",
              )}
            >
              <Icon size={18} className="shrink-0 animate-pop text-accent-ink [animation-delay:140ms]" />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
