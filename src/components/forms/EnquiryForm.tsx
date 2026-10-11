"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { EnquiryType } from "@/lib/content/constants";
import { Honeypot, TextAreaField, TextField } from "./fields";
import { formToObject, postJson } from "./submit";

const COPY: Record<EnquiryType, { button: string; message: string; placeholder: string }> = {
  contact: { button: "Send message", message: "Your message", placeholder: "How can we help?" },
  exhibitor: { button: "Send exhibitor enquiry", message: "What would you like to showcase?", placeholder: "Tell us about your product or demo, team size and any booth requirements." },
  sponsor: { button: "Send sponsorship enquiry", message: "Tell us about your interest", placeholder: "Which tier or kind of partnership are you interested in?" },
};

export function EnquiryForm({ type = "contact", onDone }: { type?: EnquiryType; onDone?: () => void }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  const copy = COPY[type];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = formToObject(form);
    setPending(true);
    setErrors({});
    const res = await postJson("/api/enquiries", { ...data, type });
    setPending(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast(res.message ?? "Could not send your message", "error");
      return;
    }
    form.reset();
    setSentTo(data.email);
    toast("Message sent. Thank you!", "success");
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <Aura variant="contact" size={150} />
        <p className="mt-2 font-display text-2xl font-bold text-fg">Message sent!</p>
        <p className="mt-2 max-w-sm text-muted">
          Thanks for reaching out. The organisers will reply to <span className="font-semibold text-fg">{sentTo}</span>.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Send another
          </Button>
          {onDone ? <Button onClick={onDone}>Close</Button> : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" name="name" required autoComplete="name" error={errors.name} maxLength={120} />
        <TextField label="E-mail" name="email" type="email" required autoComplete="email" error={errors.email} maxLength={160} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={type === "contact" ? "Organisation" : "Company / organisation"}
          name="organisation"
          required={type !== "contact"}
          autoComplete="organization"
          error={errors.organisation}
          maxLength={160}
        />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} maxLength={30} />
      </div>
      {type === "contact" ? <TextField label="Subject" name="subject" error={errors.subject} maxLength={160} /> : null}
      <TextAreaField label={copy.message} name="message" required rows={5} placeholder={copy.placeholder} error={errors.message} maxLength={3000} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-subtle">We only use your details to respond to this enquiry.</p>
        <Button type="submit" disabled={pending} icon={<Send size={17} aria-hidden className={pending ? "animate-pulse" : undefined} />}>
          {pending ? "Sending…" : copy.button}
        </Button>
      </div>
    </form>
  );
}
