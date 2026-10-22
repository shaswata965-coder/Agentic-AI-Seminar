"use client";

import { ArrowLeft, ArrowRight, Ticket } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Confetti } from "@/components/effects/Confetti";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { ShareButtons } from "@/components/share/ShareButtons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fill } from "@/lib/copy";
import type { CalendarLinks } from "@/lib/event";
import { checkAnswers, emptyAnswer, type Answer, type FormField } from "@/lib/forms";
import type { PageCopy } from "@/lib/schema/page-copy";
import { AnswerFields } from "./AnswerField";
import { Honeypot } from "./fields";
import { Stepper } from "./Stepper";
import { postJson } from "./submit";

const STEP_AURA: AuraVariant[] = ["registration", "thinker", "guide"];

/**
 * Workshop registration in up to three steps, with the fields and texts set in Site settings → Registration →
 * Form fields (a step with no fields shown is left out). Answers are checked here as on the server.
 */
export function RegistrationForm({ fields, text, calendar, shareUrl, eventName }: { fields: FormField[]; text: PageCopy["registerFormText"]; calendar: CalendarLinks; shareUrl: string; eventName: string }) {
  const toast = useToast();
  const shown = useMemo(() => fields.filter((f) => !f.hidden), [fields]);
  const steps = [1, 2, 3].filter((n) => shown.some((f) => f.step === n));
  const names = [text.step1, text.step2, text.step3];
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, Answer>>(() => Object.fromEntries(fields.map((f) => [f.key, emptyAnswer(f.type)])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ regId: string | null; email: string; emailSent: boolean } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const last = step >= steps.length - 1;

  function validate(i: number) {
    const { errors: e } = checkAnswers("register", fields, values, { step: steps[i] });
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
    if (!last) return next();
    if (!validate(step)) return;
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setPending(true);
    const res = await postJson<{ regId: string | null; emailSent: boolean }>("/api/register", { ...values, website: honeypot });
    setPending(false);
    if (!res.ok || !res.data) {
      const fe = res.fieldErrors ?? {};
      setErrors(fe);
      // Back to the first step with a problem.
      const at = steps.findIndex((n) => shown.some((f) => f.step === n && fe[f.key]));
      if (at >= 0) setStep(at);
      toast(res.message ?? "Registration failed", "error");
      return;
    }
    setDone({ regId: res.data.regId, email: typeof values.email === "string" ? values.email : "", emailSent: res.data.emailSent });
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  if (done) {
    const vars = { email: done.email };
    return (
      <div ref={topRef} className="card relative overflow-hidden p-8 text-center sm:p-12" role="status">
        <Confetti />
        <div aria-hidden className="wash pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center">
          <Aura variant="success" size={200} />
          <h2 className="mt-2 font-display text-3xl font-bold text-fg">{text.doneTitle}</h2>
          {done.regId ? (
            <>
              <p className="mt-3 max-w-md text-muted">{text.doneId}</p>
              <p className="mt-2 rounded-2xl bg-surface-2 px-5 py-3 font-display text-2xl font-bold tracking-wider text-brand tabular">{done.regId}</p>
            </>
          ) : null}
          <p className="mt-4 max-w-md text-sm text-muted">{fill(!done.regId ? text.doneQueued : done.emailSent ? text.doneMailed : text.doneNoMail, vars)}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <AddToCalendar links={calendar} />
          </div>
          {text.share ? <ShareButtons className="mt-5 justify-center" url={shareUrl} text={fill(text.shareText, { event: eventName })} label={text.share} /> : null}
        </div>
      </div>
    );
  }

  const current = shown.filter((f) => f.step === steps[step]);
  return (
    <div ref={topRef} className="card scroll-mt-28 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-border bg-surface-2/60 p-5 sm:p-6">
        <Aura variant={STEP_AURA[(steps[step] ?? 1) - 1]} size={78} lite />
        <div className="flex-1">
          {steps.length > 1 ? <Stepper steps={steps.map((n) => names[n - 1])} current={step} /> : null}
          <p className="mt-2 text-sm text-muted">
            {fill(text.progress, { step: step + 1, steps: steps.length })} · {names[(steps[step] ?? 1) - 1]}
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="relative grid gap-5 p-5 sm:p-8">
        <Honeypot />
        <div key={step} className="animate-fade-up">
          <AnswerFields form="register" fields={current} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} errors={errors} optional={text.optional} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft size={17} aria-hidden />}>
              {text.back}
            </Button>
          ) : (
            <span className="text-xs text-subtle">{text.required}</span>
          )}
          {!last ? (
            <Button type="submit" iconRight={<ArrowRight size={17} aria-hidden />}>
              {text.next}
            </Button>
          ) : (
            <Button type="submit" disabled={pending} icon={<Ticket size={18} aria-hidden />}>
              {pending ? text.sending : text.submit}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
