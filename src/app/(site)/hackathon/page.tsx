import { ArrowDown, ArrowUp, ArrowUpRight, CalendarDays, CircleCheck, ExternalLink, GraduationCap, Laptop, MapPin, ScrollText, ShieldCheck, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { Deadline } from "@/components/forms/Deadline";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { HackathonForm } from "@/components/forms/HackathonForm";
import { HackathonPrizes } from "@/components/hackathon/Prizes";
import { Ones } from "@/components/hackathon/OneQuestion";
import { HackathonTimeline } from "@/components/hackathon/Timeline";
import { FaqList } from "@/components/home/FaqList";
import { InOrder } from "@/components/layout/InOrder";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { RichText } from "@/components/ui/RichText";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { THEME_META } from "@/lib/content/constants";
import { getFaqs, getHackathon, getPeople, getSettings, inPreview } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { venueLine } from "@/lib/event";
import { formatDateRange, formatDateTime } from "@/lib/format";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/paths";
import { sectionOrder } from "@/lib/schema/section-order";

export async function generateMetadata(): Promise<Metadata> {
  const h = await getHackathon();
  return {
    title: "Hackathon",
    description: `${h.title}: ${h.tagline} The question, who can join, dates, location, prize money, timeline and team registration.`,
    alternates: { canonical: absoluteUrl("/hackathon") },
  };
}

const PRIZE_TONES = ["butter", "azure", "peach", "lilac", "mint", "blush"] as const;

export default async function HackathonPage() {
  const [s, h, people, faqs, preview] = await Promise.all([getSettings(), getHackathon(), getPeople(), getFaqs(), inPreview()]);
  const mentors = people.filter((p) => p.group === "mentor");
  const judges = people.filter((p) => p.group === "judge");
  const hackFaqs = faqs.filter((f) => f.category === "hackathon");
  // Teams register in the Registration section below, or on an external platform when one is set.
  const external = Boolean(s.hackathonUrl);
  const registerHref = s.hackathonUrl || "#register";
  const hero = copy(s, "hackathonHero", { platform: s.hackathonPlatform || "the platform" });
  const ov = copy(s, "hackathonOverview");
  const tr = copy(s, "hackathonTracks");
  const tl = copy(s, "hackathonTimeline");
  const pr = copy(s, "hackathonPrizes");
  const rf = copy(s, "hackathonRegisterForm", { platform: s.hackathonPlatform || "our hackathon platform" });
  const jd = copy(s, "hackathonJudging");
  const pe = copy(s, "hackathonPeople");
  const ru = copy(s, "hackathonRules");
  const re = copy(s, "hackathonResults");
  const cta = copy(s, "hackathonCta");
  const registerLabel = external ? hero.registerOn : hero.register;
  const needs = [rf.need1, rf.need2, rf.need3].filter(Boolean);
  const teamForm = <HackathonForm question={h.question} questionNote={rf.formQuestion} teamFields={s.hackathonFields} memberFields={s.hackathonMemberFields} text={copy(s, "hackathonFormText")} />;
  // The link from the form to the question points the way it lies on the page.
  const order = sectionOrder(s, "hackathon");
  const TracksArrow = order.indexOf("tracks") < order.indexOf("register") ? ArrowUp : ArrowDown;
  const closedBadge = (
    <Badge tone="blush" dot>
      {hero.closed}
    </Badge>
  );
  const statusBadge =
    s.hackathonStatus === "open" ? (
      <DeadlineGate deadline={s.hackathonDeadline} closed={closedBadge}>
        <Badge tone="mint" dot>
          {hero.open}
          {s.hackathonDeadline ? ` · ${hero.closes ? `${hero.closes} ` : ""}${formatDateTime(s.hackathonDeadline)} IST` : ""}
        </Badge>
      </DeadlineGate>
    ) : s.hackathonStatus === "closed" ? (
      closedBadge
    ) : (
      <Badge tone="butter" dot>
        {hero.soon}
      </Badge>
    );

  return (
    <TagScope style="tab">
      <JsonLd data={eventJsonLd(s, { "@type": "Event", name: h.title, description: h.tagline, url: absoluteUrl("/hackathon") })} />
      <PageHero edit="hackathon.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={h.title} aura="hackathon" description={h.tagline}>
        <ButtonLink href={registerHref} size="lg" icon={<Trophy size={19} aria-hidden />} iconRight={external ? <ExternalLink size={16} aria-hidden /> : undefined}>
          {registerLabel}
        </ButtonLink>
        {statusBadge}
      </PageHero>

      <InOrder
        s={s}
        page="hackathon"
        sections={{
          overview: (
            <Section id="overview" edit="hackathon.overview" tone={ov.tone} bg={ov.background} labelledBy="overview-title" className="lg:py-10">
              {/* The facts and the prize money side by side, compact enough to fit on one screen. */}
              <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
                <div>
                  {ov.eyebrow ? <Eyebrow>{ov.eyebrow}</Eyebrow> : null}
                  <h2 id="overview-title" className="mt-3 font-display text-3xl font-bold text-fg sm:text-4xl">
                    {ov.title}
                  </h2>
                  <RichText text={h.overview} className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base" />
                  {/* Who can join, with the eligibility rules under it, takes the large tile; the rest fit round it. */}
                  <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {[
                      {
                        label: ov.teamType,
                        value: h.teamType,
                        icon: <GraduationCap size={15} aria-hidden />,
                        tone: "tone-lilac",
                        span: "col-span-2 sm:row-span-2",
                        more: h.eligibility.length ? (
                          <>
                            <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">{ov.eligibility}</p>
                            <ul className="mt-1.5 grid gap-1.5">
                              {h.eligibility.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-muted">
                                  <CircleCheck size={14} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null,
                      },
                      { label: ov.teamSize, value: h.teamSize, icon: <Users size={15} aria-hidden />, tone: "tone-azure" },
                      { label: ov.dates, value: h.dates || formatDateRange(s.startDate, s.endDate), note: ov.datesNote, icon: <CalendarDays size={15} aria-hidden />, tone: "tone-mint" },
                      { label: ov.location, value: h.location || venueLine(s), icon: <MapPin size={15} aria-hidden />, tone: "tone-peach", span: "sm:col-span-2" },
                      { label: ov.mode, value: h.mode, icon: <Laptop size={15} aria-hidden />, tone: "tone-aqua" },
                    ].map((f) => (
                      <div key={f.label} data-glow="" className={`${f.tone} card group p-3.5 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-lg ${f.span ?? ""}`}>
                        <dt className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-soft transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">{f.icon}</span>
                          {f.label}
                        </dt>
                        <dd className="mt-2 font-display text-[15px] leading-snug font-semibold text-fg">{f.value || "TBA"}</dd>
                        {f.note ? <dd className="mt-0.5 text-xs text-muted">{f.note}</dd> : null}
                        {f.more ? <dd className="mt-3 border-t border-border pt-3">{f.more}</dd> : null}
                      </div>
                    ))}
                  </dl>
                </div>
                <div id="prizes" data-edit="hackathon.prizes" className={`tone-${pr.tone} scroll-mt-24`}>
                  <HackathonPrizes prizes={h.prizes} pool={h.prizePool} poolLabel={pr.pool} awardsTitle={pr.awards} eyebrow={pr.eyebrow} title={pr.title} intro={pr.intro} titleId="prizes-title" />
                </div>
              </div>
            </Section>
          ),
          timeline: (
            <Section id="timeline" edit="hackathon.timeline" tone={tl.tone} bg={tl.background} labelledBy="timeline-title">
              <SectionHeading id="timeline-title" eyebrow={tl.eyebrow} title={tl.title} description={tl.description} align="center" />
              <HackathonTimeline items={h.timeline} />
            </Section>
          ),
          register: (
            <Section id="register" edit="hackathon.register" tone={rf.tone} bg={rf.background} labelledBy="register-title">
              <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                  <SectionHeading id="register-title" eyebrow={rf.eyebrow} title={rf.title} description={h.registrationNote} className="mb-6 sm:mb-6" />
                  <div className="flex flex-wrap items-center gap-3">{statusBadge}</div>
                  {s.hackathonDeadline ? (
                    <div className="mt-4">
                      <Deadline iso={s.hackathonDeadline} />
                    </div>
                  ) : null}
                  {needs.length ? (
                    <div className="mt-6 card p-5">
                      <p className="font-display text-lg font-semibold text-fg">{rf.needTitle}</p>
                      <ul className="mt-3 grid gap-2.5">
                        {needs.map((n) => (
                          <li key={n} className="flex items-start gap-2.5 text-[15px] text-muted">
                            <CircleCheck size={18} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {rf.tracksLink && h.question ? (
                    <a href="#challenge" className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
                      <span className="mi-underline">{rf.tracksLink}</span>
                      <TracksArrow size={15} aria-hidden className={`transition-transform duration-300 ${TracksArrow === ArrowUp ? "group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5"}`} />
                    </a>
                  ) : null}
                </div>
                <div>
                  {s.hackathonUrl ? (
                    <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
                      <Aura variant="hackathon" size={160} />
                      <div>
                        <h3 className="font-display text-2xl font-bold text-fg">{rf.externalTitle}</h3>
                        {rf.externalText ? <p className="mt-2 text-muted">{rf.externalText}</p> : null}
                        <div className="mt-5">
                          <ButtonLink href={s.hackathonUrl} size="lg" iconRight={<ExternalLink size={17} aria-hidden />}>
                            {copy(s, "hackathonRegisterForm", { platform: s.hackathonPlatform || "registration" }).externalButton}
                          </ButtonLink>
                        </div>
                      </div>
                    </div>
                  ) : preview ? (
                    // The admin's live preview shows the form whatever the status, so its fields can be edited.
                    teamForm
                  ) : s.hackathonStatus === "open" ? (
                    <DeadlineGate deadline={s.hackathonDeadline} closed={<StatusCard s={s} closed />}>
                      {teamForm}
                    </DeadlineGate>
                  ) : (
                    <StatusCard s={s} closed={s.hackathonStatus === "closed"} />
                  )}
                </div>
              </div>
            </Section>
          ),
          tracks: (
            <Section id="challenge" edit="hackathon.tracks" tone={tr.tone} bg={tr.background} labelledBy="challenge-title">
              <SectionHeading id="challenge-title" eyebrow={tr.eyebrow} title={tr.title} description={tr.description} align="center" />
              {/* One frame for the one hackathon: its name at the top, one line down to its one question. */}
              <div className="relative rounded-[2rem] border border-border bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] p-4 shadow-card-lg sm:p-7">
                <div className="tone-aqua mx-auto flex w-fit max-w-full items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,var(--aqua-soft),var(--lilac-soft))] px-4 py-3 ring-1 ring-border sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-accent-ink shadow-card">
                    <Trophy size={20} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-tight font-bold text-fg">{h.title}</span>
                    {tr.frame ? <span className="block text-sm text-muted">{tr.frame}</span> : null}
                  </span>
                </div>
                <span aria-hidden className="mx-auto block h-6 w-0.5 bg-border-strong" />
                <Ones words={[tr.one1, tr.one2, tr.one3]} className="mx-auto max-w-md" />
                <span aria-hidden className="mx-auto block h-6 w-0.5 bg-border-strong" />
                {h.question ? (
                  <div data-glow="" className="card relative mx-auto max-w-4xl overflow-hidden p-6 sm:p-10">
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_0%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]" />
                    <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                      <Aura variant="faq" size={130} interactive className="shrink-0" />
                      <div className="min-w-0">
                        {tr.questionLabel ? <p className="text-xs font-bold tracking-[0.14em] text-accent-ink uppercase">{tr.questionLabel}</p> : null}
                        <p className="mt-2 font-display text-3xl leading-tight font-extrabold text-fg sm:text-[2.6rem]">“{h.question}”</p>
                        {h.challenge ? <RichText text={h.challenge} className="mt-4 text-[15.5px] leading-relaxed text-muted sm:text-base" /> : null}
                      </div>
                    </div>
                  </div>
                ) : null}
                {h.ideas.length ? (
                  <div className="mx-auto mt-8 max-w-4xl">
                    {tr.ideas ? <h3 className="text-center font-display text-lg font-semibold text-fg">{tr.ideas}</h3> : null}
                    <ul className="mt-4 grid gap-3 md:grid-cols-3">
                      {h.ideas.map((idea, i) => (
                        <li key={i} className="flex gap-2.5 rounded-xl bg-accent-soft p-4 text-sm text-fg">
                          <span className="font-display font-bold text-accent-ink">{i + 1}.</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              {/* The workshop's themes, set apart: they belong to the talks and tutorials, not to the hackathon. */}
              {tr.themesNote ? (
                <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-3 text-center text-sm text-muted sm:flex-row sm:text-left">
                  <ul className="flex shrink-0 flex-wrap justify-center gap-1.5">
                    {s.themes.map((t) => {
                      const meta = THEME_META[t.key] ?? THEME_META.general;
                      return (
                        <li key={t.key}>
                          <Link href={`/programme?theme=${t.key}`} className={`tone-${meta.tone} inline-flex rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_35%,var(--surface))]`}>
                            {meta.short}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <p>{tr.themesNote}</p>
                </div>
              ) : null}
            </Section>
          ),
          judging: h.judgingCriteria.length ? (
            <Section id="judging" edit="hackathon.judging" tone={jd.tone} bg={jd.background} labelledBy="judging-title">
              <SectionHeading id="judging-title" eyebrow={jd.eyebrow} title={jd.title} description={jd.description} />
              <ul className="grid gap-4 md:grid-cols-2">
                {h.judgingCriteria.map((c) => (
                  <li key={c.name} className="card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display text-lg font-semibold text-fg">{c.name}</p>
                      {c.weight !== null && c.weight !== undefined ? <p className="font-display text-xl font-bold text-accent-ink tabular">{c.weight}%</p> : null}
                    </div>
                    {c.weight ? (
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`Weight ${c.weight} percent`}>
                        <div className="grow-bar h-full rounded-full bg-[linear-gradient(90deg,var(--accent),color-mix(in_oklab,var(--accent)_50%,var(--accent-ink)))]" style={{ width: `${Math.min(100, c.weight)}%` }} />
                      </div>
                    ) : null}
                    {c.description ? <p className="mt-3 text-sm text-muted">{c.description}</p> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null,
          people: (
            <Section edit="hackathon.people" tone={pe.tone} bg={pe.background} labelledBy="mentors-title">
              <SectionHeading id="mentors-title" eyebrow={pe.eyebrow} title={pe.title} description={pe.description} />
              {mentors.length || judges.length ? (
                <div className="grid gap-12">
                  {[
                    { title: pe.mentors, label: pe.mentor, list: mentors, tone: "mint" as const },
                    { title: pe.judges, label: pe.judge, list: judges, tone: "lilac" as const },
                  ]
                    .filter((g) => g.list.length)
                    .map((g) => (
                      <div key={g.tone}>
                        <h3 className="font-display text-2xl font-bold text-fg">{g.title}</h3>
                        <ul className="mt-5 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
                          {g.list.map((p) => (
                            <li key={p.id}>
                              <PersonCard name={p.name} photo={p.photo} title={p.role} subtitle={[p.department, p.affiliation].filter(Boolean).join(", ")} label={g.label} labelTone={g.tone} href={p.profileUrl || undefined} className={`tone-${g.tone}`} footer={p.bio ? <p className="mb-2 line-clamp-3 text-sm text-muted">{p.bio}</p> : null} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
                  <Aura variant="guide" size={140} />
                  <div>
                    <p className="font-display text-xl font-semibold text-fg">{pe.emptyTitle}</p>
                    {pe.emptyText ? <p className="mt-1 max-w-lg text-muted">{pe.emptyText}</p> : null}
                  </div>
                </div>
              )}
            </Section>
          ),
          rules: (
            <Section edit="hackathon.rules" tone={ru.tone} bg={ru.background} labelledBy="rules-title">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="card p-6 sm:p-8">
                  <h2 id="rules-title" className="flex items-center gap-2 font-display text-2xl font-bold text-fg">
                    <ScrollText size={22} aria-hidden className="text-accent-ink" /> {ru.rules}
                  </h2>
                  <ol className="mt-4 grid gap-3">
                    {h.rules.map((r, i) => (
                      <li key={i} className="flex gap-3 text-[15px] text-muted">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent-ink">{i + 1}</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="card p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-fg">
                    <ShieldCheck size={22} aria-hidden className="text-accent-ink" /> {ru.conduct}
                  </h2>
                  <RichText text={h.codeOfConduct} className="mt-4 text-[15px] leading-relaxed text-muted" />
                </div>
              </div>
              {hackFaqs.length ? (
                <div className="mt-14">
                  <h2 className="font-display text-3xl font-bold text-fg">{ru.faq}</h2>
                  <div className="mt-6">
                    <FaqList faqs={hackFaqs} showAura={false} />
                  </div>
                </div>
              ) : null}
            </Section>
          ),
          results: s.showWinners ? (
            <Section id="results" edit="hackathon.results" tone={re.tone} bg={re.background} labelledBy="results-title">
              <SectionHeading id="results-title" eyebrow={re.eyebrow} title={re.title} description={h.resultsNote} aside={<Aura variant="trophy" size={150} interactive bubbleSide="left" />} />
              {h.winners.length ? (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {h.winners.map((w, i) => (
                    <li key={`${w.team}-${i}`} data-glow="" className={`tone-${PRIZE_TONES[i % PRIZE_TONES.length]} card p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
                      <Badge tone={PRIZE_TONES[i % PRIZE_TONES.length]} dot>
                        {w.position}
                      </Badge>
                      <p className="mt-3 font-display text-2xl font-bold text-fg">{w.team}</p>
                      {w.project ? <p className="font-semibold text-accent-ink">{w.project}</p> : null}
                      {w.members ? <p className="mt-1 text-sm text-subtle">{w.members}</p> : null}
                      {w.description ? <p className="mt-3 text-sm text-muted">{w.description}</p> : null}
                      {w.link ? (
                        <a href={w.link} target="_blank" rel="noopener noreferrer" className="group/visit mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
                          <span className="mi-underline">{re.project}</span>
                          <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">{re.empty}</p>
              )}
            </Section>
          ) : null,
          cta: (
            <section data-edit="hackathon.cta" className={`tone-${cta.tone} pb-20`}>
              <div className="container-site">
                <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
                  <Aura variant="hackathon" size={150} interactive />
                  <div className="flex-1">
                    <p className="font-display text-2xl font-bold text-fg sm:text-3xl">{cta.title}</p>
                    <p className="mt-2 text-muted">{h.registrationNote}</p>
                  </div>
                  <ButtonLink href={registerHref} size="lg">
                    {registerLabel}
                  </ButtonLink>
                </div>
              </div>
            </section>
          ),
        }}
      />
    </TagScope>
  );
}

/** Shown instead of the form while team registration is not open. */
function StatusCard({ s, closed }: { s: SiteSettings; closed: boolean }) {
  const c = copy(s, "hackathonRegisterForm");
  const text = closed ? c.closedText : c.soonText;
  return (
    <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
      <Aura variant={closed ? "sleep" : "countdown"} size={170} interactive />
      <div>
        <h3 className="font-display text-2xl font-bold text-fg">{closed ? c.closedTitle : c.soonTitle}</h3>
        {text ? <p className="mt-2 max-w-lg text-muted">{text}</p> : null}
      </div>
    </div>
  );
}
