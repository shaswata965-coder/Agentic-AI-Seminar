import "server-only";
import { ENQUIRY_TYPES, type EnquiryType } from "@/lib/content/constants";
import type { SiteSettings } from "@/lib/content/types";
import { checkAnswers, ENQUIRY_FORMS, FORM_SETTINGS, splitAnswers, type Answer } from "@/lib/forms";

/*
 * Validation for the public forms, from the fields set for each in Site settings (src/lib/forms.ts): only the
 * fields shown are read (unknown keys are dropped), every answer must have its field's type, choices must be one
 * of the options, lengths are capped, and control characters are removed (line breaks only survive in long
 * answers), so nothing typed can reach the database, an e-mail header or a CSV export as anything but plain
 * text. Built-in fields' answers go to their own columns, added questions' to `answers`.
 */

type Checked<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string> };
/** A record as stored: the built-in fields' answers as columns, and the added questions' under `answers`. */
type Stored = { [column: string]: unknown; answers: Record<string, Answer> };

const stored = (columns: Record<string, Answer>, answers: Record<string, Answer>): Stored => ({ ...columns, answers });

/** A workshop registration: the registration's columns (name, email…) and the added questions' answers. */
export function checkRegistration(s: SiteSettings, body: unknown): Checked<Stored & { name: string; email: string }> {
  const { values, errors } = checkAnswers("register", s[FORM_SETTINGS.register], body);
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };
  const { columns, answers } = splitAnswers("register", values);
  return { ok: true, data: stored(columns, answers) as Stored & { name: string; email: string } };
}

const MAX_MEMBERS = 6;

/** A hackathon team: its own answers, and its members' (the first is the team lead; at most six). */
export function checkTeam(s: SiteSettings, body: unknown): Checked<Stored & { teamName: string; members: (Stored & { name: string; email: string })[] }> {
  const src = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const team = checkAnswers("hackathonTeam", s[FORM_SETTINGS.hackathonTeam], src);
  const fieldErrors: Record<string, string> = { ...team.errors };
  const list = Array.isArray(src.members) ? src.members.slice(0, MAX_MEMBERS + 1) : [];
  if (!list.length) fieldErrors["members.0.name"] = "Add at least the team lead.";
  if (list.length > MAX_MEMBERS) fieldErrors["members.0.name"] = `Teams can have at most ${MAX_MEMBERS} members.`;
  const members = list.slice(0, MAX_MEMBERS).map((m, i) => {
    const checked = checkAnswers("hackathonMember", s[FORM_SETTINGS.hackathonMember], m, { lead: i === 0 });
    for (const [k, v] of Object.entries(checked.errors)) fieldErrors[`members.${i}.${k}`] = v;
    const { columns, answers } = splitAnswers("hackathonMember", checked.values);
    return stored(columns, answers) as Stored & { name: string; email: string };
  });
  const emails = members.map((m) => m.email).filter(Boolean);
  if (new Set(emails).size !== emails.length) fieldErrors["members.0.email"] = "Each member needs a different e-mail address.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };
  const { columns, answers } = splitAnswers("hackathonTeam", team.values);
  return { ok: true, data: { ...(stored(columns, answers) as Stored & { teamName: string }), members } };
}

/** A contact, exhibitor or partner enquiry, with the fields of its kind. */
export function checkEnquiry(s: SiteSettings, body: unknown): Checked<Stored & { type: EnquiryType; name: string; email: string; message: string }> {
  const src = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const type: EnquiryType = (ENQUIRY_TYPES as readonly unknown[]).includes(src.type) ? (src.type as EnquiryType) : "contact";
  const form = ENQUIRY_FORMS[type];
  const { values, errors } = checkAnswers(form, s[FORM_SETTINGS[form]], src);
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };
  const { columns, answers } = splitAnswers(form, values);
  return { ok: true, data: { ...(stored(columns, answers) as Stored & { name: string; email: string; message: string }), type } };
}
