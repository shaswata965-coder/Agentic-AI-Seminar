import { ArrowUpRight, Award, BookOpen, Cpu, Database, ExternalLink, KeyRound, Medal, ScrollText, ShieldCheck, Trophy, Users, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { HackathonTimeline } from "@/components/hackathon/Timeline";
import { FaqList } from "@/components/home/FaqList";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { RichText } from "@/components/ui/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { THEME_META } from "@/lib/content/constants";
import { getFaqs, getHackathon, getPeople, getSettings } from "@/lib/content/queries";
import { hackathonRegistrationHref } from "@/lib/event";
import { formatDateTime } from "@/lib/format";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const h = await getHackathon();
  return {
    title: "Hackathon",
    description: `${h.title}: ${h.tagline} Problem tracks, timeline, prizes, judging criteria and registration.`,
    alternates: { canonical: absoluteUrl("/hackathon") },
  };
}

const RESOURCE_ICON = { api: KeyRound, dataset: Database, compute: Cpu, tool: Wrench, other: BookOpen } as const;
const PRIZE_TONES = ["butter", "azure", "peach", "lilac", "mint", "blush"] as const;

export default async function HackathonPage() {
  const [s, h, people, faqs] = await Promise.all([getSettings(), getHackathon(), getPeople(), getFaqs()]);
  const mentors = people.filter((p) => p.group === "mentor");
  const judges = people.filter((p) => p.group === "judge");
  const hackFaqs = faqs.filter((f) => f.category === "hackathon");
  const registerHref = hackathonRegistrationHref(s);
  const external = Boolean(s.hackathonUrl);
  const closedBadge = (
    <Badge tone="blush" dot>
      Registration closed
    </Badge>
  );
  const statusBadge =
    s.hackathonStatus === "open" ? (
      <DeadlineGate deadline={s.hackathonDeadline} closed={closedBadge}>
        <Badge tone="mint" dot>
          Registration open{s.hackathonDeadline ? ` · closes ${formatDateTime(s.hackathonDeadline)} IST` : ""}
        </Badge>
      </DeadlineGate>
    ) : s.hackathonStatus === "closed" ? (
      closedBadge
    ) : (
      <Badge tone="butter" dot>
        Registration opens soon
      </Badge>
    );

  return (
    <>
      <JsonLd data={eventJsonLd(s, { "@type": "Event", name: h.title, description: h.tagline, url: absoluteUrl("/hackathon") })} />
      <PageHero tone="aqua" crumb="Hackathon" eyebrow="Hackathon" title={h.title} aura="hackathon" description={<p>{h.tagline}</p>}>
        <ButtonLink href={registerHref} size="lg" icon={<Trophy size={19} aria-hidden />} iconRight={external ? <ExternalLink size={16} aria-hidden /> : undefined}>
          {external ? `Register on ${s.hackathonPlatform || "the platform"}` : "Register your team"}
        </ButtonLink>
        {statusBadge}
      </PageHero>

      <Section tone="aqua" labelledBy="overview-title">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 id="overview-title" className="font-display text-3xl font-bold text-fg">
              Overview
            </h2>
            <RichText text={h.overview} className="mt-4 text-[17px] leading-relaxed text-muted" />
          </div>
          <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Mode", value: h.mode, tone: "tone-azure" },
              { label: "Team size", value: h.teamSize, tone: "tone-lilac" },
              { label: "Prize pool", value: h.prizePool, tone: "tone-butter" },
            ].map((f) => (
              <div key={f.label} className={`${f.tone} rounded-2xl bg-accent-soft p-4`}>
                <dt className="text-xs font-bold tracking-[0.12em] text-accent-ink uppercase">{f.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-fg">{f.value || "TBA"}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-10 card p-6">
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-fg">
            <Users size={20} aria-hidden className="text-aqua-ink" /> Eligibility
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {h.eligibility.map((e, i) => (
              <li key={i} className="rounded-xl bg-surface-2 p-3 text-sm text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="lilac" labelledBy="tracks-title" band>
        <SectionHeading id="tracks-title" eyebrow="Problem tracks" title="Pick a track aligned with the workshop themes" description="Final problem statements will be announced at launch — here are examples to get you thinking." />
        <ul className="grid gap-5 lg:grid-cols-3">
          {h.tracks.map((t) => {
            const meta = THEME_META[t.theme] ?? THEME_META.general;
            return (
              <li key={t.title} id={`track-${t.theme}`} className={`tone-${meta.tone} card scroll-mt-28 p-6`} data-reveal>
                <div className="flex items-center gap-3">
                  <Aura variant={meta.aura} size={76} lite />
                  <div>
                    <Badge tone={meta.tone} size="xs">
                      {meta.short}
                    </Badge>
                    <h3 className="mt-1 font-display text-xl font-semibold text-fg">{t.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-[15px] text-muted">{t.description}</p>
                {t.problems.length ? (
                  <ul className="mt-4 grid gap-2">
                    {t.problems.map((p, i) => (
                      <li key={i} className="flex gap-2 rounded-xl bg-accent-soft p-3 text-sm text-fg">
                        <span className="font-display font-bold text-accent-ink">{i + 1}.</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="mint" labelledBy="timeline-title">
        <SectionHeading id="timeline-title" eyebrow="Timeline" title="From registration to the final round" description="Dates will be announced soon. The final round takes place live at the workshop." />
        <HackathonTimeline items={h.timeline} />
      </Section>

      <Section tone="butter" labelledBy="prizes-title" band>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="prizes-title" eyebrow="Prizes" title="Prizes & recognition" description={`Total prize pool: ${h.prizePool || "TBA"}`} className="mb-8 sm:mb-8" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {h.prizes.map((p, i) => (
                <li key={`${p.place}-${i}`} className={`tone-${PRIZE_TONES[i % PRIZE_TONES.length]} card flex items-start gap-4 p-5`} data-reveal>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink">{i === 0 ? <Trophy size={22} aria-hidden /> : i < 3 ? <Medal size={22} aria-hidden /> : <Award size={22} aria-hidden />}</span>
                  <div>
                    <p className="font-display text-lg font-semibold text-fg">{p.place}</p>
                    <p className="text-sm font-bold text-accent-ink">{p.reward || "TBA"}</p>
                    {p.description ? <p className="mt-1 text-sm text-muted">{p.description}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 hidden lg:block">
              <Aura variant="trophy" size={150} interactive />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Judging" title="How projects are judged" description="Indicative criteria — final weights will be confirmed with the rules." className="mb-8 sm:mb-8" />
            <ul className="grid gap-4">
              {h.judgingCriteria.map((c) => (
                <li key={c.name} className="card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-fg">{c.name}</p>
                    {c.weight !== null && c.weight !== undefined ? <p className="font-display text-xl font-bold text-butter-ink tabular">{c.weight}%</p> : null}
                  </div>
                  {c.weight ? (
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`Weight ${c.weight} percent`}>
                      <div className="grow-bar h-full rounded-full bg-[linear-gradient(90deg,var(--butter),var(--peach))]" style={{ width: `${Math.min(100, c.weight)}%` }} />
                    </div>
                  ) : null}
                  {c.description ? <p className="mt-3 text-sm text-muted">{c.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="peach" labelledBy="mentors-title">
        <SectionHeading id="mentors-title" eyebrow="People" title="Mentors & judges" description="Experts from academia and industry who will guide teams and evaluate projects." />
        {mentors.length || judges.length ? (
          <div className="grid gap-12">
            {[
              { title: "Mentors", list: mentors, tone: "mint" as const },
              { title: "Judges", list: judges, tone: "lilac" as const },
            ]
              .filter((g) => g.list.length)
              .map((g) => (
                <div key={g.title}>
                  <h3 className="font-display text-2xl font-bold text-fg">{g.title}</h3>
                  <ul className="mt-5 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
                    {g.list.map((p) => (
                      <li key={p.id}>
                        <PersonCard name={p.name} photo={p.photo} title={p.role} subtitle={[p.department, p.affiliation].filter(Boolean).join(", ")} label={g.title.slice(0, -1)} labelTone={g.tone} href={p.profileUrl || undefined} className={`tone-${g.tone}`} footer={p.bio ? <p className="mb-2 line-clamp-3 text-sm text-muted">{p.bio}</p> : null} />
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
              <p className="font-display text-xl font-semibold text-fg">Mentors and judges will be announced soon</p>
              <p className="mt-1 max-w-lg text-muted">They will be listed here with the same profile cards as our speakers.</p>
            </div>
          </div>
        )}
      </Section>

      <Section tone="azure" labelledBy="resources-title" band>
        <SectionHeading id="resources-title" eyebrow="Resources" title="APIs, datasets & compute" description="Resources available to registered teams." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {h.resources.map((r, i) => {
            const Icon = RESOURCE_ICON[r.kind as keyof typeof RESOURCE_ICON] ?? BookOpen;
            return (
              <li key={`${r.title}-${i}`} className="card flex flex-col p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                  <Icon size={22} aria-hidden />
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-fg">{r.title}</p>
                <p className="mt-1 text-sm text-muted">{r.description}</p>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent-ink hover:underline">
                    Open <ArrowUpRight size={15} aria-hidden />
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="blush" labelledBy="rules-title">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 id="rules-title" className="flex items-center gap-2 font-display text-2xl font-bold text-fg">
              <ScrollText size={22} aria-hidden className="text-blush-ink" /> Rules
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
              <ShieldCheck size={22} aria-hidden className="text-blush-ink" /> Code of conduct
            </h2>
            <RichText text={h.codeOfConduct} className="mt-4 text-[15px] leading-relaxed text-muted" />
          </div>
        </div>
        {hackFaqs.length ? (
          <div className="mt-14">
            <h2 className="font-display text-3xl font-bold text-fg">Hackathon FAQ</h2>
            <div className="mt-6">
              <FaqList faqs={hackFaqs} showAura={false} />
            </div>
          </div>
        ) : null}
      </Section>

      {s.showWinners ? (
        <Section id="results" tone="butter" labelledBy="results-title" wash>
          <SectionHeading id="results-title" eyebrow="Results" title="Hackathon winners" description={h.resultsNote} aside={<Aura variant="trophy" size={150} interactive bubbleSide="left" />} />
          {h.winners.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {h.winners.map((w, i) => (
                <li key={`${w.team}-${i}`} className={`tone-${PRIZE_TONES[i % PRIZE_TONES.length]} card p-6`}>
                  <Badge tone={PRIZE_TONES[i % PRIZE_TONES.length]} dot>
                    {w.position}
                  </Badge>
                  <p className="mt-3 font-display text-2xl font-bold text-fg">{w.team}</p>
                  {w.project ? <p className="font-semibold text-accent-ink">{w.project}</p> : null}
                  {w.members ? <p className="mt-1 text-sm text-subtle">{w.members}</p> : null}
                  {w.description ? <p className="mt-3 text-sm text-muted">{w.description}</p> : null}
                  {w.link ? (
                    <a href={w.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink hover:underline">
                      View project <ArrowUpRight size={15} aria-hidden />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Results will be published here after the final round.</p>
          )}
        </Section>
      ) : null}

      <section className="tone-aqua pb-20">
        <div className="container-site">
          <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
            <Aura variant="hackathon" size={150} interactive />
            <div className="flex-1">
              <p className="font-display text-2xl font-bold text-fg sm:text-3xl">Ready to build?</p>
              <p className="mt-2 text-muted">{h.registrationNote}</p>
            </div>
            <ButtonLink href={registerHref} size="lg">
              {external ? `Register on ${s.hackathonPlatform || "the platform"}` : "Register your team"}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
