import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { Deadline } from "@/components/forms/Deadline";
import { HackathonForm } from "@/components/forms/HackathonForm";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { THEME_META } from "@/lib/content/constants";
import { getHackathon, getSettings } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const h = await getHackathon();
  return { title: "Hackathon registration", description: `Register your team for the ${h.title}.`, alternates: { canonical: absoluteUrl("/hackathon/register") } };
}

export default async function HackathonRegisterPage() {
  const [s, h] = await Promise.all([getSettings(), getHackathon()]);
  const tracks = h.tracks.map((t) => ({ value: t.theme, label: `${t.title} (${(THEME_META[t.theme] ?? THEME_META.general).short})` }));
  return (
    <>
      <PageHero tone="aqua" crumb="Hackathon registration" eyebrow="Hackathon" title="Register your team" aura="hackathon" description={<p>{h.registrationNote}</p>}>
        {s.hackathonStatus === "open" ? (
          <Badge tone="mint" dot>
            Registration open
          </Badge>
        ) : s.hackathonStatus === "closed" ? (
          <Badge tone="blush" dot>
            Registration closed
          </Badge>
        ) : (
          <Badge tone="butter" dot>
            Opening soon
          </Badge>
        )}
        {s.hackathonDeadline ? <Deadline iso={s.hackathonDeadline} /> : null}
      </PageHero>
      <section className="tone-aqua py-12 sm:py-16">
        <div className="container-site max-w-4xl">
          {s.hackathonUrl ? (
            <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
              <Aura variant="hackathon" size={160} />
              <div>
                <h2 className="font-display text-2xl font-bold text-fg">Registration happens on {s.hackathonPlatform || "our hackathon platform"}</h2>
                <p className="mt-2 text-muted">Create your team and submit your details on the platform. It opens in a new tab.</p>
                <div className="mt-5">
                  <ButtonLink href={s.hackathonUrl} size="lg" iconRight={<ExternalLink size={17} aria-hidden />}>
                    Go to {s.hackathonPlatform || "registration"}
                  </ButtonLink>
                </div>
              </div>
            </div>
          ) : s.hackathonStatus === "open" ? (
            <HackathonForm tracks={tracks} />
          ) : (
            <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
              <Aura variant={s.hackathonStatus === "closed" ? "sleep" : "countdown"} size={170} interactive />
              <div>
                <h2 className="font-display text-2xl font-bold text-fg">{s.hackathonStatus === "closed" ? "Hackathon registration is closed" : "Hackathon registration opens soon"}</h2>
                <p className="mt-2 max-w-lg text-muted">
                  {s.hackathonStatus === "closed"
                    ? "Thanks to everyone who registered! Shortlisted teams will be contacted by e-mail."
                    : "Start forming your team! When registration opens you will need a team name, your preferred track, member details and a short idea summary."}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href="/hackathon" variant="soft">
                    Read the hackathon details
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
