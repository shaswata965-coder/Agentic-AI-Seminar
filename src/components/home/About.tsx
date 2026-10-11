import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CmsIcon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { AgentLoop } from "./AgentLoop";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

function activityHref(title: string) {
  if (/panel/i.test(title)) return "/speakers#panels";
  if (/talk|keynote|speaker/i.test(title)) return "/speakers";
  if (/tutorial/i.test(title)) return "/tutorials";
  if (/demo/i.test(title)) return "/tutorials#demos";
  if (/kiosk|exhibit|industry/i.test(title)) return "/#kiosks";
  if (/hack/i.test(title)) return "/hackathon";
  return "/programme";
}

export function About({ s }: { s: SiteSettings }) {
  return (
    <Section id="about" tone="mint" wash labelledBy="about-title">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading id="about-title" eyebrow="About the workshop" title="Why agentic AI, and why now?" className="mb-6 sm:mb-8" />
          <RichText text={s.motivation} className="text-[17px] leading-relaxed text-muted" />
          <div className="tone-lilac card mt-8 p-6" data-reveal>
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-fg">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                <CmsIcon name="sparkles" size={18} />
              </span>
              What is agentic AI?
            </h3>
            <RichText text={s.agenticAI} className="mt-3 text-[15.5px] leading-relaxed text-muted" />
          </div>
        </div>
        <div data-reveal>
          <AgentLoop />
        </div>
      </div>

      <div className="mt-20">
        <h3 className="font-display text-2xl font-bold text-fg sm:text-3xl">Who should attend</h3>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {s.audience.map((a, i) => (
            <li key={a.title} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties} className={`tone-${TONES[i % 6]} card p-5 transition-transform duration-300 hover:-translate-y-1`}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                <CmsIcon name={a.icon} size={21} />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-fg">{a.title}</p>
              <p className="mt-1.5 text-sm text-muted">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16">
        <h3 className="font-display text-2xl font-bold text-fg sm:text-3xl">What happens over the two days</h3>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.activities.map((a, i) => (
            <li key={a.title} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}>
              <Link
                href={activityHref(a.title)}
                className={`tone-${TONES[(i + 2) % 6]} card group flex h-full items-start gap-4 p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}
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
      </div>
    </Section>
  );
}
