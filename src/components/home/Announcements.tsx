import { ArrowUpRight, Megaphone, Pin } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/Section";
import type { Announcement, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import type { PageCopy } from "@/lib/schema/page-copy";
import { formatDate } from "@/lib/format";

const TONE = { info: "azure", important: "blush", success: "mint" } as const;

function Item({ a, c }: { a: Announcement; c: PageCopy["homeNews"] }) {
  const kind = a.tone in TONE ? a.tone : "info";
  const t = { tone: TONE[kind], label: c[kind] };
  const external = /^https?:/.test(a.linkUrl);
  return (
    <article data-glow="" className="relative rounded-2xl border border-border bg-surface p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone={t.tone} size="xs" dot>
          {t.label}
        </Badge>
        {a.date ? (
          <time dateTime={a.date} className="font-semibold text-subtle">
            {formatDate(a.date, { day: "numeric", month: "short", year: "numeric" })}
          </time>
        ) : null}
        {a.pinned ? (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-subtle">
            <Pin size={13} aria-hidden /> {c.pinned}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-fg">{a.title}</h3>
      {a.body ? <RichText text={a.body} className="mt-2 text-[15px] text-muted" /> : null}
      {a.linkUrl ? (
        external ? (
          <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="mi-link mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
            {a.linkLabel || c.readMore} <ArrowUpRight size={15} aria-hidden />
          </a>
        ) : (
          <Link href={a.linkUrl} className="mi-link mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
            {a.linkLabel || c.readMore} <ArrowUpRight size={15} aria-hidden />
          </Link>
        )
      ) : null}
    </article>
  );
}

export function Announcements({ s, items }: { s: SiteSettings; items: Announcement[] }) {
  const c = copy(s, "homeNews");
  const shown = items.slice(0, 4);
  const older = items.slice(4);
  return (
    <section id="news" data-edit="home.news" aria-labelledby="news-title" data-tags="stamp" className={`tone-${c.tone} scroll-mt-24 py-12 sm:py-16`}>
      <div className="container-site">
        <div className="card relative overflow-hidden p-6 sm:p-10">
          <div aria-hidden className="wash pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
            <div className="flex flex-col">
              <SectionHeading
                id="news-title"
                eyebrow={c.eyebrow}
                title={c.title}
                description={c.description}
                className="mb-6 sm:mb-6"
              />
              <div className="hidden lg:block">
                <Aura variant="announcements" size={190} interactive bubbleSide="right" />
              </div>
            </div>
            <div className="grid content-start gap-3" aria-live="polite">
              {shown.length ? (
                shown.map((a) => <Item key={a.id} a={a} c={c} />)
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-surface/70 px-6 py-12 text-center">
                  <Aura variant="announcements" size={130} className="lg:hidden" />
                  <span aria-hidden className="hidden h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-ink lg:grid">
                    <Megaphone size={26} />
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold text-fg">{c.emptyTitle}</p>
                  {c.emptyText ? <p className="mt-1 max-w-sm text-muted">{c.emptyText}</p> : null}
                </div>
              )}
              {older.length ? (
                <details className="group rounded-2xl border border-border bg-surface">
                  <summary className="flex items-center justify-between px-5 py-4 font-semibold text-fg">
                    {c.older} ({older.length})
                    <span aria-hidden className="transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <div className="grid gap-3 px-3 pb-3">
                    {older.map((a) => (
                      <Item key={a.id} a={a} c={c} />
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
