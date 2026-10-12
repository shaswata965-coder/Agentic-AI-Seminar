import { House, Mic, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import { AuraHead } from "@/components/aura/AuraHead";
import { Avatar } from "@/components/ui/Avatar";
import { AIRPORT, GREEN, METRO, PLACES, ROUTES, VENUE } from "@/components/venue/delhi-map";

/*
 * Preview pictures for <Portal> links (components/ui/Portal.tsx): each one hints at the page it
 * leads to. They are decorative (the Portal hides them from assistive tech) and their motion stops
 * with reduced motion (see .portal-* in globals.css).
 */

/** Speakers: a few real faces, fanned out, and how many there are. */
export function FacesArt({ people, total }: { people: { name: string; photo?: string }[]; total: number }) {
  if (!people.length) {
    return (
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-surface text-accent-ink shadow-card">
        <Mic size={24} />
        <span className="portal-ping absolute inset-0 rounded-2xl border-2 border-[var(--accent)]" />
      </span>
    );
  }
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="flex -space-x-3.5">
        {people.slice(0, 3).map((p, i) => (
          <span key={p.name} className="portal-face inline-block rounded-full ring-2 ring-surface" style={{ "--i": i } as CSSProperties}>
            <Avatar name={p.name} src={p.photo} size={38} />
          </span>
        ))}
      </span>
      <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-accent-ink shadow-card">
        {total} {total === 1 ? "speaker" : "speakers"}
      </span>
    </span>
  );
}

/** About: Aura inside the agent loop, with a signal going round. */
export function LoopArt() {
  const nodes = [
    { a: -90, c: "var(--azure)" },
    { a: 0, c: "var(--lilac)" },
    { a: 90, c: "var(--mint)" },
    { a: 180, c: "var(--peach)" },
  ];
  return (
    <span className="relative block h-full w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" focusable="false">
        <circle cx="50" cy="50" r="33" fill="none" strokeWidth="2" strokeDasharray="3 5" className="stroke-accent-ink opacity-40" />
        {nodes.map((n) => (
          <circle key={n.a} cx={(50 + 33 * Math.cos((n.a * Math.PI) / 180)).toFixed(2)} cy={(50 + 33 * Math.sin((n.a * Math.PI) / 180)).toFixed(2)} r="6" fill={n.c} strokeWidth="2" className="stroke-surface" />
        ))}
        <g className="portal-orbit">
          <circle cx="50" cy="17" r="3.4" className="fill-accent-ink" />
        </g>
      </svg>
      <AuraHead size={34} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </span>
  );
}

/** Venue: a crop of the Delhi route map, the airport route marching toward IIT Delhi. */
export function RouteArt() {
  const route = ROUTES.air[0];
  const from = PLACES.find((p) => p.id === route.from)?.at ?? [81, 519];
  const metro = METRO.filter((l) => l.id !== "yellow");
  return (
    <svg viewBox="40 330 600 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" focusable="false">
      <path d={AIRPORT} className="fill-[color-mix(in_oklab,var(--fg)_8%,var(--surface))]" />
      {GREEN.map((d, i) => (
        <path key={i} d={d} className="fill-[color-mix(in_oklab,var(--mint)_45%,var(--surface))]" />
      ))}
      {metro.map((l) => (
        <path key={l.id} d={l.d} fill="none" stroke={l.color} strokeWidth="9" strokeLinecap="round" opacity="0.35" />
      ))}
      <path d={route.d} fill="none" strokeWidth="26" strokeLinecap="round" className="stroke-[color-mix(in_oklab,var(--brand)_25%,transparent)]" />
      <path d={route.d} fill="none" strokeWidth="13" strokeLinecap="round" strokeDasharray="1 26" className="portal-march stroke-brand" />
      <circle cx={from[0]} cy={from[1]} r="20" strokeWidth="7" className="fill-accent-ink stroke-surface" />
      <circle cx={VENUE.at[0]} cy={VENUE.at[1]} r="30" strokeWidth="9" className="fill-brand stroke-surface" />
    </svg>
  );
}

/** Programme: two days of sessions as a little timetable. */
export function ScheduleArt() {
  const days: [string, number[]][] = [
    ["D1", [72, 46, 88, 58]],
    ["D2", [52, 84, 40, 66]],
  ];
  const colours = ["var(--azure)", "var(--lilac)", "var(--peach)", "var(--mint)"];
  return (
    <span className="grid w-[76%] grid-cols-2 gap-2.5">
      {days.map(([d, bars]) => (
        <span key={d} className="flex flex-col gap-1">
          <span className="font-display text-[11px] font-extrabold text-accent-ink">{d}</span>
          {bars.map((w, i) => (
            <span key={i} className="portal-bar h-1.5 rounded-sm" style={{ width: `${w}%`, background: colours[(i + (d === "D2" ? 1 : 0)) % 4], "--i": i } as CSSProperties} />
          ))}
        </span>
      ))}
    </span>
  );
}

/** Hackathon: the trophy in a ring of tracks. */
export function TrophyArt() {
  return (
    <span className="relative grid h-full w-full place-items-center">
      <span className="portal-spin absolute h-[3.75rem] w-[3.75rem] rounded-full border-2 border-dashed border-[color-mix(in_oklab,var(--accent-ink)_45%,transparent)]">
        <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--blush)] ring-2 ring-surface" />
        <span className="absolute -bottom-1 left-[18%] h-2.5 w-2.5 rounded-full bg-[var(--lilac)] ring-2 ring-surface" />
        <span className="absolute right-[12%] -bottom-0.5 h-2.5 w-2.5 rounded-full bg-[var(--peach)] ring-2 ring-surface" />
      </span>
      <Trophy size={26} className="relative text-accent-ink" />
    </span>
  );
}

/** FAQ: a question and its answer, as two speech bubbles. */
export function FaqArt() {
  return (
    <span className="relative block h-14 w-[4.5rem]">
      <span className="portal-bubble absolute top-0 left-0 grid h-9 w-11 place-items-center rounded-2xl rounded-bl-sm bg-surface font-display text-lg font-black text-accent-ink shadow-card">?</span>
      <span className="portal-bubble absolute right-0 bottom-0 grid h-9 w-11 place-items-center rounded-2xl rounded-br-sm bg-brand font-display text-lg font-black text-brand-fg shadow-card" style={{ "--i": 1 } as CSSProperties}>
        !
      </span>
    </span>
  );
}

/** Home: Aura, ready to take you back. */
export function HomeArt() {
  return (
    <span className="relative">
      <AuraHead size={48} />
      <span className="absolute -right-2 -bottom-2 grid h-6 w-6 place-items-center rounded-lg bg-brand text-brand-fg shadow-card">
        <House size={13} />
      </span>
    </span>
  );
}
