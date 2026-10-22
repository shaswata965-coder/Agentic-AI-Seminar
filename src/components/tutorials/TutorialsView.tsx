"use client";

import { ArrowUpRight, BookOpen, CircleCheck, Clock, KeyRound, Laptop, Link2, Package, Presentation, Users } from "lucide-react";
import { useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { Img } from "@/components/ui/Img";
import { RichText } from "@/components/ui/RichText";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { cn } from "@/lib/cn";
import { replaceQuery, useUrlParam } from "@/lib/client-hooks";
import { currentThemeKey, LEVEL_META, THEME_KEYS, THEME_META, type ThemeKey } from "@/lib/content/constants";
import type { Demo, Tutorial } from "@/lib/content/types";

function prereqIcon(text: string) {
  if (/laptop|computer|machine/i.test(text)) return Laptop;
  if (/account|log ?in|sign ?up|api key|key|token|credential/i.test(text)) return KeyRound;
  if (/python|install|software|docker|node|conda|vs ?code|library|package|pip|jupyter/i.test(text)) return Package;
  return CircleCheck;
}
function materialIcon(url: string, label: string) {
  if (/github\.com/i.test(url)) return GitHubIcon;
  if (/slide|deck|pdf/i.test(`${label} ${url}`)) return Presentation;
  if (/colab|notebook|docs|guide/i.test(`${label} ${url}`)) return BookOpen;
  return Link2;
}

export function TutorialsView({ tutorials, demos }: { tutorials: Tutorial[]; demos: Demo[] }) {
  // An old link's earlier theme key ("entrepreneurship") filters by the current one.
  const urlTheme = currentThemeKey(useUrlParam("theme") ?? "");
  const [choice, setTheme] = useState<ThemeKey | "all" | null>(null);
  const theme = choice ?? (urlTheme && (THEME_KEYS as readonly string[]).includes(urlTheme) ? (urlTheme as ThemeKey) : "all");
  const choose = (t: ThemeKey | "all") => {
    setTheme(t);
    replaceQuery((p) => (t === "all" ? p.delete("theme") : p.set("theme", t)));
  };
  const tShown = tutorials.filter((t) => theme === "all" || t.theme === theme);
  const dShown = demos.filter((d) => theme === "all" || d.theme === theme);
  const themes = THEME_KEYS.filter((k) => [...tutorials, ...demos].some((x) => x.theme === k));

  return (
    <div>
      {themes.length > 1 ? (
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by theme">
          {(["all", ...themes] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => choose(t)}
              data-ripple=""
              className={cn(
                t === "all" ? "tone-mint" : `tone-${THEME_META[t].tone}`,
                "key key-sm rounded-[0.7rem] border px-4 py-2 text-sm font-semibold",
                theme === t ? "bg-accent-soft text-accent-ink border-[color-mix(in_oklab,var(--accent)_55%,transparent)] [--key-edge:color-mix(in_oklab,var(--accent)_70%,var(--accent-ink))]" : "key-line border-border bg-surface text-muted hover:text-fg",
              )}
            >
              {t === "all" ? "All themes" : THEME_META[t].short}
            </button>
          ))}
        </div>
      ) : null}

      <section id="tutorials" aria-labelledby="tutorials-title" className="scroll-mt-28">
        <h2 id="tutorials-title" className="font-display text-3xl font-bold text-fg">
          Tutorials
        </h2>
        {tShown.length ? (
          <ul className="mt-6 grid gap-5 lg:grid-cols-2">
            {tShown.map((t) => {
              const level = LEVEL_META[t.level] ?? LEVEL_META.all;
              const th = THEME_META[t.theme] ?? THEME_META.general;
              return (
                <li key={t.id} id={t.slug || t.id} data-glow="" className={`tone-${th.tone} card scroll-mt-28 p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg sm:p-7`}>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={level.tone} size="xs" dot>
                      {level.label}
                    </Badge>
                    {t.theme !== "general" ? (
                      <Badge tone={th.tone} size="xs">
                        {th.short}
                      </Badge>
                    ) : null}
                    {t.duration ? (
                      <Badge tone="neutral" size="xs">
                        <Clock size={12} aria-hidden /> {t.duration}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-fg">{t.title}</h3>
                  {t.schedule ? <p className="mt-1 text-sm font-semibold text-subtle">{t.schedule}</p> : null}
                  {t.instructors.length ? (
                    <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                      <Users size={16} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
                      <span>
                        {t.instructors.map((i, k) => (
                          <span key={k}>
                            {k ? ", " : ""}
                            {i.url ? (
                              <a href={i.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-fg underline decoration-border-strong underline-offset-2 hover:decoration-brand hover:underline-offset-4">
                                {i.name}
                              </a>
                            ) : (
                              <span className="font-semibold text-fg">{i.name}</span>
                            )}
                            {i.affiliation ? <span className="text-subtle"> ({i.affiliation})</span> : null}
                          </span>
                        ))}
                      </span>
                    </p>
                  ) : null}
                  <RichText text={t.description} className="mt-4 text-[15px] leading-relaxed text-muted" />
                  {t.prerequisites.length ? (
                    <div className="mt-5 rounded-2xl bg-accent-soft p-4">
                      <p className="text-xs font-bold tracking-[0.14em] text-accent-ink uppercase">Before you come</p>
                      <ul className="mt-2 grid gap-1.5">
                        {t.prerequisites.map((p, k) => {
                          const Icon = prereqIcon(p);
                          return (
                            <li key={k} className="flex items-start gap-2 text-sm text-fg">
                              <Icon size={16} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                              {p}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                  {t.materials.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {t.materials.map((m, k) => {
                        const Icon = materialIcon(m.url, m.label);
                        return (
                          <li key={k}>
                            <a href={m.url} target="_blank" rel="noopener noreferrer" data-ripple="" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-muted transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
                              <span className="btn-ico-l">
                                <Icon size={15} aria-hidden />
                              </span>{" "}
                              {m.label}{" "}
                              <span className="btn-ico-r">
                                <ArrowUpRight size={13} aria-hidden />
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  {t.capacity ? <p className="mt-4 text-xs font-semibold text-subtle">Capacity: {t.capacity}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card mt-6 flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
            <Aura variant="tutorials" size={150} />
            <div>
              <p className="font-display text-xl font-semibold text-fg">{tutorials.length ? "No tutorials for this theme yet" : "Tutorial line-up coming soon"}</p>
              <p className="mt-1 max-w-lg text-muted">Titles, instructors, prerequisites (laptop, software, accounts) and material links will be published here.</p>
            </div>
          </div>
        )}
      </section>

      <section id="demos" aria-labelledby="demos-title" className="mt-20 scroll-mt-28">
        <h2 id="demos-title" className="font-display text-3xl font-bold text-fg">
          Live demos
        </h2>
        {dShown.length ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dShown.map((d) => {
              const th = THEME_META[d.theme] ?? THEME_META.general;
              return (
                <li key={d.id} data-glow="" className={`tone-${th.tone} card group flex flex-col overflow-hidden transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
                  <div className="p-3 pb-0">
                    {d.videoUrl ? (
                      <VideoEmbed url={d.videoUrl} title={d.title} />
                    ) : d.image ? (
                      <Img src={d.image} alt={d.title} className="aspect-video w-full rounded-2xl object-cover transition-[scale] duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-soft),var(--surface-2))]">
                        <Aura variant="demos" size={110} lite />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {d.theme !== "general" ? (
                      <Badge tone={th.tone} size="xs" className="self-start">
                        {th.short}
                      </Badge>
                    ) : null}
                    <h3 className="mt-2 font-display text-lg font-semibold text-fg">{d.title}</h3>
                    {d.team ? <p className="text-sm font-semibold text-subtle">{d.team}</p> : null}
                    <p className="mt-2 text-sm text-muted">{d.description}</p>
                    {d.link ? (
                      <a href={d.link} target="_blank" rel="noopener noreferrer" className="group/visit mt-auto inline-flex items-center gap-1 self-start pt-4 text-sm font-semibold text-accent-ink">
                        <span className="mi-underline">Project link</span>
                        <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5" />
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card mt-6 flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
            <Aura variant="demos" size={150} />
            <div>
              <p className="font-display text-xl font-semibold text-fg">{demos.length ? "No demos for this theme yet" : "Demo list coming soon"}</p>
              <p className="mt-1 max-w-lg text-muted">Teams and companies demoing agents live at the workshop will be listed here with images and videos.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
