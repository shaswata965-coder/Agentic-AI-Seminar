import { ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { Deadline } from "@/components/forms/Deadline";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { PageHero } from "@/components/layout/PageHero";
import { TrophyArt } from "@/components/portals/PortalArt";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { TagScope } from "@/components/ui/Tag";
import { getSettings } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { eventCalendarLinks } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Registration",
    description: `Register for the ${s.eventName} at IIT Delhi, ${formatDateRange(s.startDate, s.endDate)}. Fees, deadlines and the registration form.`,
    alternates: { canonical: absoluteUrl("/register") },
  };
}

export default async function RegisterPage() {
  const s = await getSettings();
  const hero = copy(s, "registerHero");
  const form = copy(s, "registerForm");
  const fees = copy(s, "registerFees");
  const dl = copy(s, "registerDeadlines");
  const closedBadge = (
    <Badge tone="blush" dot>
      {hero.closed}
    </Badge>
  );
  const status =
    s.workshopStatus === "open" ? (
      <DeadlineGate deadline={s.workshopDeadline} closed={closedBadge}>
        <Badge tone="mint" dot>
          {hero.open}
        </Badge>
      </DeadlineGate>
    ) : s.workshopStatus === "closed" ? (
      closedBadge
    ) : (
      <Badge tone="butter" dot>
        {hero.soon}
      </Badge>
    );

  return (
    <TagScope style="stamp">
      <PageHero
        edit="register.hero"
        home={s.siteNav.home}
        tone={hero.tone}
        crumb={hero.crumb}
        eyebrow={hero.eyebrow}
        title={hero.title}
        aura="registration"
        description={
          <p>
            {hero.description}
            {hero.hackathonLink ? (
              <>
                {" "}
                {hero.hackathonBefore}{" "}
                <a className="font-semibold text-brand underline underline-offset-2" href="#hackathon-note">
                  {hero.hackathonLink}
                </a>
                .
              </>
            ) : null}
          </p>
        }
      >
        {status}
      </PageHero>

      <section data-edit="register.form" className={`tone-${hero.tone} py-12 sm:py-16`}>
        <div className="container-site grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            {s.workshopUrl ? (
              <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
                <Aura variant="registration" size={150} />
                <div>
                  <h2 className="font-display text-2xl font-bold text-fg">{form.externalTitle}</h2>
                  {form.externalText ? <p className="mt-2 text-muted">{form.externalText}</p> : null}
                  <div className="mt-5">
                    <ButtonLink href={s.workshopUrl} size="lg" iconRight={<ExternalLink size={17} aria-hidden />}>
                      {form.externalButton}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            ) : s.workshopStatus === "open" ? (
              <DeadlineGate deadline={s.workshopDeadline} closed={<StatusCard s={s} closed />}>
                <RegistrationForm calendar={eventCalendarLinks(s)} shareUrl={absoluteUrl("/")} eventName={s.eventName} />
              </DeadlineGate>
            ) : (
              <StatusCard s={s} closed={s.workshopStatus === "closed"} />
            )}
          </div>

          <aside className="grid content-start gap-5">
            <div data-edit="register.fees" className="card p-6">
              <h2 className="font-display text-xl font-bold text-fg">{fees.title}</h2>
              {s.fees.length ? (
                <table className="mt-4 w-full text-left text-sm">
                  <caption className="sr-only">Registration fees by category</caption>
                  <thead>
                    <tr className="text-xs tracking-[0.12em] text-subtle uppercase">
                      <th scope="col" className="pb-2 font-bold">
                        {fees.category}
                      </th>
                      <th scope="col" className="pb-2 text-right font-bold">
                        {fees.fee}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.fees.map((f, i) => (
                      <tr key={i} className="border-t border-border">
                        <th scope="row" className="py-3 pr-3 font-semibold text-fg">
                          {f.category}
                          {f.note ? <span className="block text-xs font-normal text-subtle">{f.note}</span> : null}
                        </th>
                        <td className="py-3 text-right font-semibold text-accent-ink">{f.amount || fees.tba}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {s.feeNote ? <p className="mt-3 text-sm text-muted">{s.feeNote}</p> : null}
            </div>
            <div data-edit="register.deadlines" className="grid gap-5">
              <div className="card grid gap-3 p-6">
                <h2 className="font-display text-xl font-bold text-fg">{dl.title}</h2>
                {s.workshopDeadline ? <Deadline iso={s.workshopDeadline} label={dl.workshop} /> : <p className="text-sm text-muted">{dl.workshopTba}</p>}
                {s.hackathonDeadline ? <Deadline iso={s.hackathonDeadline} label={dl.hackathon} /> : <p className="text-sm text-muted">{dl.hackathonTba}</p>}
              </div>
              <div id="hackathon-note" className="scroll-mt-28">
                <h2 className="sr-only">{dl.portalKicker}</h2>
                <Portal href="/hackathon" tone="lilac" compact kicker={dl.portalKicker} title={dl.portalTitle} text={dl.portalText} art={<TrophyArt />} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </TagScope>
  );
}

/** Shown instead of the form while registration is not open. */
function StatusCard({ s, closed }: { s: SiteSettings; closed: boolean }) {
  const c = copy(s, "registerForm");
  const text = closed ? c.closedText : c.soonText;
  return (
    <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
      <Aura variant={closed ? "sleep" : "countdown"} size={160} interactive />
      <div>
        <h2 className="font-display text-2xl font-bold text-fg">{closed ? c.closedTitle : c.soonTitle}</h2>
        {text ? <p className="mt-2 max-w-lg text-muted">{text}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          {c.announcements ? (
            <ButtonLink href="/#news" variant="soft">
              {c.announcements}
            </ButtonLink>
          ) : null}
          {c.contact ? (
            <ButtonLink href="/#contact" variant="outline" icon={<Mail size={17} aria-hidden />}>
              {c.contact}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}
