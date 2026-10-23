import { ArrowRight, Clock } from "lucide-react";
import type { CSSProperties } from "react";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SESSION_TYPE_META, THEME_META, type SessionType } from "@/lib/content/constants";
import type { Session, SiteSettings } from "@/lib/content/types";
import { copy, plural } from "@/lib/copy";
import { eventDays, hackathonShown } from "@/lib/event";
import { eventDayLabel, formatDate, timeRange } from "@/lib/format";

/** The session formats explained on the page, and where to read more about each. */
const FORMATS: { type: SessionType & ("keynote" | "talk" | "panel" | "tutorial" | "demo" | "hackathon"); href?: string }[] = [
  { type: "keynote" },
  { type: "talk", href: "/speakers" },
  { type: "panel", href: "/speakers#panels" },
  { type: "tutorial", href: "/tutorials" },
  { type: "demo", href: "/tutorials#demos" },
  { type: "hackathon", href: "#hackathon" },
];

const hhmm = (d: Date) => formatDate(d.toISOString(), { hour: "2-digit", minute: "2-digit", hour12: false });

/** The programme in numbers: each day, the session formats and the themes, before the full schedule. */
export function ProgrammeOverview({ s, sessions, tba }: { s: SiteSettings; sessions: Session[]; tba: boolean }) {
  const shown = tba ? [] : sessions;
  const talks = shown.filter((x) => x.type !== "break");
  const days = eventDays(s).map((d) => {
    const list = shown.filter((x) => String(x.day) === String(d.day));
    const starts = list.map((x) => x.start).filter(Boolean).sort();
    const ends = list.map((x) => x.end || x.start).filter(Boolean).sort();
    return {
      day: d.day,
      label: eventDayLabel(s.startDate, d.day, { weekday: "long", day: "numeric", month: "long" }),
      hours: starts.length ? timeRange(starts[0], ends.at(-1)) : timeRange(hhmm(d.start), hhmm(d.end)),
      count: list.filter((x) => x.type !== "break").length,
      types: [...new Set(list.map((x) => x.type))].filter((t) => t !== "break" && t !== "other"),
    };
  });
  const count = (type: SessionType) => talks.filter((x) => x.type === type).length;
  const c = copy(s, "programmeOverview", { days: plural(days.length, "day"), sessions: plural(talks.length, "session") });

  return (
    <Section id="overview" edit="programme.overview" tone={c.tone} bg={c.background} labelledBy="overview-title">
      <SectionHeading
        id="overview-title"
        eyebrow={c.eyebrow}
        title={talks.length ? c.titleWithSessions : c.title}
        description={c.description ? <p>{c.description}</p> : undefined}
        className="mb-8 sm:mb-10"
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <ol className="grid content-start gap-4">
          {days.map((d, i) => (
            <li key={d.day} data-reveal style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties} className={`tone-${i % 2 ? "lilac" : "azure"} card relative flex gap-5 overflow-hidden p-5 sm:p-6`}>
              <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]" />
              <p className="font-display text-5xl leading-none font-extrabold text-accent-ink tabular sm:text-6xl">{String(d.day).padStart(2, "0")}</p>
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">{c.day ? `${c.day} ${d.day}` : d.day}</p>
                <h3 className="mt-1 font-display text-xl font-semibold text-fg">{d.label}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5 tabular">
                    <Clock size={14} aria-hidden className="text-accent-ink" />
                    {d.hours} IST
                  </span>
                  <span>{d.count ? plural(d.count, "session") : c.noSessions}</span>
                </p>
                {d.types.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {d.types.map((t) => (
                      <li key={t}>
                        <Badge tone={SESSION_TYPE_META[t].tone} size="xs">
                          {SESSION_TYPE_META[t].label}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div>
          <h3 className="font-mono text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">{c.formats}</h3>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {FORMATS.filter((f) => f.type !== "hackathon" || hackathonShown(s)).map((f) => {
              const meta = SESSION_TYPE_META[f.type];
              const n = count(f.type);
              const body = (
                <>
                  <span className="w-full shrink-0 sm:w-[7.5rem]">
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-muted">{c[f.type]}</span>
                  {n ? <span className="shrink-0 font-display text-lg font-bold text-fg tabular">{n}</span> : null}
                  {f.href ? <ArrowRight size={16} aria-hidden className="shrink-0 text-subtle transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-ink" /> : <span aria-hidden className="w-4 shrink-0" />}
                </>
              );
              const cls = `tone-${meta.tone} group flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 sm:flex-nowrap sm:gap-4 sm:px-5`;
              return (
                <li key={f.type}>
                  {f.href ? (
                    <a href={f.href} className={`${cls} transition-colors hover:bg-accent-soft`}>
                      {body}
                    </a>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {s.themes.length ? (
        <div className="mt-12">
          <h3 className="font-mono text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">{c.themes}</h3>
          <ul className="mt-3 grid gap-4 md:grid-cols-3">
            {s.themes.map((t, i) => {
              const meta = THEME_META[t.key] ?? THEME_META.general;
              const n = talks.filter((x) => x.theme === t.key).length;
              return (
                <li key={t.key} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties} className={`tone-${meta.tone} card flex items-center gap-4 p-4`}>
                  <Aura variant={meta.aura} size={64} lite />
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-fg">{t.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{n ? plural(n, "session") : c.noSessions}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
