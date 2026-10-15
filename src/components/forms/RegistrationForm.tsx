"use client";

import { ArrowLeft, ArrowRight, Ticket } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import type { AuraVariant } from "@/components/aura/types";
import { Confetti } from "@/components/effects/Confetti";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { ShareButtons } from "@/components/share/ShareButtons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ATTENDEE_CATEGORIES, ATTENDEE_CATEGORY_META, THEME_META } from "@/lib/content/constants";
import type { CalendarLinks } from "@/lib/event";
import { CheckboxField, Honeypot, SelectField, TextAreaField, TextField } from "./fields";
import { Stepper } from "./Stepper";
import { postJson } from "./submit";

const STEPS = ["About you", "Interests", "Logistics"];
const STEP_AURA: AuraVariant[] = ["registration", "thinker", "guide"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Values = Record<string, string | boolean | string[]>;

export function RegistrationForm({ calendar, shareUrl, eventName }: { calendar: CalendarLinks; shareUrl: string; eventName: string }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ country: "India", interests: [], tutorials: false, hackathonInterest: false, consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ regId: string | null; email: string; emailSent: boolean } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string | boolean | string[]) => setValues((s) => ({ ...s, [k]: v }));
  const str = (k: string) => (typeof values[k] === "string" ? (values[k] as string) : "");

  function validate(i: number) {
    const e: Record<string, string> = {};
    if (i === 0) {
      if (!str("name").trim()) e.name = "Please enter your name.";
      if (!EMAIL.test(str("email").trim())) e.email = "Please enter a valid e-mail address.";
      if (!str("category")) e.category = "Please choose a category.";
      if (!str("organisation").trim()) e.organisation = "Please enter your institution or organisation.";
    }
    if (i === 2 && !values.consent) e.consent = "Please confirm so we can process your registration.";
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
    const res = await postJson<{ regId: string | null; emailSent: boolean }>("/api/register", { ...values, website: honeypot });
    setPending(false);
    if (!res.ok || !res.data) {
      setErrors(res.fieldErrors ?? {});
      if (res.fieldErrors && ["name", "email", "category", "organisation", "phone"].some((k) => res.fieldErrors?.[k])) setStep(0);
      toast(res.message ?? "Registration failed", "error");
      return;
    }
    setDone({ regId: res.data.regId, email: str("email"), emailSent: res.data.emailSent });
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  if (done) {
    return (
      <div ref={topRef} className="card relative overflow-hidden p-8 text-center sm:p-12" role="status">
        <Confetti />
        <div aria-hidden className="wash pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center">
          <Aura variant="success" size={200} />
          <h2 className="mt-2 font-display text-3xl font-bold text-fg">You&apos;re registered!</h2>
          {done.regId ? (
            <>
              <p className="mt-3 max-w-md text-muted">Your registration ID is</p>
              <p className="mt-2 rounded-2xl bg-surface-2 px-5 py-3 font-display text-2xl font-bold tracking-wider text-brand tabular">{done.regId}</p>
            </>
          ) : null}
          <p className="mt-4 max-w-md text-sm text-muted">
            {!done.regId ? (
              <>
                Your registration ID and details are on their way to <strong className="text-fg">{done.email}</strong>. If this address was already registered, your earlier registration stands and we&apos;ve sent its confirmation again.
              </>
            ) : done.emailSent ? (
              <>
                A confirmation e-mail is on its way to <strong className="text-fg">{done.email}</strong>.
              </>
            ) : (
              <>Please note your registration ID. The organisers will contact you at {done.email}.</>
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <AddToCalendar links={calendar} />
          </div>
          <ShareButtons className="mt-5 justify-center" url={shareUrl} text={`I'm attending the ${eventName} at IIT Delhi!`} label="Tell your friends" />
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
          <div className="grid animate-fade-up gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Full name" required autoComplete="name" value={str("name")} onChange={(e) => set("name", e.target.value)} error={errors.name} maxLength={120} />
              <TextField label="E-mail" type="email" required autoComplete="email" value={str("email")} onChange={(e) => set("email", e.target.value)} error={errors.email} hint="Your confirmation is sent here." maxLength={160} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Phone" type="tel" autoComplete="tel" value={str("phone")} onChange={(e) => set("phone", e.target.value)} error={errors.phone} maxLength={30} />
              <SelectField
                label="I am a…"
                required
                placeholder="Choose one"
                value={str("category")}
                onChange={(e) => set("category", e.target.value)}
                error={errors.category}
                options={ATTENDEE_CATEGORIES.map((c) => ({ value: c, label: ATTENDEE_CATEGORY_META[c] }))}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Institution / organisation" required autoComplete="organization" value={str("organisation")} onChange={(e) => set("organisation", e.target.value)} error={errors.organisation} maxLength={160} />
              <TextField label="Designation / programme" value={str("designation")} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. PhD student, Data scientist" maxLength={120} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="City" autoComplete="address-level2" value={str("city")} onChange={(e) => set("city", e.target.value)} maxLength={80} />
              <TextField label="Country" autoComplete="country-name" value={str("country")} onChange={(e) => set("country", e.target.value)} maxLength={80} />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid animate-fade-up gap-5">
            <fieldset>
              <legend className="text-sm font-semibold text-fg">Which themes interest you most?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {(["healthcare", "science", "entrepreneurship"] as const).map((t) => {
                  const list = (values.interests as string[]) ?? [];
                  return (
                    <CheckboxField
                      key={t}
                      className={`tone-${THEME_META[t].tone}`}
                      label={THEME_META[t].short}
                      checked={list.includes(t)}
                      onChange={(e) => set("interests", e.target.checked ? [...list, t] : list.filter((x) => x !== t))}
                    />
                  );
                })}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField label="I'd like to join hands-on tutorials" description="We'll share prerequisites closer to the event." checked={Boolean(values.tutorials)} onChange={(e) => set("tutorials", e.target.checked)} />
              <CheckboxField label="I'm interested in the hackathon" description="Hackathon registration is separate. We'll send you the details." checked={Boolean(values.hackathonInterest)} onChange={(e) => set("hackathonInterest", e.target.checked)} />
            </div>
            <SelectField
              label="How did you hear about the workshop?"
              placeholder="Choose one"
              value={str("heardFrom")}
              onChange={(e) => set("heardFrom", e.target.value)}
              options={["Social media", "E-mail", "Colleague or friend", "IIT Delhi / ScAI website", "Other"].map((v) => ({ value: v, label: v }))}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid animate-fade-up gap-5">
            <SelectField
              label="Dietary preference"
              placeholder="No preference"
              value={str("dietary")}
              onChange={(e) => set("dietary", e.target.value)}
              options={["Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Other"].map((v) => ({ value: v, label: v }))}
            />
            <TextAreaField label="Accessibility requirements" rows={2} value={str("accessibility")} onChange={(e) => set("accessibility", e.target.value)} hint="Let us know if you need any assistance at the venue." maxLength={500} />
            <TextAreaField label="Anything else?" rows={3} value={str("message")} onChange={(e) => set("message", e.target.value)} maxLength={1000} />
            <CheckboxField
              label="I agree to be contacted about this workshop"
              description="Your details are used only to organise the event and are not shared with third parties."
              checked={Boolean(values.consent)}
              onChange={(e) => set("consent", e.target.checked)}
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
            <Button type="submit" disabled={pending} icon={<Ticket size={18} aria-hidden />}>
              {pending ? "Registering…" : "Complete registration"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
