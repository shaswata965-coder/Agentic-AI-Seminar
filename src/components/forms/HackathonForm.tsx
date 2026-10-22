"use client";

import { ArrowLeft, ArrowRight, Plus, Rocket, Trash, UserRound } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Confetti } from "@/components/effects/Confetti";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fill } from "@/lib/copy";
import { answered, checkAnswers, emptyAnswer, type Answer, type FormField } from "@/lib/forms";
import type { PageCopy } from "@/lib/schema/page-copy";
import { AnswerFields } from "./AnswerField";
import { Honeypot } from "./fields";
import { Stepper } from "./Stepper";
import { postJson } from "./submit";

const STEP_AURA: AuraVariant[] = ["hackathon", "organisers", "answer"];
const MAX_MEMBERS = 6;

type Values = Record<string, Answer>;

/** Whether anything was typed for a member other than the lead (an untouched row is left out). */
const started = (m: Values) => Object.values(m).some(answered);

/**
 * Team registration in three steps: the team (its first-step fields), its members (each with the member fields)
 * and the idea (the team's last-step fields), all as set in Site settings → Hackathon → Team form. There is one
 * track, so a team only names itself: every team answers `question` (after `questionNote`).
 */
export function HackathonForm({ question, questionNote, teamFields, memberFields, text }: { question: string; questionNote: string; teamFields: FormField[]; memberFields: FormField[]; text: PageCopy["hackathonFormText"] }) {
  const toast = useToast();
  const steps = [text.step1, text.step2, text.step3];
  const blank = useMemo(() => () => Object.fromEntries(memberFields.map((f) => [f.key, emptyAnswer(f.type)])) as Values, [memberFields]);
  const [step, setStep] = useState(0);
  const [team, setTeam] = useState<Values>(() => Object.fromEntries(teamFields.map((f) => [f.key, emptyAnswer(f.type)])));
  const [members, setMembers] = useState<Values[]>(() => [blank(), blank()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ regId: string; emailSent: boolean } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const setMember = (i: number, k: string, v: Answer) => setMembers((list) => list.map((m, j) => (j === i ? { ...m, [k]: v } : m)));
  const shownTeam = (n: number) => teamFields.filter((f) => !f.hidden && f.step === n);

  function validate(i: number) {
    let e: Record<string, string> = {};
    if (i === 0) e = checkAnswers("hackathonTeam", teamFields, team, { step: 1 }).errors;
    if (i === 2) e = checkAnswers("hackathonTeam", teamFields, team, { step: 2 }).errors;
    if (i === 1) {
      members.forEach((m, j) => {
        if (j > 0 && !started(m)) return;
        for (const [k, v] of Object.entries(checkAnswers("hackathonMember", memberFields, m, { lead: j === 0 }).errors)) e[`members.${j}.${k}`] = v;
      });
      const emails = members.map((m) => (typeof m.email === "string" ? m.email.trim().toLowerCase() : "")).filter(Boolean);
      if (new Set(emails).size !== emails.length) e["members.0.email"] = "Each member needs a different e-mail address.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < steps.length - 1) return next();
    if (!validate(step)) return;
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setPending(true);
    const res = await postJson<{ regId: string; emailSent: boolean }>("/api/hackathon/register", {
      ...team,
      members: members.filter((m, j) => j === 0 || started(m)),
      website: honeypot,
    });
    setPending(false);
    if (!res.ok || !res.data) {
      const fe = res.fieldErrors ?? {};
      setErrors(fe);
      if (Object.keys(fe).some((k) => k.startsWith("members."))) setStep(1);
      else if (shownTeam(1).some((f) => fe[f.key])) setStep(0);
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
          <h2 className="mt-2 font-display text-3xl font-bold text-fg">{text.doneTitle}</h2>
          <p className="mt-3 text-muted">{text.doneId}</p>
          <p className="mt-2 rounded-2xl bg-surface-2 px-5 py-3 font-display text-2xl font-bold tracking-wider text-brand tabular">{done.regId}</p>
          <p className="mt-4 max-w-md text-sm text-muted">
            {done.emailSent ? text.doneMailed : text.doneNoMail} {text.doneNext}
          </p>
          {text.doneButton ? (
            <div className="mt-6">
              <ButtonLink href="/hackathon#timeline" variant="outline">
                {text.doneButton}
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="card scroll-mt-28 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-border bg-surface-2/60 p-5 sm:p-6">
        <Aura variant={STEP_AURA[step]} size={78} lite />
        <div className="flex-1">
          <Stepper steps={steps} current={step} />
          <p className="mt-2 text-sm text-muted">
            {fill(text.progress, { step: step + 1, steps: steps.length })} · {steps[step]}
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="relative grid gap-5 p-5 sm:p-8">
        <Honeypot />
        {step === 0 || step === 2 ? (
          <div key={step} className="grid animate-fade-up gap-5">
            <AnswerFields form="hackathonTeam" fields={shownTeam(step === 0 ? 1 : 2)} values={team} onChange={(k, v) => setTeam((t) => ({ ...t, [k]: v }))} errors={errors} optional={text.optional} />
            {step === 0 && question ? (
              <p className="rounded-2xl bg-accent-soft p-4 text-sm text-muted">
                {questionNote} <strong className="font-display text-base font-bold text-fg">“{question}”</strong>
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid animate-fade-up gap-4">
            {members.map((m, i) => (
              <fieldset key={i} className="rounded-2xl border border-border p-4 sm:p-5">
                <legend className="flex items-center gap-2 px-1 text-sm font-bold text-fg">
                  <UserRound size={16} aria-hidden className="text-subtle" />
                  {i === 0 ? text.lead : fill(text.member, { n: i + 1 })}
                </legend>
                <AnswerFields
                  form="hackathonMember"
                  // Other members: a field required for the lead only is optional for them.
                  fields={memberFields.filter((f) => !f.hidden).map((f) => (i > 0 && f.leadOnly ? { ...f, required: false } : f))}
                  values={m}
                  onChange={(k, v) => setMember(i, k, v)}
                  errors={errors}
                  prefix={`members.${i}.`}
                  optional={text.optional}
                />
                {i > 0 ? (
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => setMembers((list) => list.filter((_, j) => j !== i))} className="group mi-link inline-flex items-center gap-1.5 text-sm font-semibold text-blush-ink">
                      <Trash size={15} aria-hidden className="origin-bottom group-hover:animate-[mi-wiggle_0.5s_ease-in-out]" /> {text.removeMember}
                    </button>
                  </div>
                ) : null}
              </fieldset>
            ))}
            {members.length < MAX_MEMBERS ? (
              <Button variant="outline" onClick={() => setMembers((list) => [...list, blank()])} icon={<Plus size={17} aria-hidden />} className="justify-self-start">
                {text.addMember}
              </Button>
            ) : null}
            {text.membersNote ? <p className="text-xs text-subtle">{text.membersNote}</p> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft size={17} aria-hidden />}>
              {text.back}
            </Button>
          ) : (
            <span className="text-xs text-subtle">{text.required}</span>
          )}
          {step < steps.length - 1 ? (
            <Button type="submit" iconRight={<ArrowRight size={17} aria-hidden />}>
              {text.next}
            </Button>
          ) : (
            <Button type="submit" disabled={pending} icon={<Rocket size={18} aria-hidden />}>
              {pending ? text.sending : text.submit}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
