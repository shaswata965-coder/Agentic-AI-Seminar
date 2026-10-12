"use client";

import { Car, Landmark, Navigation, Plane, RotateCcw, School, TrainFront, TramFront, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AuraHead } from "@/components/aura/AuraHead";
import { SlidingPill, useSlidingPill } from "@/components/ui/SlidingPill";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/lib/content/types";
import { AIRPORT, AREA_LABELS, CAMPUS, GREEN, MAP_H, MAP_W, METRO, PLACES, RIVER, ROADS, ROUTES, RUNWAYS, VENUE, type Mode, type Place, type PlaceKind } from "./delhi-map";
import { routeUrl } from "./links";

const MODE: Record<Mode, { Icon: LucideIcon; label: string; hint: string }> = {
  air: { Icon: Plane, label: "By air", hint: "IGI Airport" },
  rail: { Icon: TrainFront, label: "By train", hint: "New Delhi · Nizamuddin" },
  metro: { Icon: TramFront, label: "By metro", hint: "Yellow & Magenta lines" },
  road: { Icon: Car, label: "By road", hint: "Cab, auto or car" },
};

const KIND_ICON: Record<PlaceKind, LucideIcon> = { venue: School, air: Plane, rail: TrainFront, metro: TramFront, road: Car, sight: Landmark };

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/**
 * The home page's Venue & travel map: a schematic of South and Central Delhi with IIT Delhi in it.
 * Pick how you are arriving (the routes come from Site settings → Venue & travel → Directions) and
 * a small Aura travels the route to campus, drawing it as she goes; the metro lines that matter
 * light up. Pins on the map pick a route too. Without JavaScript or with reduced motion the route
 * is simply drawn. `children` go under the map and the route (the venue card on the home page).
 */
export function VenueMap({ directions, query, children }: { directions: SiteSettings["directions"]; query: string; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const [seen, setSeen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const agents = useRef<(HTMLSpanElement | null)[]>([]);
  const { listRef, pillRef } = useSlidingPill<HTMLDivElement>(active, '[aria-pressed="true"]');

  const current = directions[Math.min(active, directions.length - 1)];
  const mode: Mode = current && current.mode in ROUTES ? current.mode : "road";
  const routes = ROUTES[mode];
  const lines = new Set(routes.flatMap((r) => r.lines));
  const origins = new Set(routes.map((r) => r.from));

  // Start the first trip when the map scrolls into view.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setSeen(true);
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Travel the route: draw it from the start and move Aura along it, then mark the arrival.
  useEffect(() => {
    const el = stage.current;
    const ps = paths.current.slice(0, routes.length);
    if (!el || ps.some((p) => !p)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lens = ps.map((p) => p!.getTotalLength());
    const place = (t: number) => {
      root.current?.style.setProperty("--trip", String(t));
      ps.forEach((p, i) => {
        p!.style.strokeDashoffset = String(1 - t);
        const a = agents.current[i];
        if (!a) return;
        const pt = p!.getPointAtLength(t * lens[i]);
        a.style.left = pct(pt.x, MAP_W);
        a.style.top = pct(pt.y, MAP_H);
      });
    };
    delete el.dataset.arrived;
    if (reduce) {
      place(1);
      el.dataset.arrived = "";
      return;
    }
    place(0);
    if (!seen) return;
    el.dataset.travelling = "";
    // A gentle pace: about 2.4–3.6 s depending on the trip.
    const duration = Math.min(3600, 1500 + Math.max(...lens) * 2.6);
    const start = performance.now() + 250;
    let raf = 0;
    const frame = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      place(ease(t));
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        delete el.dataset.travelling;
        el.dataset.arrived = "";
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      delete el.dataset.travelling;
    };
  }, [mode, routes.length, run, seen]);

  const pick = (i: number) => {
    setActive(i);
    setRun((r) => r + 1);
  };
  const pickMode = (m: Mode) => {
    const i = directions.findIndex((d) => d.mode === m);
    if (i >= 0) pick(i);
  };

  const plan = routeUrl(query, mode);
  const fromLabel = routes.map((r) => PLACES.find((p) => p.id === r.from)?.label).filter(Boolean).join(" or ");
  const availableModes = new Set(directions.map((d) => d.mode));
  const ModeIcon = MODE[mode].Icon;

  const pin = (p: Place) => {
    const mine = origins.has(p.id);
    const Icon = KIND_ICON[p.kind];
    const clickable = p.kind !== "sight" && availableModes.has(p.kind as Mode);
    const Tag = clickable ? "button" : "span";
    return (
      <Tag
        key={p.id}
        {...(clickable ? { type: "button" as const, tabIndex: -1, onClick: () => pickMode(p.kind as Mode) } : null)}
        className={cn("group/pin absolute z-10 -translate-x-1/2 -translate-y-1/2", !mine && "max-sm:hidden")}
        style={{ left: pct(p.at[0], MAP_W), top: pct(p.at[1], MAP_H) }}
      >
        <span
          className={cn(
            "grid place-items-center rounded-full border shadow-card transition-[background-color,color,scale,border-color] duration-300",
            p.kind === "sight" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-7 w-7 sm:h-8 sm:w-8",
            mine ? "scale-110 border-transparent bg-brand text-brand-fg" : "border-border bg-surface text-muted group-hover/pin:scale-110 group-hover/pin:text-brand",
          )}
        >
          <Icon size={p.kind === "sight" ? 13 : 15} aria-hidden />
        </span>
        <span
          className={cn(
            "venue-pin-label pointer-events-none absolute rounded-full border border-border bg-surface/95 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-fg shadow-card backdrop-blur sm:text-xs",
            mine ? "opacity-100" : "opacity-0 transition-opacity group-hover/pin:opacity-100",
          )}
          data-side={p.side ?? "right"}
        >
          {p.label}
        </span>
      </Tag>
    );
  };

  if (!directions.length) return null;

  return (
    <div ref={root} className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-6">
      {/* How are you arriving? (first on phones, top right on desktop) */}
      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        <p id="arrive-label" className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">
          How are you arriving?
        </p>
        <div ref={listRef} role="group" aria-labelledby="arrive-label" className="group/seg relative isolate mt-3 grid grid-cols-2 gap-1.5 rounded-3xl border border-border bg-surface p-1.5 shadow-card sm:grid-cols-4 lg:grid-cols-2">
          <SlidingPill pillRef={pillRef} shape="rounded-[1.1rem]" className="bg-accent-soft ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset" />
          {directions.map((d, i) => {
            const m = MODE[d.mode] ?? MODE.road;
            const on = i === active;
            return (
              <button
                key={`${d.mode}-${i}`}
                type="button"
                aria-pressed={on}
                onClick={() => pick(i)}
                data-ripple=""
                className={cn(
                  "group/chip relative flex min-w-0 items-center gap-2.5 rounded-[1.1rem] px-3 py-2.5 text-left transition-colors duration-200",
                  on
                    ? "bg-accent-soft ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset group-data-[pill=on]/seg:bg-transparent group-data-[pill=on]/seg:ring-0"
                    : "hover:bg-surface-2",
                )}
              >
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-[background-color,color,rotate] duration-300", on ? "bg-brand text-brand-fg" : "bg-surface-2 text-muted group-hover/chip:-rotate-6 group-hover/chip:text-fg")}>
                  <m.Icon size={18} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-sm font-semibold", on ? "text-accent-ink" : "text-fg")}>{m.label}</span>
                  <span className="block truncate text-xs text-subtle max-sm:hidden">{MODE[d.mode]?.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The map */}
      <div className="card relative min-w-0 overflow-hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <div ref={stage} className="venue-stage relative w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
            <defs>
              <pattern id="venue-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.4" className="fill-[color-mix(in_oklab,var(--fg)_9%,transparent)]" />
              </pattern>
            </defs>
            <rect width={MAP_W} height={MAP_H} className="fill-[color-mix(in_oklab,var(--accent-soft)_45%,var(--surface))]" />
            <rect width={MAP_W} height={MAP_H} fill="url(#venue-dots)" />

            <path d={AIRPORT} className="fill-[color-mix(in_oklab,var(--fg)_6%,var(--surface))]" />
            {RUNWAYS.map((d, i) => (
              <path key={i} d={d} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-[color-mix(in_oklab,var(--fg)_16%,var(--surface))]" />
            ))}
            {GREEN.map((d, i) => (
              <path key={i} d={d} className="fill-[color-mix(in_oklab,var(--mint)_34%,var(--surface))]" />
            ))}
            <path d={RIVER} fill="none" strokeWidth="20" strokeLinecap="round" className="stroke-[color-mix(in_oklab,var(--azure)_50%,var(--surface))]" />

            {ROADS.map((r) => (
              <g key={r.id} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d={r.d} strokeWidth={r.major ? 9 : 6} className={cn("transition-[stroke] duration-500", mode === "road" ? "stroke-[color-mix(in_oklab,var(--peach)_80%,var(--surface))]" : "stroke-border-strong")} />
                <path d={r.d} strokeWidth={r.major ? 5 : 3} className="stroke-surface" />
              </g>
            ))}

            {METRO.map((l) => {
              const lit = lines.has(l.id);
              return (
                <g key={l.id} className="transition-opacity duration-500" opacity={lit ? 1 : 0.32}>
                  <path d={l.d} fill="none" stroke={l.color} strokeWidth={lit ? 6 : 4.5} strokeLinecap="round" strokeLinejoin="round" />
                  {l.stations.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={lit ? 5.5 : 4} strokeWidth="3" stroke={l.color} className="fill-surface" />
                  ))}
                </g>
              );
            })}

            <path d={CAMPUS} strokeWidth="2.5" strokeDasharray="6 5" className="fill-[color-mix(in_oklab,var(--brand)_16%,var(--surface))] stroke-[color-mix(in_oklab,var(--brand)_55%,transparent)]" />

            <g className="max-sm:hidden">
              {AREA_LABELS.map((a) => (
                <text
                  key={a.label}
                  x={a.at[0]}
                  y={a.at[1]}
                  textAnchor="middle"
                  transform={a.rotate ? `rotate(${a.rotate} ${a.at[0]} ${a.at[1]})` : undefined}
                  className="fill-subtle font-sans text-[15px] font-semibold tracking-[0.14em] uppercase opacity-70"
                >
                  {a.label}
                </text>
              ))}
            </g>

            {/* The route being travelled: a faint guide, a glow and the line Aura draws. */}
            {routes.map((r, i) => (
              <g key={`${mode}-${i}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d={r.d} strokeWidth="4" strokeDasharray="1 12" className="stroke-brand opacity-50" />
                <path
                  ref={(el) => {
                    paths.current[i] = el;
                  }}
                  d={r.d}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeWidth="7"
                  className="venue-route stroke-brand"
                />
              </g>
            ))}
          </svg>

          {PLACES.map(pin)}

          {/* The venue */}
          <span className="venue-home pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(VENUE.at[0], MAP_W), top: pct(VENUE.at[1], MAP_H) }}>
            <span aria-hidden className="absolute inset-0 animate-ping-soft rounded-full bg-[color-mix(in_oklab,var(--brand)_40%,transparent)]" />
            <span aria-hidden className="venue-arrive absolute -inset-3 rounded-full border-2 border-brand opacity-0" />
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-fg shadow-card-lg ring-4 ring-surface sm:h-11 sm:w-11">
              <School size={19} aria-hidden />
            </span>
            <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-full bg-fg px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-bg shadow-card sm:text-xs">
              {VENUE.label} · venue
            </span>
          </span>

          {/* Aura, travelling */}
          {routes.map((_, i) => (
            <span
              key={`${mode}-agent-${i}`}
              ref={(el) => {
                agents.current[i] = el;
              }}
              aria-hidden
              className="venue-agent pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[70%]"
            >
              <span className="block rounded-full bg-surface p-1 shadow-[0_0_0_5px_color-mix(in_oklab,var(--brand)_22%,transparent),0_8px_20px_-6px_rgb(15_23_42/0.4)]">
                <AuraHead size={30} />
              </span>
            </span>
          ))}

          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            data-ripple=""
            className="group/replay key key-line absolute top-2.5 right-2.5 z-40 inline-flex items-center gap-1.5 rounded-[0.65rem] border border-border-strong bg-surface/90 px-2 py-2 text-xs font-semibold text-fg backdrop-blur hover:border-brand hover:text-brand sm:px-3 sm:py-1.5"
          >
            <RotateCcw size={14} aria-hidden className="transition-transform duration-500 group-hover/replay:-rotate-180" />
            <span className="max-sm:sr-only">Replay route</span>
          </button>
        </div>

        <ul aria-label="Map key" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 text-xs text-muted">
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1 w-5 rounded-full bg-brand" /> Your route
          </li>
          {METRO.map((l) => (
            <li key={l.id} className={cn("inline-flex items-center gap-1.5 transition-opacity", lines.has(l.id) ? "font-semibold text-fg" : "opacity-70")}>
              <span aria-hidden className="h-1 w-5 rounded-full" style={{ background: l.color }} /> {l.name}
            </li>
          ))}
          <li className={cn("inline-flex items-center gap-1.5 transition-opacity", mode === "road" ? "font-semibold text-fg" : "opacity-70")}>
            <span aria-hidden className={cn("h-1.5 w-5 rounded-full border bg-surface", mode === "road" ? "border-[color-mix(in_oklab,var(--peach)_80%,var(--surface))]" : "border-border-strong")} /> Main roads
          </li>
          <li className="text-subtle sm:ml-auto">Schematic, not to scale</li>
        </ul>
      </div>

      {/* The route, in words */}
      <div className="min-w-0 lg:col-start-2 lg:row-start-2">
        <div key={active} className="card flex h-full animate-fade-up flex-col items-stretch p-6" aria-live="polite">
          <h3 className="font-display text-xl font-semibold text-fg">{current.title}</h3>
          {/* The trip so far: follows Aura on the map through --trip (0 → 1). */}
          <div aria-hidden className="mt-4 flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
              <ModeIcon size={15} />
            </span>
            <span className="relative h-1.5 flex-1 rounded-full bg-surface-2">
              <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: "calc(var(--trip, 1) * 100%)" }} />
              <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface p-0.5 shadow-card" style={{ left: "calc(var(--trip, 1) * 100%)" }}>
                <AuraHead size={20} />
              </span>
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-brand-fg">
              <School size={15} />
            </span>
          </div>
          <p className="mt-2 flex justify-between gap-4 text-xs font-semibold text-subtle">
            <span>{fromLabel || MODE[mode].label}</span>
            <span className="sr-only"> to </span>
            <span className="shrink-0 text-right">{VENUE.label}</span>
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{current.details}</p>
          {lines.size ? (
            <ul aria-label="Metro lines" className="mt-4 flex flex-wrap gap-2">
              {METRO.filter((l) => lines.has(l.id)).map((l) => (
                <li key={l.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-fg">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: l.color } as CSSProperties} />
                  {l.name}
                </li>
              ))}
            </ul>
          ) : null}
          <a href={plan} target="_blank" rel="noopener noreferrer" className="group/plan mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-ink lg:mt-auto lg:pt-5">
            <Navigation size={15} aria-hidden className="transition-transform duration-300 group-hover/plan:-translate-y-0.5 group-hover/plan:translate-x-0.5" />
            <span className="mi-underline">Plan this route in Google Maps</span>
          </a>
        </div>
      </div>
      {children ? <div className="min-w-0 lg:col-span-2">{children}</div> : null}
    </div>
  );
}
