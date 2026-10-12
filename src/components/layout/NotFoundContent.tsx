import { Aura } from "@/components/aura/Aura";
import { HomeArt, ScheduleArt, TrophyArt } from "@/components/portals/PortalArt";
import { Portal } from "@/components/ui/Portal";

export function NotFoundContent() {
  return (
    <section className="tone-lilac relative isolate overflow-hidden">
      <div aria-hidden className="wash absolute inset-0 -z-10" />
      <div className="container-site flex flex-col items-center py-20 text-center sm:py-28">
        <Aura variant="notFound" size={230} interactive greet="Hmm… I can't find that page anywhere." entrance="load" />
        <p className="mt-6 font-display text-7xl font-black text-[color-mix(in_oklab,var(--accent)_70%,var(--fg))]">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">This page wandered off into latent space</h1>
        <p className="mt-3 max-w-lg text-muted">The link may be broken or the page may have moved. Here are some places Aura can take you instead.</p>
        <div className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <Portal href="/" tone="lilac" compact kicker="Home" title="Back to the start" art={<HomeArt />} />
          <Portal href="/programme" tone="azure" compact kicker="Programme" title="The two days" art={<ScheduleArt />} />
          <Portal href="/hackathon" tone="aqua" compact kicker="Hackathon" title="Tracks and prizes" art={<TrophyArt />} />
        </div>
      </div>
    </section>
  );
}
