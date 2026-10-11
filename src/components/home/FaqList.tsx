"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/cn";
import { FAQ_CATEGORY_META } from "@/lib/content/constants";
import type { Faq } from "@/lib/content/types";

/** Searchable FAQ accordion. Aura switches from "thinking" to "aha!" when an answer is open. */
export function FaqList({ faqs, showAura = true }: { faqs: Faq[]; showAura?: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const cats = useMemo(() => Array.from(new Set(faqs.map((f) => f.category))).filter(Boolean), [faqs]);
  const shown = faqs.filter((f) => {
    if (cat !== "all" && f.category !== cat) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return f.question.toLowerCase().includes(needle) || f.answer.toLowerCase().includes(needle);
  });

  return (
    <div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="relative block">
            <span className="sr-only">Search questions</span>
            <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions…"
              className="h-12 w-full rounded-full border border-border bg-surface pr-4 pl-11 text-[15px] focus:border-brand focus:ring-4 focus:ring-[color-mix(in_oklab,var(--brand)_18%,transparent)] focus:outline-none"
            />
          </label>
          {cats.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {["all", ...cats].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  data-ripple=""
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5",
                    cat === c ? "bg-accent-soft text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : "bg-surface text-muted ring-1 ring-border hover:text-fg",
                  )}
                >
                  {c === "all" ? "All" : (FAQ_CATEGORY_META[c as keyof typeof FAQ_CATEGORY_META] ?? c)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {showAura ? (
          <div className="hidden shrink-0 sm:block">
            <Aura variant={openId ? "answer" : "faq"} size={110} lite />
          </div>
        ) : null}
      </div>

      <ul className="mt-6 grid gap-3">
        {shown.map((f) => (
          <li key={f.id}>
            <details
              data-glow=""
              className="group rounded-2xl border border-border bg-surface transition-[box-shadow,border-color] hover:border-border-strong open:shadow-card"
              onToggle={(e) => {
                const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                setOpenId((cur) => (isOpen ? f.id : cur === f.id ? null : cur));
              }}
            >
              <summary className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-display text-[17px] font-semibold text-fg">
                {f.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition-transform duration-300 group-open:rotate-180 group-open:bg-accent-soft group-open:text-accent-ink">
                  <ChevronDown size={18} aria-hidden />
                </span>
              </summary>
              <div className="px-5 pb-5">
                <RichText text={f.answer} className="text-[15px] leading-relaxed text-muted" />
              </div>
            </details>
          </li>
        ))}
      </ul>
      {!shown.length ? <p className="mt-6 rounded-2xl border border-dashed border-border-strong p-6 text-center text-muted">No questions match “{q}”. Try the contact form instead.</p> : null}
    </div>
  );
}
