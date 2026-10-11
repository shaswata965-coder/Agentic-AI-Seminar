import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";

export function PageHero({
  eyebrow,
  title,
  description,
  aura,
  auraNode,
  tone = "azure",
  crumb,
  children,
  greet = true,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  aura?: AuraVariant;
  /** Custom illustration instead of a single Aura. */
  auraNode?: ReactNode;
  tone?: Tone;
  crumb: string;
  children?: ReactNode;
  greet?: boolean;
}) {
  return (
    <section className={cn(`tone-${tone}`, "relative isolate overflow-hidden border-b border-border")}>
      <div aria-hidden className="wash absolute inset-0 -z-10" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(70%_80%_at_70%_40%,black,transparent)]" />
      <div className="container-site grid items-center gap-6 py-10 sm:py-14 md:grid-cols-[1fr_auto] md:gap-10">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm text-subtle">
              <li>
                <Link href="/" className="font-medium hover:text-fg">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="font-semibold text-fg">
                {crumb}
              </li>
            </ol>
          </nav>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-fg sm:text-5xl lg:text-6xl">{title}</h1>
          {description ? <div className="mt-5 max-w-2xl text-lg text-muted">{description}</div> : null}
          {children ? <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>
        <div className="mx-auto md:mx-0">{auraNode ?? (aura ? <Aura variant={aura} size={230} interactive greet={greet} bubbleSide="left" entrance="load" className="max-w-[60vw]" /> : null)}</div>
      </div>
    </section>
  );
}
