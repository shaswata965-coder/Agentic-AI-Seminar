import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { AURA_EYES } from "@/components/aura/presets";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import type { Tone } from "@/lib/content/constants";
import { getPeople, getSettings } from "@/lib/content/queries";
import type { Person } from "@/lib/content/types";
import { copy } from "@/lib/copy";
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
  const [s, people] = await Promise.all([getSettings(), getPeople()]);
  const faculty = people.filter((p) => p.group === "faculty");
  const students = people.filter((p) => p.group === "student");
  const volunteers = people.filter((p) => p.group === "volunteer");
  const hero = copy(s, "organisersHero");
  const fa = copy(s, "organisersFaculty");
  const stu = copy(s, "organisersStudents");
  const vo = copy(s, "organisersVolunteers");
  return (
    <TagScope style="underline">
      <PageHero
        edit="organisers.hero"
        home={s.siteNav.home}
        tone={hero.tone}
        crumb={hero.crumb}
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        auraNode={
          <div className="flex items-end">
            <Aura variant="organisers" size={120} overrides={{ eyeColor: AURA_EYES.lilac, effects: [] }} entrance="load" entranceFrom="left" entranceDelay={0.45} className="-mr-6" />
            <Aura variant="organisers" size={180} interactive greet={hero.greeting || true} entrance="load" entranceFrom="top" entranceDelay={0.2} className="relative z-10" />
            <Aura variant="organisers" size={120} overrides={{ eyeColor: AURA_EYES.mint, expression: "wink", pose: "idle", effects: [] }} entrance="load" entranceDelay={0.65} className="-ml-6" />
          </div>
        }
      />

      <Section edit="organisers.faculty" tone={fa.tone} bg={fa.background} labelledBy="faculty-title">
        <SectionHeading id="faculty-title" eyebrow={fa.eyebrow} title={fa.title} />
        <Grid people={faculty} label={fa.card} tone={fa.tone} />
      </Section>

      <Section edit="organisers.students" tone={stu.tone} bg={stu.background} labelledBy="students-title">
        <SectionHeading id="students-title" eyebrow={stu.eyebrow} title={stu.title} />
        <Grid people={students} label={stu.card} tone={stu.tone} />
      </Section>

      <Section edit="organisers.volunteers" tone={vo.tone} bg={vo.background} labelledBy="volunteers-title">
        <SectionHeading id="volunteers-title" eyebrow={vo.eyebrow} title={vo.title} description={vo.description} />
        {volunteers.length ? (
          <Grid people={volunteers} label={vo.card} tone={vo.tone} />
        ) : (
          <div className="card relative flex flex-col items-center gap-6 overflow-hidden p-8 text-center sm:flex-row sm:p-10 sm:text-left">
            <div aria-hidden className="wash pointer-events-none absolute inset-0" />
            <div className="relative">
              <Aura variant="volunteers" size={180} interactive />
            </div>
            <div className="relative">
              {vo.emptyBadge ? <p className="tag tag-eyebrow">{vo.emptyBadge}</p> : null}
              <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">{vo.emptyTitle}</h3>
              {vo.emptyText ? <p className="mt-2 max-w-lg text-muted">{vo.emptyText}</p> : null}
              {vo.emptyButton ? (
                <div className="mt-5">
                  <ButtonLink href="/#contact" variant="soft" icon={<HeartHandshake size={18} aria-hidden />}>
                    {vo.emptyButton}
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Section>
    </TagScope>
  );
}
