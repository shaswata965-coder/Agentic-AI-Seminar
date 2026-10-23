import { ArrowUp, CircleCheck } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";

/** The call for posters on the Registration page: arXiv preprints and submitted papers are welcome at the poster session. */
export function CallForPosters({ s, formShown }: { s: SiteSettings; formShown: boolean }) {
  const c = copy(s, "registerPosters");
  const welcome = [c.welcome1, c.welcome2, c.welcome3].filter(Boolean);
  return (
    <Section id="posters" edit="register.posters" tone={c.tone} bg={c.background} labelledBy="posters-title" tags="stamp">
      <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="flex justify-center">
          <Aura variant="lecturer" size={320} interactive className="max-w-[80vw]" />
        </div>
        <div>
          <SectionHeading id="posters-title" eyebrow={c.eyebrow} title={c.title} description={c.description} className="mb-6 sm:mb-8" />
          <div className="grid gap-5 sm:grid-cols-2">
            {welcome.length ? (
              <div className="card p-5 sm:p-6">
                {c.welcomeTitle ? <h3 className="font-display text-lg font-bold text-fg">{c.welcomeTitle}</h3> : null}
                <ul className="mt-3 grid gap-2.5">
                  {welcome.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-[15px] text-fg">
                      <CircleCheck size={18} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {c.how ? (
              <div className="card flex flex-col p-5 sm:p-6">
                {c.howTitle ? <h3 className="font-display text-lg font-bold text-fg">{c.howTitle}</h3> : null}
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{c.how}</p>
                {c.button && formShown ? (
                  <div className="mt-5">
                    <ButtonLink href="#register-form" variant="soft" icon={<ArrowUp size={17} aria-hidden />}>
                      {c.button}
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
