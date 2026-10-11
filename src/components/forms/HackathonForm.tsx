"use client";

import { ArrowLeft, ArrowRight, Plus, Rocket, Trash, UserRound } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Confetti } from "@/components/effects/Confetti";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CheckboxField, Honeypot, SelectField, TextAreaField, TextField } from "./fields";
import { Stepper } from "./Stepper";
import { postJson } from "./submit";

const STEPS = ["Team", "Members", "Idea"];
const STEP_AURA: AuraVariant[] = ["hackathon", "organisers", "entrepreneurship"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MEMBERS = 6;

interface Member {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  role: string;
}
const blank = (): Member => ({ name: "", email: "", phone: "", organisation: "", role: "" });

export function HackathonForm({ tracks }: { tracks: { value: string; label: string }[] }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [team, setTeam] = useState({ teamName: "", track: "" });
  const [members, setMembers] = useState<Member[]>([blank(), blank()]);
  const [idea, setIdea] = useState({ ideaTitle: "", ideaSummary: "", githubUrl: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ regId: string; emailSent: boolean } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const setMember = (i: number, k: keyof Member, v: string) => setMembers((list) => list.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  function validate(i: number) {
    const e: Record<string, string> = {};
    if (i === 0) {
      if (team.teamName.trim().length < 2) e.teamName = "Please choose a team name.";
      if (!team.track) e.track = "Please pick a track (you can choose “Undecided”).";
    }
    if (i === 1) {
      members.forEach((m, j) => {
        const filled = Object.values(m).some((v) => v.trim());
        if (j === 0 || filled) {
          if (!m.name.trim()) e[`members.${j}.name`] = "Name is required.";
          if (!EMAIL.test(m.email.trim())) e[`members.${j}.email`] = "Valid e-mail required.";
          if (j === 0 && !m.phone.trim()) e[`members.${j}.phone`] = "The team lead's phone is required.";
          if (!m.organisation.trim()) e[`members.${j}.organisation`] = "Institution / organisation required.";
        }
      });
      const emails = members.map((m) => m.email.trim().toLowerCase()).filter(Boolean);
      if (new Set(emails).size !== emails.length) e["members.0.email"] = "Each member needs a different e-mail address.";
    }
    if (i === 2) {
      if (idea.githubUrl && !/^https?:\/\//.test(idea.githubUrl)) e.githubUrl = "Please enter a full URL starting with https://";
      if (!idea.consent) e.consent = "Please accept the rules and code of conduct.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validate(step)) return;
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setPending(true);
    const res = await postJson<{ regId: string; emailSent: boolean }>("/api/hackathon/register", {
      ...team,
      ...idea,
      members: members.filter((m, j) => j === 0 || Object.values(m).some((v) => v.trim())),
      website: honeypot,
    });
    setPending(false);
    if (!res.ok || !res.data) {
      setErrors(res.fieldErrors ?? {});
      if (res.fieldErrors?.teamName) setStep(0);
      toast(res.message ?? "Registration failed", "error");
      return;
    }
    setDone(res.data);
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  if (done) {
    return (
      <div ref={topRef} className="card relative overflow-hidden p-8 text-center sm:p-12" role="status">
        <Confetti />
        <div className="relative flex flex-col items-center">
          <Aura variant="trophy" size={200} />
          <h2 className="mt-2 font-display text-3xl font-bold text-fg">Team registered!</h2>
          <p className="mt-3 text-muted">Your team registration ID is</p>
          <p className="mt-2 rounded-2xl bg-surface-2 px-5 py-3 font-display text-2xl font-bold tracking-wider text-brand tabular">{done.regId}</p>
          <p className="mt-4 max-w-md text-sm text-muted">
            {done.emailSent ? "We've e-mailed a confirmation to the team lead." : "Please note this ID — the organisers will contact your team lead."} Watch the Hackathon page for the idea-submission date.
          </p>
          <div className="mt-6">
            <ButtonLink href="/hackathon" variant="outline">
              Back to the hackathon
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="card scroll-mt-28 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-border bg-surface-2/60 p-5 sm:p-6">
        <Aura variant={STEP_AURA[step]} size={78} lite />
        <div className="flex-1">
          <Stepper steps={STEPS} current={step} />
          <p className="mt-2 text-sm text-muted">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="relative grid gap-5 p-5 sm:p-8">
        <Honeypot />
        {step === 0 ? (
          <div className="grid animate-fade-up gap-5 sm:grid-cols-2">
            <TextField label="Team name" required value={team.teamName} onChange={(e) => setTeam({ ...team, teamName: e.target.value })} error={errors.teamName} maxLength={60} />
            <SelectField label="Track" required placeholder="Choose a track" value={team.track} onChange={(e) => setTeam({ ...team, track: e.target.value })} error={errors.track} options={[...tracks, { value: "undecided", label: "Undecided — we'll pick later" }]} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid animate-fade-up gap-4">
            {members.map((m, i) => (
              <fieldset key={i} className="rounded-2xl border border-border p-4 sm:p-5">
                <legend className="flex items-center gap-2 px-1 text-sm font-bold text-fg">
                  <UserRound size={16} aria-hidden className="text-subtle" />
                  {i === 0 ? "Team lead" : `Member ${i + 1}`}
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Name" required={i === 0 || undefined} value={m.name} onChange={(e) => setMember(i, "name", e.target.value)} error={errors[`members.${i}.name`]} maxLength={120} />
                  <TextField label="E-mail" type="email" required={i === 0 || undefined} value={m.email} onChange={(e) => setMember(i, "email", e.target.value)} error={errors[`members.${i}.email`]} maxLength={160} />
                  <TextField label="Phone" type="tel" required={i === 0 || undefined} value={m.phone} onChange={(e) => setMember(i, "phone", e.target.value)} error={errors[`members.${i}.phone`]} maxLength={30} />
                  <TextField label="Institution / organisation" required={i === 0 || undefined} value={m.organisation} onChange={(e) => setMember(i, "organisation", e.target.value)} error={errors[`members.${i}.organisation`]} maxLength={160} />
                </div>
                {i > 0 ? (
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => setMembers((list) => list.filter((_, j) => j !== i))} className="group mi-link inline-flex items-center gap-1.5 text-sm font-semibold text-blush-ink">
                      <Trash size={15} aria-hidden className="origin-bottom group-hover:animate-[mi-wiggle_0.5s_ease-in-out]" /> Remove member
                    </button>
                  </div>
                ) : null}
              </fieldset>
            ))}
            {members.length < MAX_MEMBERS ? (
              <Button variant="outline" onClick={() => setMembers((list) => [...list, blank()])} icon={<Plus size={17} aria-hidden />} className="justify-self-start">
                Add a member
              </Button>
            ) : null}
            <p className="text-xs text-subtle">Final team-size limits will be announced with the rules. Members other than the lead are optional for now.</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid animate-fade-up gap-5">
            <TextField label="Idea title" value={idea.ideaTitle} onChange={(e) => setIdea({ ...idea, ideaTitle: e.target.value })} maxLength={120} />
            <TextAreaField label="Idea summary" rows={5} value={idea.ideaSummary} onChange={(e) => setIdea({ ...idea, ideaSummary: e.target.value })} hint="A few lines on the problem and your agent. You can refine it at the idea-submission stage." maxLength={1500} />
            <TextField label="GitHub / project link" type="url" value={idea.githubUrl} onChange={(e) => setIdea({ ...idea, githubUrl: e.target.value })} error={errors.githubUrl} placeholder="https://github.com/…" maxLength={300} />
            <CheckboxField
              label="We accept the hackathon rules and code of conduct"
              description="We confirm the details above are correct and agree to be contacted about the hackathon."
              checked={idea.consent}
              onChange={(e) => setIdea({ ...idea, consent: e.target.checked })}
              error={errors.consent}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft size={17} aria-hidden />}>
              Back
            </Button>
          ) : (
            <span className="text-xs text-subtle">Fields marked * are required.</span>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="submit" iconRight={<ArrowRight size={17} aria-hidden />}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={pending} icon={<Rocket size={18} aria-hidden />}>
              {pending ? "Registering…" : "Register team"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
