import { ArrowRight, ArrowUpRight, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { cn } from "@/lib/cn";
import type { RegistrationStatus, Tone } from "@/lib/content/constants";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref, hackathonShown, registrationHref } from "@/lib/event";
import { formatDate } from "@/lib/format";
import type { PageCopy } from "@/lib/schema/page-copy";
import type { PlacardKey } from "./HeroPlacards";

type Words = PageCopy["homeRegister"];

function StatusDot({ live = false }: { live?: boolean }) {
  return (
    <span aria-hidden className="relative flex h-2 w-2">
      {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-ink)]" />
    </span>
  );
}

function Chip({ tone, live, children }: { tone: Tone; live?: boolean; children: ReactNode }) {
  return (
    <span className={`tone-${tone} inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset`}>
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
  kicker: string;
  title: string;
  href: string;
  status: RegistrationStatus;
  deadline: string;
}

/**
 * Along the foot of the home hero: a short heading and one compact ticket for each registration, so attending
 * the workshop and joining the hackathon read as two separate things without taking over the hero. The whole
 * ticket is the link. Its spinning edge lights up on the ticket whose placard Aura is holding up (the hero
 * section's data-placard, set by HeroPlacards), and pointing at a ticket brings its placard up.
 */
export function RegisterChooser({ s, className }: { s: SiteSettings; className?: string }) {
  const c = copy(s, "homeRegister");
  const choices: Choice[] = [
    {
      key: "workshop",
      tone: c.workshopTone,
      icon: <Ticket size={22} aria-hidden />,
      kicker: c.workshopKicker,
      title: c.workshopTitle,
      href: registrationHref(s),
      status: s.workshopStatus,
      deadline: s.workshopDeadline,
    },
    // The hackathon's ticket only while it is shown; the workshop's alone gets its own heading.
    ...(hackathonShown(s)
      ? [
          {
            key: "hackathon" as const,
            tone: c.hackathonTone,
            icon: <Trophy size={22} aria-hidden />,
            kicker: c.hackathonKicker,
            title: c.hackathonTitle,
            href: hackathonRegistrationHref(s),
            status: s.hackathonStatus,
            deadline: s.hackathonDeadline,
          },
        ]
      : []),
  ];
  const solo = choices.length === 1;
  const title = solo ? c.soloTitle : c.title;
  const description = solo ? c.soloDescription : c.description;
  return (
    <div data-edit="home.register" data-graph-avoid="" className={cn("grid gap-4 lg:grid-cols-[15.5rem_1fr] lg:items-center lg:gap-6", className)}>
      <div>
        <h2 id="register-choice-title" className="font-display text-xl font-bold text-fg">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <ul aria-labelledby="register-choice-title" className={cn("grid gap-3 sm:gap-4", solo ? "sm:max-w-xl" : "sm:grid-cols-2")}>
        {choices.map((x) => {
          const external = /^https?:/.test(x.href);
          const body = (
            <>
              {/* The edge: a conic gradient spinning behind the ticket, seen only in the 2px around it. */}
              <span aria-hidden className="reg-choice-ring absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-1/2 bg-[conic-gradient(from_0deg,var(--accent),transparent_22%,var(--accent-ink)_45%,transparent_70%,var(--accent))]" />
              <span className="relative flex w-full items-center gap-3.5 overflow-hidden rounded-[calc(1.25rem-2px)] bg-surface p-3.5 sm:p-4">
                <span aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_40%,transparent),transparent)] opacity-70" />
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">{x.icon}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-[11px] font-bold tracking-[0.16em] text-accent-ink uppercase">{x.kicker}</span>
                    <Status status={x.status} deadline={x.deadline} c={c} />
                  </span>
                  <span className="mt-1 block font-display text-[1.05rem] leading-snug font-bold text-fg sm:text-lg">{x.title}</span>
                </span>
                <span aria-hidden className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink transition-[translate,background-color,color] duration-300 group-hover:translate-x-0.5 group-hover:bg-[var(--accent-ink)] group-hover:text-surface">
                  {external ? <ArrowUpRight size={17} /> : <ArrowRight size={17} />}
                </span>
              </span>
            </>
          );
          const cls = cn(
            `tone-${x.tone}`,
            "reg-choice group relative isolate flex h-full overflow-hidden rounded-[1.25rem] p-[2px] shadow-card transition-[translate,box-shadow] duration-300 hover:-translate-y-1 focus-visible:-translate-y-1",
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
