"use client";

import { Clock } from "lucide-react";
import { useNow } from "@/components/home/Countdown";

/** "Closes in 12 days" — computed in the browser so the page can be cached. */
export function Deadline({ iso, label = "Registration closes" }: { iso: string; label?: string }) {
  const now = useNow();
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  let text = "";
  if (now !== null) {
    const ms = t - now;
    if (ms <= 0) text = "Deadline passed";
    else {
      const days = Math.floor(ms / 86_400_000);
      const hours = Math.floor((ms % 86_400_000) / 3_600_000);
      text = days > 0 ? `${days} day${days === 1 ? "" : "s"} ${hours} h left` : `${hours} h ${Math.floor((ms % 3_600_000) / 60_000)} min left`;
    }
  }
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(t));
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm">
      <Clock size={16} aria-hidden className="text-subtle" />
      <span className="font-semibold text-fg">
        {label}: {date} IST
      </span>
      {text ? <span className="rounded-full bg-butter-soft px-2 py-0.5 text-xs font-bold text-butter-ink">{text}</span> : null}
    </p>
  );
}
