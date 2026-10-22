"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fill } from "@/lib/copy";
import type { EnquiryType } from "@/lib/content/constants";
import { checkAnswers, emptyAnswer, ENQUIRY_FORMS, type Answer, type FormField } from "@/lib/forms";
import type { PageCopy } from "@/lib/schema/page-copy";
import { AnswerFields } from "./AnswerField";
import { Honeypot } from "./fields";
import { postJson } from "./submit";

/** The texts of an enquiry form (Site settings: Home → Contact form, Programme → Exhibit form, Partners → Partner form). */
export type EnquiryText = PageCopy["contactFormText"];

/** A contact, exhibitor or partner enquiry, with the fields and texts set for it in Site settings. */
export function EnquiryForm({ type = "contact", fields, text, onDone }: { type?: EnquiryType; fields: FormField[]; text: EnquiryText; onDone?: () => void }) {
  const toast = useToast();
  const form = ENQUIRY_FORMS[type];
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, emptyAnswer(f.type)])) as Record<string, Answer>;
  const [values, setValues] = useState(blank);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checked = checkAnswers(form, fields, values);
    setErrors(checked.errors);
    if (Object.keys(checked.errors).length) return;
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setPending(true);
    const res = await postJson("/api/enquiries", { ...values, type, website: honeypot });
    setPending(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast(res.message ?? "Could not send your message", "error");
      return;
    }
    setValues(blank());
    setSentTo(typeof values.email === "string" ? values.email : "");
    toast(text.toast, "success");
  }

  if (sentTo !== null) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <Aura variant="contact" size={150} />
        <p className="mt-2 font-display text-2xl font-bold text-fg">{text.sentTitle}</p>
        <p className="mt-2 max-w-sm text-muted">{fill(text.sentText, { email: sentTo })}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => setSentTo(null)}>
            {text.another}
          </Button>
          {onDone ? <Button onClick={onDone}>{text.close}</Button> : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <Honeypot />
      <AnswerFields form={form} fields={fields.filter((f) => !f.hidden)} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} errors={errors} optional={text.optional} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-subtle">{text.note}</p>
        <Button type="submit" disabled={pending} icon={<Send size={17} aria-hidden className={pending ? "animate-pulse" : undefined} />}>
          {pending ? text.sending : text.button}
        </Button>
      </div>
    </form>
  );
}
