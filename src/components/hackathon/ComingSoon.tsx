import { CalendarDays, Megaphone, MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Poster } from "@/components/ui/Poster";
import type { HackathonInfo, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { isShown } from "@/lib/schema/section-order";

/** The Hackathon page while the hackathon is hidden: only its "details coming soon" poster, with why to join. */
export function HackathonComingSoon({ s, h }: { s: SiteSettings; h: HackathonInfo }) {
  const c = copy(s, "hackathonPoster", { hackathon: h.title });
  return (
    <section data-edit="hackathon.poster" aria-labelledby="hackathon-poster-title" className={`tone-${c.tone} relative isolate overflow-hidden py-12 sm:py-16`}>
      {c.background === "wash" ? <div aria-hidden className="wash absolute inset-0 -z-10" /> : null}
      {c.background === "band" ? <div aria-hidden className="absolute inset-0 -z-10 bg-[color-mix(in_oklab,var(--accent-soft)_70%,var(--bg))]" /> : null}
      <div className="container-site">
        <Poster
          as="h1"
          titleId="hackathon-poster-title"
          tone={c.tone}
          kicker={h.title}
          badge={c.badge}
          title={c.title}
          text={c.text}
          pointsTitle={c.whyTitle}
          points={[c.why1, c.why2, c.why3, c.why4]}
          facts={[
            { icon: <CalendarDays size={17} aria-hidden />, label: c.when, value: h.dates || formatDateRange(s.startDate, s.endDate) },
            { icon: <MapPin size={17} aria-hidden />, label: c.where, value: h.location || venueLine(s) },
          ]}
          footnote={s.organisedBy}
          className="mx-auto max-w-2xl"
        >
          {c.button && isShown(s, "home", "news") ? (
            <ButtonLink href="/#news" variant="soft" icon={<Megaphone size={17} aria-hidden />}>
              {c.button}
            </ButtonLink>
          ) : null}
        </Poster>
      </div>
    </section>
  );
}
