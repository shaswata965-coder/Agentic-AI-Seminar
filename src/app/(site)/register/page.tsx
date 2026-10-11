import { ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { Deadline } from "@/components/forms/Deadline";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { getSettings } from "@/lib/content/queries";
import { eventCalendarLinks, venueLine } from "@/lib/event";
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
  const closedBadge = (
    <Badge tone="blush" dot>
      Registration closed
    </Badge>
  );
  const status =
    s.workshopStatus === "open" ? (
      <DeadlineGate deadline={s.workshopDeadline} closed={closedBadge}>
        <Badge tone="mint" dot>
          Registration open
        </Badge>
      </DeadlineGate>
    ) : s.workshopStatus === "closed" ? (
      closedBadge
    ) : (
      <Badge tone="butter" dot>
        Opening soon
      </Badge>
    );

  return (
    <>
      <PageHero
        tone="peach"
        crumb="Registration"
        eyebrow="Registration"
        title="Register for the workshop"
        aura="registration"
        description={
          <p>
            {formatDateRange(s.startDate, s.endDate)} · {venueLine(s)}. Registering takes about two minutes. The hackathon has a{" "}
            <a className="font-semibold text-brand underline underline-offset-2" href="#hackathon-note">
              separate team registration
            </a>
            .
          </p>
        }
      >
        {status}
      </PageHero>

      <section className="tone-peach py-12 sm:py-16">
        <div className="container-site grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            {s.workshopUrl ? (
              <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
                <Aura variant="registration" size={150} />
                <div>
                  <h2 className="font-display text-2xl font-bold text-fg">Register using the official form</h2>
                  <p className="mt-2 text-muted">Registration is handled through an external form. It opens in a new tab.</p>
                  <div className="mt-5">
                    <ButtonLink href={s.workshopUrl} size="lg" iconRight={<ExternalLink size={17} aria-hidden />}>
                      Open registration form
                    </ButtonLink>
                  </div>
                </div>
              </div>
            ) : s.workshopStatus === "open" ? (
              <DeadlineGate deadline={s.workshopDeadline} closed={<StatusCard closed />}>
                <RegistrationForm calendar={eventCalendarLinks(s)} shareUrl={absoluteUrl("/")} eventName={s.eventName} />
              </DeadlineGate>
            ) : (
              <StatusCard closed={s.workshopStatus === "closed"} />
            )}
          </div>

          <aside className="grid content-start gap-5">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-fg">Fees</h2>
              {s.fees.length ? (
                <table className="mt-4 w-full text-left text-sm">
                  <caption className="sr-only">Registration fees by category</caption>
                  <thead>
                    <tr className="text-xs tracking-[0.12em] text-subtle uppercase">
                      <th scope="col" className="pb-2 font-bold">
                        Category
                      </th>
                      <th scope="col" className="pb-2 text-right font-bold">
                        Fee
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
                        <td className="py-3 text-right font-semibold text-accent-ink">{f.amount || "TBA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {s.feeNote ? <p className="mt-3 text-sm text-muted">{s.feeNote}</p> : null}
            </div>
            <div className="card grid gap-3 p-6">
              <h2 className="font-display text-xl font-bold text-fg">Deadlines</h2>
              {s.workshopDeadline ? <Deadline iso={s.workshopDeadline} label="Workshop registration closes" /> : <p className="text-sm text-muted">Workshop registration deadline: to be announced.</p>}
              {s.hackathonDeadline ? <Deadline iso={s.hackathonDeadline} label="Hackathon registration closes" /> : <p className="text-sm text-muted">Hackathon registration deadline: to be announced.</p>}
            </div>
            <div id="hackathon-note" className="tone-lilac card scroll-mt-28 p-6">
              <div className="flex items-center gap-3">
                <Aura variant="hackathon" size={64} lite />
                <h2 className="font-display text-xl font-bold text-fg">Joining the hackathon?</h2>
              </div>
              <p className="mt-3 text-sm text-muted">Hackathon teams register separately. One member registers on behalf of the whole team.</p>
              <div className="mt-4">
                <ButtonLink href="/hackathon" variant="soft" size="sm">
                  Hackathon details
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/** Shown instead of the form while registration is not open. */
function StatusCard({ closed }: { closed: boolean }) {
  return (
    <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
      <Aura variant={closed ? "sleep" : "countdown"} size={160} interactive />
      <div>
        <h2 className="font-display text-2xl font-bold text-fg">{closed ? "Registration is closed" : "Registration opens soon"}</h2>
        <p className="mt-2 max-w-lg text-muted">
          {closed
            ? "Thank you for your interest! Registration for this edition has closed. Follow the announcements for updates."
            : "We're getting everything ready. Registration details, fees and deadlines will be announced here — check the announcements for the opening date."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/#news" variant="soft">
            See announcements
          </ButtonLink>
          <ButtonLink href="/#contact" variant="outline" icon={<Mail size={17} aria-hidden />}>
            Contact us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
