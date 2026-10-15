import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AgentLoop } from "@/components/home/AgentLoop";
import { PageHero } from "@/components/layout/PageHero";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { ShareButtons } from "@/components/share/ShareButtons";
import { CmsIcon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { getSettings } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { eventCalendarLinks } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "About",
    description: `Why the ${s.eventName} matters, what agentic AI is, who should attend and what happens over the two days.`,
    alternates: { canonical: absoluteUrl("/about") },
  };
}

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

function activityHref(title: string) {
  if (/panel/i.test(title)) return "/speakers#panels";
  if (/talk|keynote|speaker/i.test(title)) return "/speakers";
  if (/tutorial/i.test(title)) return "/tutorials";
  if (/demo/i.test(title)) return "/tutorials#demos";
  if (/kiosk|exhibit|industry/i.test(title)) return "/programme#kiosks";
  if (/hack/i.test(title)) return "/hackathon";
  return "/programme";
}

export default async function AboutPage() {
  const s = await getSettings();
  const hero = copy(s, "aboutHero");
  const m = copy(s, "aboutMotivation");
  const au = copy(s, "aboutAudience");
  const ac = copy(s, "aboutActivities");
  return (
    <TagScope style="underline">
      <PageHero edit="about.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="guide" description={hero.description}>
        <AddToCalendar links={eventCalendarLinks(s)} variant="outline" size="sm" />
        <ShareButtons url={absoluteUrl("/")} text={`${s.eventName} at IIT Delhi, ${formatDateRange(s.startDate, s.endDate)}`} />
      </PageHero>

      <Section edit="about.motivation" tone={m.tone} bg={m.background} labelledBy="motivation-title">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 id="motivation-title" className="sr-only">
              {m.title}
            </h2>
            <RichText text={s.motivation} className="text-[17px] leading-relaxed text-muted" />
            <div className={`tone-${m.agenticTone} card mt-8 p-6`} data-reveal>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-fg">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                  <CmsIcon name="sparkles" size={18} />
                </span>
                {m.agenticTitle}
              </h3>
              <RichText text={s.agenticAI} className="mt-3 text-[15.5px] leading-relaxed text-muted" />
            </div>
          </div>
          <div data-reveal>
            <AgentLoop />
          </div>
        </div>
      </Section>

      <Section edit="about.audience" tone={au.tone} bg={au.background} labelledBy="audience-title">
        <SectionHeading id="audience-title" eyebrow={au.eyebrow} title={au.title} className="mb-8 sm:mb-10" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {s.audience.map((a, i) => (
            <li key={a.title} data-reveal data-glow="" style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties} className={`tone-${TONES[i % 6]} card group p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">
                <CmsIcon name={a.icon} size={21} />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-fg">{a.title}</p>
              <p className="mt-1.5 text-sm text-muted">{a.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section edit="about.activities" tone={ac.tone} bg={ac.background} labelledBy="activities-title">
        <SectionHeading id="activities-title" eyebrow={ac.eyebrow} title={ac.title} className="mb-8 sm:mb-10" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.activities.map((a, i) => (
            <li key={a.title} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}>
              <Link
                href={activityHref(a.title)}
                data-glow=""
                className={`tone-${TONES[(i + 2) % 6]} card group flex h-full items-start gap-4 p-5 transition-[translate,scale,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <CmsIcon name={a.icon} size={22} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-lg font-semibold text-fg">
                    {a.title}
                    <ArrowRight size={16} aria-hidden className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-muted">{a.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </TagScope>
  );
}
