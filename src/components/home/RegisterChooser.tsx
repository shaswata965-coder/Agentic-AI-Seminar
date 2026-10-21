import { ArrowRight, CalendarDays, ExternalLink, MapPin, Ticket, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { RegistrationStatus, Tone } from "@/lib/content/constants";
import type { HackathonInfo, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref, registrationHref } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import type { PageCopy } from "@/lib/schema/page-copy";
import type { PlacardKey } from "./HeroPlacards";

type Words = PageCopy["homeRegister"];

function StatusDot({ live = false }: { live?: boolean }) {
  return (
    <span aria-hidden className="relative flex h-2.5 w-2.5">
      {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-ink)]" />
    </span>
  );
}

function Chip({ tone, live, children }: { tone: Tone; live?: boolean; children: ReactNode }) {
  return (
    <span className={`tone-${tone} inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset`}>
      <StatusDot live={live} />
      {children}
    </span>
  );
}

/** A registration's status as set in Site settings → Site-wide → Registration, closing by itself at the deadline. */
function Status({ status, deadline, c }: { status: RegistrationStatus; deadline: string; c: Words }) {
  const closed = <Chip tone="blush">{c.closed}</Chip>;
  if (status === "closed") return closed;
  if (status !== "open") return <Chip tone="butter">{c.soon}</Chip>;
  const until = deadline ? formatDate(deadline, { day: "numeric", month: "short" }) : "";
  return (
    <DeadlineGate deadline={deadline} closed={closed}>
      <Chip tone="mint" live>
        {c.open}
        {until ? <span className="font-medium opacity-80">{c.until ? `${c.until} ${until}` : until}</span> : null}
      </Chip>
    </DeadlineGate>
  );
}

interface Choice {
  key: PlacardKey;
  tone: Tone;
  icon: ReactNode;
  aura: AuraVariant;
  kicker: string;
  title: string;
  text: string;
  button: string;
  href: string;
  status: RegistrationStatus;
  deadline: string;
  facts: { icon: ReactNode; label?: string; value: string }[];
}

/**
 * Under the home hero: one large card for each registration, so attending the workshop and joining the
 * hackathon read as two separate things. The whole card is the link. Its spinning edge lights up on the card
 * whose placard Aura is holding up (the hero section's data-placard, set by HeroPlacards), and pointing at a
 * card brings its placard up.
 */
export function RegisterChooser({ s, h, className }: { s: SiteSettings; h: HackathonInfo; className?: string }) {
  const c = copy(s, "homeRegister");
  const choices: Choice[] = [
    {
      key: "workshop",
      tone: c.workshopTone,
      icon: <Ticket size={26} aria-hidden />,
      aura: "registration",
      kicker: c.workshopKicker,
      title: c.workshopTitle,
      text: c.workshopText,
      button: c.workshopButton,
      href: registrationHref(s),
      status: s.workshopStatus,
      deadline: s.workshopDeadline,
      facts: [
        { icon: <CalendarDays size={15} aria-hidden />, value: formatDateRange(s.startDate, s.endDate) },
        { icon: <MapPin size={15} aria-hidden />, value: s.venueName },
      ],
    },
    {
      key: "hackathon",
      tone: c.hackathonTone,
      icon: <Trophy size={26} aria-hidden />,
      aura: "hackathon",
      kicker: c.hackathonKicker,
      title: c.hackathonTitle,
      text: c.hackathonText,
      button: c.hackathonButton,
      href: hackathonRegistrationHref(s),
      status: s.hackathonStatus,
      deadline: s.hackathonDeadline,
      facts: [
        { icon: <Users size={15} aria-hidden />, label: c.teamSize, value: h.teamSize || "TBA" },
        { icon: <Trophy size={15} aria-hidden />, label: c.prizePool, value: h.prizePool || "TBA" },
      ],
    },
  ];
  return (
    <div data-edit="home.register" data-graph-avoid="" className={className}>
      <div className="mb-5 text-center">
        <h2 id="register-choice-title" className="font-display text-2xl font-bold text-fg sm:text-3xl">
          {c.title}
        </h2>
        {c.description ? <p className="mx-auto mt-2 max-w-2xl text-muted">{c.description}</p> : null}
      </div>
      <ul aria-labelledby="register-choice-title" className="grid gap-5 md:grid-cols-2 md:gap-6">
        {choices.map((x) => {
          const external = /^https?:/.test(x.href);
          const body = (
            <>
              {/* The edge: a conic gradient spinning behind the card, seen only in the 2px around it. */}
              <span aria-hidden className="reg-choice-ring absolute top-1/2 left-1/2 aspect-square w-[220%] -translate-1/2 bg-[conic-gradient(from_0deg,var(--accent),transparent_22%,var(--accent-ink)_45%,transparent_70%,var(--accent))]" />
              <span className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-2px)] bg-surface p-6 sm:p-7">
                <span aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_45%,transparent),transparent)] opacity-70" />
                <span aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent_60%)]" />
                <span className="relative flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-ink shadow-card transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">{x.icon}</span>
                    <span className="text-xs font-bold tracking-[0.16em] text-accent-ink uppercase">{x.kicker}</span>
                  </span>
                  <Status status={x.status} deadline={x.deadline} c={c} />
                </span>
                <span className="relative mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <span>
                    <span className="block font-display text-2xl leading-tight font-bold text-fg sm:text-[1.9rem]">{x.title}</span>
                    {x.text ? <span className="mt-2 block text-[15px] text-muted">{x.text}</span> : null}
                    <span className="mt-4 flex flex-wrap gap-2">
                      {x.facts
                        .filter((f) => f.value)
                        .map((f, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-[13px] font-medium text-fg ring-1 ring-border">
                            <span className="text-accent-ink">{f.icon}</span>
                            {f.label ? <span className="text-subtle">{f.label}:</span> : null}
                            {f.value}
                          </span>
                        ))}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <Aura variant={x.aura} size={118} />
                  </span>
                </span>
                <span className={cn(buttonClasses("primary", "lg"), "relative mt-6 w-full sm:w-auto sm:self-start")}>
                  {x.button}
                  <span className="btn-ico-r">{external ? <ExternalLink size={17} aria-hidden /> : <ArrowRight size={18} aria-hidden />}</span>
                </span>
              </span>
            </>
          );
          const cls = cn(
            `tone-${x.tone}`,
            "reg-choice group relative isolate flex h-full overflow-hidden rounded-[1.75rem] p-[2px] shadow-card-lg transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
          );
          return (
            <li key={x.key}>
              {external ? (
                <a href={x.href} target="_blank" rel="noopener noreferrer" data-placard-key={x.key} className={cls}>
                  {body}
                </a>
              ) : (
                <Link href={x.href} data-placard-key={x.key} className={cls}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
