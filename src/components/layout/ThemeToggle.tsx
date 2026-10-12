"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

const noop = () => () => {};

/** Light/dark switch with a circular "reveal" via the View Transitions API. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      setTheme(next);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) {
      apply();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(apply);
    t.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 560, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "key key-line relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border-strong bg-surface text-fg hover:border-brand hover:text-brand",
        className,
      )}
    >
      <Sun
        size={18}
        aria-hidden
        className={cn("absolute transition-all duration-500", isDark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")}
      />
      <Moon
        size={18}
        aria-hidden
        className={cn("absolute transition-all duration-500", isDark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0")}
      />
    </button>
  );
}
