"use client";

import { useEffect } from "react";
import { Aura } from "@/components/aura/Aura";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="tone-blush">
      <div className="container-site flex flex-col items-center py-24 text-center">
        <Aura variant="error" size={210} />
        <h1 className="mt-4 font-display text-3xl font-bold text-fg">Oops, something glitched</h1>
        <p className="mt-2 max-w-md text-muted">Aura tripped over a wire. Please try again. If it keeps happening, let the organisers know.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
        {error.digest ? <p className="mt-6 text-xs text-subtle">Error reference: {error.digest}</p> : null}
      </div>
    </section>
  );
}
