import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { AURA_EYES } from "@/components/aura/presets";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Tone } from "@/lib/content/constants";
import { getPeople, getSettings } from "@/lib/content/queries";
import type { Person } from "@/lib/content/types";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: "Organisers", description: `Faculty organisers, student organisers and volunteers of the ${s.eventName}.`, alternates: { canonical: absoluteUrl("/organisers") } };
}

function Grid({ people, label, tone }: { people: Person[]; label: string; tone: Tone }) {
  return (
    <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
      {people.map((p, i) => (
        <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}>
          <PersonCard
            name={p.name}
            photo={p.photo}
            title={p.role}
            subtitle={[p.department, p.affiliation].filter(Boolean).join(", ")}
            label={label}
            labelTone={tone}
            href={p.profileUrl || undefined}
            linkLabel="Profile page"
            className={`tone-${tone}`}
          />
        </li>
      ))}
    </ul>
  );
}

export default async function OrganisersPage() {
  const people = await getPeople();
  const faculty = people.filter((p) => p.group === "faculty");
  const students = people.filter((p) => p.group === "student");
  const volunteers = people.filter((p) => p.group === "volunteer");
  return (
    <>
      <PageHero
        tone="blush"
        crumb="Organisers"
        eyebrow="The team"
        title="Organisers"
        description={<p>The Agentic AI Workshop 2026 is organised by the Indian Institute of Technology Delhi and the Yardi School of Artificial Intelligence (ScAI), IIT Delhi.</p>}
        auraNode={
          <div className="flex items-end">
            <Aura variant="organisers" size={120} overrides={{ eyeColor: AURA_EYES.lilac, effects: [] }} className="-mr-6" />
            <Aura variant="organisers" size={180} interactive greet="We're the team behind the workshop!" className="relative z-10" />
            <Aura variant="organisers" size={120} overrides={{ eyeColor: AURA_EYES.mint, expression: "wink", pose: "idle", effects: [] }} className="-ml-6" />
          </div>
        }
      />

      <Section tone="lilac" labelledBy="faculty-title">
        <SectionHeading id="faculty-title" eyebrow="Faculty" title="Faculty organisers" />
        <Grid people={faculty} label="Faculty organiser" tone="lilac" />
      </Section>

      <Section tone="mint" labelledBy="students-title" band>
        <SectionHeading id="students-title" eyebrow="Students" title="Student organisers" />
        <Grid people={students} label="Student organiser" tone="mint" />
      </Section>

      <Section tone="butter" labelledBy="volunteers-title">
        <SectionHeading id="volunteers-title" eyebrow="Volunteers" title="Volunteers" description="The friendly faces who keep everything running on the day." />
        {volunteers.length ? (
          <Grid people={volunteers} label="Volunteer" tone="butter" />
        ) : (
          <div className="card relative flex flex-col items-center gap-6 overflow-hidden p-8 text-center sm:flex-row sm:p-10 sm:text-left">
            <div aria-hidden className="wash pointer-events-none absolute inset-0" />
            <div className="relative">
              <Aura variant="volunteers" size={180} interactive />
            </div>
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold tracking-[0.12em] text-accent-ink uppercase">Coming soon</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">The volunteer list is on its way</h3>
              <p className="mt-2 max-w-lg text-muted">Names and photos of our volunteers will appear here soon. Want to help out at the workshop?</p>
              <div className="mt-5">
                <ButtonLink href="/#contact" variant="soft" icon={<HeartHandshake size={18} aria-hidden />}>
                  Volunteer with us
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
