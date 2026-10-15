import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { Deadline } from "@/components/forms/Deadline";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { HackathonForm } from "@/components/forms/HackathonForm";
import { PageHero } from "@/components/layout/PageHero";
import { TrophyArt } from "@/components/portals/PortalArt";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { TagScope } from "@/components/ui/Tag";
import { THEME_META } from "@/lib/content/constants";
import { getHackathon, getSettings } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const h = await getHackathon();
  return { title: "Hackathon registration", description: `Register your team for the ${h.title}.`, alternates: { canonical: absoluteUrl("/hackathon/register") } };
}

export default async function HackathonRegisterPage() {
  const [s, h] = await Promise.all([getSettings(), getHackathon()]);
  const tracks = h.tracks.map((t) => ({ value: t.theme, label: `${t.title} (${(THEME_META[t.theme] ?? THEME_META.general).short})` }));
  const hero = copy(s, "hackathonRegisterHero");
  const form = copy(s, "hackathonRegisterForm", { platform: s.hackathonPlatform || "our hackathon platform" });
  const closedBadge = (
    <Badge tone="blush" dot>
      {hero.closed}
    </Badge>
  );
  return (
    <TagScope style="slash">
      <PageHero edit="hackathonRegister.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="hackathon" description={h.registrationNote}>
        {s.hackathonStatus === "open" ? (
          <DeadlineGate deadline={s.hackathonDeadline} closed={closedBadge}>
            <Badge tone="mint" dot>
              {hero.open}
            </Badge>
          </DeadlineGate>
        ) : s.hackathonStatus === "closed" ? (
          closedBadge
        ) : (
          <Badge tone="butter" dot>
            {hero.soon}
          </Badge>
        )}
        {s.hackathonDeadline ? <Deadline iso={s.hackathonDeadline} /> : null}
      </PageHero>
      <section data-edit="hackathonRegister.form" className={`tone-${hero.tone} py-12 sm:py-16`}>
        <div className="container-site max-w-4xl">
          {s.hackathonUrl ? (
            <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
              <Aura variant="hackathon" size={160} />
              <div>
                <h2 className="font-display text-2xl font-bold text-fg">{form.externalTitle}</h2>
                {form.externalText ? <p className="mt-2 text-muted">{form.externalText}</p> : null}
                <div className="mt-5">
                  <ButtonLink href={s.hackathonUrl} size="lg" iconRight={<ExternalLink size={17} aria-hidden />}>
                    {copy(s, "hackathonRegisterForm", { platform: s.hackathonPlatform || "registration" }).externalButton}
                  </ButtonLink>
                </div>
              </div>
            </div>
          ) : s.hackathonStatus === "open" ? (
            <DeadlineGate deadline={s.hackathonDeadline} closed={<StatusCard s={s} closed />}>
              <HackathonForm tracks={tracks} />
            </DeadlineGate>
          ) : (
            <StatusCard s={s} closed={s.hackathonStatus === "closed"} />
          )}
        </div>
      </section>
    </TagScope>
  );
}

/** Shown instead of the form while hackathon registration is not open. */
function StatusCard({ s, closed }: { s: SiteSettings; closed: boolean }) {
  const c = copy(s, "hackathonRegisterForm");
  const text = closed ? c.closedText : c.soonText;
  return (
    <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
      <Aura variant={closed ? "sleep" : "countdown"} size={170} interactive />
      <div>
        <h2 className="font-display text-2xl font-bold text-fg">{closed ? c.closedTitle : c.soonTitle}</h2>
        {text ? <p className="mt-2 max-w-lg text-muted">{text}</p> : null}
        <Portal href="/hackathon" tone={s.hackathonRegisterHero.tone} compact kicker={s.hackathonRegisterHero.eyebrow} title={c.portalTitle} art={<TrophyArt />} className="mt-5 max-w-md" />
      </div>
    </div>
  );
}
