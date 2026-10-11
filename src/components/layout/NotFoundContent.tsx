import { ArrowRight } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { ButtonLink } from "@/components/ui/Button";

export function NotFoundContent() {
  return (
    <section className="tone-lilac relative isolate overflow-hidden">
      <div aria-hidden className="wash absolute inset-0 -z-10" />
      <div className="container-site flex flex-col items-center py-20 text-center sm:py-28">
        <Aura variant="notFound" size={230} interactive greet="Hmm… I can't find that page anywhere." />
        <p className="mt-6 font-display text-7xl font-black text-[color-mix(in_oklab,var(--accent)_70%,var(--fg))]">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">This page wandered off into latent space</h1>
        <p className="mt-3 max-w-lg text-muted">The link may be broken or the page may have moved. Here are some places Aura can take you instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/programme" variant="outline" iconRight={<ArrowRight size={17} aria-hidden />}>
            Programme
          </ButtonLink>
          <ButtonLink href="/hackathon" variant="outline" iconRight={<ArrowRight size={17} aria-hidden />}>
            Hackathon
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
