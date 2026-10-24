import { ATTENDEE_CATEGORY_META, currentThemeKey, THEME_META } from "@/lib/content/constants";
import { cleanLine, cleanText } from "@/lib/safe-text";

/*
 * The site's public forms (workshop registration, hackathon team registration, and the contact, exhibitor
 * and partner enquiries) are lists of fields that organisers edit in Site settings: each field's name, its
 * guide (help under it and an example inside it), the type of answer, whether it is required or shown, and
 * the choices of a list; they can add questions of their own. Built-in fields are the ones the site relies
 * on (the e-mail address a confirmation goes to, a team's name, the consent box): they can't be deleted,
 * and some always stay required or keep their type. Answers are checked the same way in the browser and on
 * the server (checkAnswers). Shared by client and server code.
 */

export const ANSWER_TYPES = ["text", "textarea", "email", "tel", "number", "url", "date", "select", "radio", "checkboxes", "checkbox"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  text: "Short text",
  textarea: "Long text",
  email: "E-mail address",
  tel: "Phone number",
  number: "Number",
  url: "Link",
  date: "Date",
  select: "Drop-down list",
  radio: "One choice (buttons)",
  checkboxes: "Several choices (tick boxes)",
  checkbox: "Yes / no (one tick box)",
};

/** What an answer of each type is stored as: text, a list of the choices ticked, or yes/no. */
const KIND: Record<AnswerType, "text" | "list" | "yesno"> = {
  text: "text",
  textarea: "text",
  email: "text",
  tel: "text",
  number: "text",
  url: "text",
  date: "text",
  select: "text",
  radio: "text",
  checkboxes: "list",
  checkbox: "yesno",
};
export const kindOf = (type: AnswerType) => KIND[type];
export const hasChoices = (type: AnswerType) => type === "select" || type === "radio" || type === "checkboxes";
/** Types shown across the whole width of a form. */
export const isWide = (type: AnswerType) => type === "textarea" || type === "radio" || type === "checkboxes" || type === "checkbox";

/** Longest answer of each type, unless a field sets its own. */
const MAX: Record<AnswerType, number> = { text: 200, textarea: 2000, email: 160, tel: 30, number: 30, url: 300, date: 10, select: 200, radio: 200, checkboxes: 200, checkbox: 0 };

export interface FormField {
  /** The answer's name: fixed for built-in fields, "q-…" for questions added in Site settings. */
  key: string;
  label: string;
  /** The guide under the field. */
  help: string;
  /** An example shown inside an empty field (or the first line of a drop-down list). */
  placeholder: string;
  type: AnswerType;
  /** The choices of a drop-down list, buttons or tick boxes. */
  options: string[];
  required: boolean;
  /** Team members only: required for the team lead alone. */
  leadOnly: boolean;
  hidden: boolean;
  /** For forms in steps, which step it is on (1 is the first). */
  step: number;
}

interface BuiltIn extends Partial<FormField> {
  key: string;
  label: string;
  type: AnswerType;
  /** The types it may be given; by default every type stored the same way. Its own comes first. */
  types?: AnswerType[];
  /** Always shown and required: the site needs it. */
  always?: boolean;
  /** Why it is fixed, for the admin. */
  why?: string;
  min?: number;
  max?: number;
  /** The browser's autofill hint. */
  autoComplete?: string;
}

export type FormKey = "register" | "hackathonTeam" | "hackathonMember" | "contact" | "exhibitor" | "sponsor";

interface FormSpec {
  title: string;
  /** The steps fields can be put on (a one-page form has one). */
  steps: string[];
  /** Fields of each member of a team (required means required for every member being entered). */
  members?: boolean;
  fields: BuiltIn[];
}

const ATTENDEE_OPTIONS = ["Student", "Researcher / postdoc", "Faculty", "Industry practitioner", "Startup founder / team", "Investor", "Other"];
const NAME = { label: "Name", type: "text", types: ["text"], always: true, max: 120, autoComplete: "name", why: "Used to address them in e-mails." } satisfies Omit<BuiltIn, "key">;
const EMAIL = { label: "E-mail", type: "email", types: ["email"], always: true, max: 160, autoComplete: "email", why: "Replies and confirmations go to this address." } satisfies Omit<BuiltIn, "key">;
const PHONE = { label: "Phone", type: "tel", max: 30, autoComplete: "tel" } satisfies Omit<BuiltIn, "key">;
const enquiry = (organisation: Partial<BuiltIn>, message: Partial<BuiltIn>, subject: Partial<BuiltIn>): BuiltIn[] => [
  { key: "name", ...NAME },
  { key: "email", ...EMAIL },
  { key: "organisation", label: "Organisation", type: "text", max: 160, autoComplete: "organization", ...organisation },
  { key: "phone", ...PHONE },
  { key: "subject", label: "Subject", type: "text", max: 160, ...subject },
  { key: "message", label: "Your message", type: "textarea", types: ["textarea", "text"], always: true, min: 10, max: 3000, why: "An enquiry needs a message.", ...message },
];

export const FORMS: Record<FormKey, FormSpec> = {
  register: {
    title: "Workshop registration",
    steps: ["Step 1", "Step 2", "Step 3"],
    fields: [
      { key: "name", ...NAME, label: "Full name" },
      { key: "email", ...EMAIL, why: "The confirmation goes to this address, and each address registers once." },
      { key: "phone", ...PHONE },
      { key: "category", label: "I am a…", type: "select", options: ATTENDEE_OPTIONS, placeholder: "Choose one", required: true },
      { key: "organisation", label: "Institution / organisation", type: "text", required: true, max: 160, autoComplete: "organization" },
      { key: "designation", label: "Designation / programme", type: "text", placeholder: "e.g. PhD student, Data scientist", max: 120 },
      { key: "city", label: "City", type: "text", max: 80, autoComplete: "address-level2" },
      { key: "country", label: "Country", type: "text", placeholder: "e.g. India", max: 80, autoComplete: "country-name" },
      { key: "interests", label: "Which themes interest you most?", type: "checkboxes", types: ["checkboxes"], options: ["Healthcare", "Scientific Discovery", "Enterprise"], step: 2 },
      { key: "tutorials", label: "I'd like to join hands-on tutorials", help: "We'll share prerequisites closer to the event.", type: "checkbox", types: ["checkbox"], step: 2 },
      { key: "hackathonInterest", label: "I'm interested in the hackathon", help: "Hackathon registration is separate. We'll send you the details.", type: "checkbox", types: ["checkbox"], step: 2 },
      {
        key: "presentPoster",
        label: "Would you like to present a poster?",
        help: "The poster session is open to arXiv preprints and papers currently under submission, on the broader theme of agentic AI. The organisers will write to you with the details.",
        type: "radio",
        types: ["radio", "select"],
        options: ["Yes", "No"],
        required: true,
        step: 2,
      },
      { key: "heardFrom", label: "How did you hear about the workshop?", type: "select", options: ["Social media", "E-mail", "Colleague or friend", "IIT Delhi / ScAI website", "Other"], placeholder: "Choose one", step: 2 },
      { key: "dietary", label: "Dietary preference", type: "select", options: ["Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Other"], placeholder: "No preference", step: 3 },
      { key: "accessibility", label: "Accessibility requirements", help: "Let us know if you need any assistance at the venue.", type: "textarea", max: 500, step: 3 },
      { key: "message", label: "Anything else?", type: "textarea", max: 1000, step: 3 },
      { key: "consent", label: "I agree to be contacted about this workshop", help: "Your details are used only to organise the event and are not shared with third parties.", type: "checkbox", types: ["checkbox"], always: true, step: 3, why: "Registrations need this consent." },
    ],
  },
  hackathonTeam: {
    title: "Hackathon team",
    // The members' details come between the two.
    steps: ["The first step (before the members)", "The last step (after the members)"],
    fields: [
      { key: "teamName", label: "Team name", type: "text", types: ["text"], always: true, min: 2, max: 60, why: "Each team needs a name of its own." },
      { key: "ideaTitle", label: "Idea title", type: "text", max: 120, step: 2 },
      { key: "ideaSummary", label: "Idea summary", help: "A few lines on how your agent answers the question. You can refine it at the idea-submission stage.", type: "textarea", max: 1500, step: 2 },
      { key: "githubUrl", label: "GitHub / project link", placeholder: "https://github.com/…", type: "url", max: 300, step: 2 },
      { key: "consent", label: "We accept the hackathon rules and code of conduct", help: "We confirm the details above are correct and agree to be contacted about the hackathon.", type: "checkbox", types: ["checkbox"], always: true, step: 2, why: "Teams must accept the rules." },
    ],
  },
  hackathonMember: {
    title: "Each team member",
    steps: ["Members"],
    members: true,
    fields: [
      { key: "name", ...NAME },
      { key: "email", ...EMAIL, why: "The team lead's gets the confirmation, and each person can be in only one team." },
      { key: "phone", ...PHONE, required: true, leadOnly: true },
      { key: "organisation", label: "Institution / organisation", type: "text", required: true, max: 160, autoComplete: "organization" },
      { key: "role", label: "Role in the team", type: "text", placeholder: "e.g. Developer, Designer", max: 60, hidden: true },
    ],
  },
  contact: { title: "Contact form", steps: ["Form"], fields: enquiry({}, { placeholder: "How can we help?" }, {}) },
  exhibitor: {
    title: "Exhibit with us",
    steps: ["Form"],
    fields: enquiry(
      { label: "Company / organisation", required: true },
      { label: "What would you like to showcase?", placeholder: "Tell us about your product or demo, team size and any booth requirements." },
      { hidden: true },
    ),
  },
  sponsor: {
    title: "Become a partner",
    steps: ["Form"],
    fields: enquiry({ label: "Company / organisation", required: true }, { label: "Tell us about your interest", placeholder: "Which tier or kind of partnership are you interested in?" }, { hidden: true }),
  },
};

/** The Site settings field holding each form's fields. */
export const FORM_SETTINGS = {
  register: "registerFields",
  hackathonTeam: "hackathonFields",
  hackathonMember: "hackathonMemberFields",
  contact: "contactFields",
  exhibitor: "exhibitFields",
  sponsor: "partnerFields",
} as const satisfies Record<FormKey, string>;
export type FormSettings = { [K in FormKey as (typeof FORM_SETTINGS)[K]]: FormField[] };

/** The enquiry form of each kind of enquiry. */
export const ENQUIRY_FORMS = { contact: "contact", exhibitor: "exhibitor", sponsor: "sponsor" } as const;

const MAX_FIELDS = 40;
const MAX_OPTIONS = 40;
export const CUSTOM_KEY = /^q-[a-z0-9]{4,16}$/;

/** A new question's key. */
export const newFieldKey = () => `q-${Math.random().toString(36).slice(2, 10).padEnd(6, "0")}`;

const builtInOf = (form: FormKey, key: string) => FORMS[form].fields.find((f) => f.key === key);
export const isBuiltIn = (form: FormKey, key: string) => Boolean(builtInOf(form, key));

/** How a field may be changed: the types it may take, and whether it must stay shown and required. */
export function limitsOf(form: FormKey, key: string): { types: AnswerType[]; always: boolean; why?: string; builtIn: boolean } {
  const b = builtInOf(form, key);
  if (!b) return { types: [...ANSWER_TYPES], always: false, builtIn: false };
  return { types: b.types ?? ANSWER_TYPES.filter((t) => KIND[t] === KIND[b.type]), always: Boolean(b.always), why: b.why, builtIn: true };
}

function fromBuiltIn(b: BuiltIn): FormField {
  return {
    key: b.key,
    label: b.label,
    help: b.help ?? "",
    placeholder: b.placeholder ?? "",
    type: b.type,
    options: b.options ?? [],
    required: Boolean(b.always || b.required),
    leadOnly: Boolean(b.leadOnly),
    hidden: Boolean(b.hidden && !b.always),
    step: b.step ?? 1,
  };
}

export const FORM_DEFAULTS = Object.fromEntries(
  (Object.keys(FORMS) as FormKey[]).map((form) => [FORM_SETTINGS[form], FORMS[form].fields.map(fromBuiltIn)]),
) as FormSettings;

const line = (v: unknown, max: number) => (typeof v === "string" ? cleanLine(v).trim().slice(0, max) : "");

/**
 * A form's fields as saved, made whole: unknown and repeated fields dropped, each built-in field kept to what it
 * may be (its types, required and shown when the site needs it), built-in fields missing from the list put back
 * after the one they follow by default, choices tidied.
 */
export function formFields(form: FormKey, saved: unknown): FormField[] {
  const spec = FORMS[form];
  const out: FormField[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(saved) ? saved.slice(0, MAX_FIELDS * 2) : []) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const key = typeof r.key === "string" ? r.key : "";
    const b = builtInOf(form, key);
    if (seen.has(key) || (!b && !CUSTOM_KEY.test(key))) continue;
    seen.add(key);
    const { types, always } = limitsOf(form, key);
    const type = types.includes(r.type as AnswerType) ? (r.type as AnswerType) : (b?.type ?? "text");
    const options = Array.isArray(r.options) ? [...new Set(r.options.map((o) => line(o, 200)).filter(Boolean))].slice(0, MAX_OPTIONS) : [];
    const hidden = !always && r.hidden === true;
    const step = Math.min(spec.steps.length, Math.max(1, Math.round(Number(r.step) || b?.step || 1)));
    out.push({
      key,
      label: line(r.label, 300) || b?.label || "Question",
      help: line(r.help, 500),
      placeholder: line(r.placeholder, 200),
      type,
      options: hasChoices(type) ? options : [],
      required: always || (!hidden && r.required === true),
      leadOnly: Boolean(spec.members && !always && r.leadOnly === true && r.required === true),
      hidden,
      step,
    });
  }
  // Built-in fields missing from the list go back after the field they follow by default.
  spec.fields.forEach((b, i) => {
    if (seen.has(b.key)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const k = out.findIndex((f) => f.key === spec.fields[j].key);
      if (k >= 0) {
        at = k + 1;
        break;
      }
    }
    out.splice(at, 0, fromBuiltIn(b));
  });
  return out.slice(0, MAX_FIELDS + spec.fields.length);
}

/** Problems with a form's fields that stop them being saved (a list with nothing to choose from). */
export function fieldListProblems(fields: FormField[]): string[] {
  return fields.filter((f) => !f.hidden && hasChoices(f.type) && !f.options.length).map((f) => `“${f.label}” needs at least one choice.`);
}

/* ------------------------------------------------------------ Answers -- */

export type Answer = string | string[] | boolean;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s-]{6,30}$/;
const NUMBER_RE = /^-?\d+([.,]\d+)?$/;
const URL_RE = /^https?:\/\/[^\s/]+\.[^\s]+$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** An empty answer of a field's type. */
export const emptyAnswer = (type: AnswerType): Answer => (KIND[type] === "list" ? [] : KIND[type] === "yesno" ? false : "");

/** Whether an answer was given. */
export const answered = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? v : typeof v === "string" && v.trim() !== "");

/**
 * Check one answer: the cleaned value, or what is wrong with it. `required` is the field's, or not, for a
 * team member other than the lead when the field is required for the lead only.
 */
function checkAnswer(form: FormKey, f: FormField, raw: unknown, required: boolean): { value: Answer; error?: string } {
  const b = builtInOf(form, f.key);
  const kind = KIND[f.type];
  if (kind === "yesno") {
    const value = raw === true || raw === "true" || raw === "on";
    return required && !value ? { value, error: "Please tick this box to continue." } : { value };
  }
  if (kind === "list") {
    const value = (Array.isArray(raw) ? raw : []).filter((v): v is string => typeof v === "string" && f.options.includes(v));
    const unique = [...new Set(value)];
    if (Array.isArray(raw) && raw.length !== value.length) return { value: unique, error: "Please choose from the list." };
    return required && !unique.length ? { value: unique, error: "Please choose at least one." } : { value: unique };
  }
  const value = typeof raw === "string" || typeof raw === "number" ? (f.type === "textarea" ? cleanText(String(raw)) : cleanLine(String(raw))).trim() : "";
  if (!value) return required ? { value, error: hasChoices(f.type) ? "Please choose one." : `Please fill in “${f.label}”.` } : { value };
  const max = b?.max ?? MAX[f.type];
  if (value.length > max) return { value, error: `This is too long (at most ${max} characters).` };
  if (b?.min && value.length < b.min) return { value, error: `Please write at least ${b.min} characters.` };
  switch (f.type) {
    case "email":
      return EMAIL_RE.test(value) ? { value: value.toLowerCase() } : { value, error: "Please enter a valid e-mail address." };
    case "tel":
      return PHONE_RE.test(value) ? { value } : { value, error: "Please enter a valid phone number." };
    case "number":
      return NUMBER_RE.test(value) ? { value } : { value, error: "Please enter a number." };
    case "url":
      return URL_RE.test(value) ? { value } : { value, error: "Please enter a full link starting with https://" };
    case "date":
      return DATE_RE.test(value) && !Number.isNaN(Date.parse(value)) ? { value } : { value, error: "Please enter a date." };
    case "select":
    case "radio":
      return f.options.includes(value) ? { value } : { value, error: "Please choose one of the options." };
    default:
      return { value };
  }
}

/**
 * Check a submission against a form's fields (those on `step`, if given). Only shown fields are read; anything
 * else in the input is ignored. `lead` is for team members: false for a member other than the team lead.
 */
export function checkAnswers(form: FormKey, fields: FormField[], input: unknown, opts: { step?: number; lead?: boolean } = {}) {
  const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const values: Record<string, Answer> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.hidden || (opts.step !== undefined && f.step !== opts.step)) continue;
    const required = f.required && !(f.leadOnly && opts.lead === false);
    const { value, error } = checkAnswer(form, f, Object.hasOwn(src, f.key) ? src[f.key] : undefined, required);
    values[f.key] = value;
    if (error) errors[f.key] = error;
  }
  return { values, errors };
}

/** A checked submission split into the built-in fields' answers (stored as their own columns) and the added questions'. */
export function splitAnswers(form: FormKey, values: Record<string, Answer>): { columns: Record<string, Answer>; answers: Record<string, Answer> } {
  const columns: Record<string, Answer> = {};
  const answers: Record<string, Answer> = {};
  // A built-in field that is switched off is stored empty.
  for (const b of FORMS[form].fields) columns[b.key] = emptyAnswer(b.type);
  for (const [k, v] of Object.entries(values)) (isBuiltIn(form, k) ? columns : answers)[k] = v;
  return { columns, answers };
}

/** The autofill hint of a built-in field. */
export const autoCompleteOf = (form: FormKey, key: string) => builtInOf(form, key)?.autoComplete;

/** An answer as text, for the admin, CSV files and e-mails. */
export function answerText(v: unknown): string {
  if (Array.isArray(v)) return v.map(String).join("; ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v === null || v === undefined ? "" : String(v);
}

/* ------------------------------------------------------ Stored answers -- */

/** An answer as stored: a built-in field's own column, or an added question's under `answers`. */
export function storedAnswer(record: Record<string, unknown>, key: string): unknown {
  if (!CUSTOM_KEY.test(key)) return record[key];
  const answers = record.answers;
  return answers && typeof answers === "object" ? (answers as Record<string, unknown>)[key] : undefined;
}

/** A stored answer as text; values stored by earlier versions of the form (category and theme keys) by their names. */
export function storedText(record: Record<string, unknown>, key: string): string {
  const v = storedAnswer(record, key);
  if (key === "category" && typeof v === "string" && Object.hasOwn(ATTENDEE_CATEGORY_META, v)) return ATTENDEE_CATEGORY_META[v as keyof typeof ATTENDEE_CATEGORY_META];
  if (key === "interests" && Array.isArray(v)) return v.map((x) => THEME_META[currentThemeKey(String(x)) as keyof typeof THEME_META]?.short ?? String(x)).join("; ");
  return answerText(v);
}

/**
 * The fields to show a stored response by: those on the form now, shown ones and hidden ones that were answered,
 * then answers to questions deleted since (by their keys).
 */
export function responseRows(record: Record<string, unknown>, fields: FormField[]): { key: string; label: string; text: string }[] {
  const rows = fields.filter((f) => !f.hidden || answered(storedAnswer(record, f.key))).map((f) => ({ key: f.key, label: f.label, text: storedText(record, f.key) }));
  const answers = record.answers && typeof record.answers === "object" ? (record.answers as Record<string, unknown>) : {};
  for (const [key, v] of Object.entries(answers)) if (!fields.some((f) => f.key === key)) rows.push({ key, label: `Earlier question (${key})`, text: answerText(v) });
  return rows;
}
