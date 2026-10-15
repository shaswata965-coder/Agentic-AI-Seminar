import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/admin/AdminShell";
import { Aura } from "@/components/aura/Aura";

export const metadata: Metadata = { title: "Help guide" };

const SECTIONS: { id: string; title: string; steps: (string | [string, string])[] }[] = [
  {
    id: "basics",
    title: "How it works",
    steps: [
      "Everything you save here is live on the website within a few seconds. There is no separate “publish” step.",
      "Each item has a “Published” switch. Turn it off to hide something without deleting it.",
      "Use the ↑ ↓ arrows in a list to change the order items appear on the website.",
      "Text boxes with a “Preview” button support simple formatting: `**bold**`, `*italic*`, `[link text](https://example.com)` and bullet lists (start lines with `- `). Use “Preview” to check.",
    ],
  },
  {
    id: "pages",
    title: "Texts & colours of every page",
    steps: [
      ["Site settings", "A tab for each page of the site and one for what every page shares (Site-wide). Pick a section to change its colour, background, headings, introductions, button labels and empty-state messages."],
      ["Live preview", "The real page beside the form shows your changes as you type, on desktop or phone. Visitors only see them once you press Save changes."],
      ["Layout check", "Each text has a counter. Too much or too little text, or a title wrapping onto many lines, text spilling out of its box or the page scrolling sideways, is flagged on the field, the tabs and in the Layout check box."],
      "In many texts you can write `{event}`, `{dates}` or `{venue}`: they are filled in from Event details.",
    ],
  },
  {
    id: "event",
    title: "Event details, dates & registration",
    steps: [
      ["Site settings → Site-wide → Event details", "Name, tagline, dates (the countdown uses the start date), venue and hall."],
      ["Site settings → Site-wide → Registration", "Open or close workshop and hackathon registration, set deadlines (forms close automatically once a deadline passes) and fees. Paste a Google Form / Unstop / Devfolio link to use an external form instead of the built-in one."],
      ["Site settings → Site-wide → Colours and Logos", "Set the brand colour and the accent colours, and replace the built-in IIT Delhi and ScAI logos if ever needed."],
      ["Site settings → Site-wide → Contact & social", "Official e-mail, phone and social links shown in the footer and contact section."],
    ],
  },
  {
    id: "news",
    title: "Announcements",
    steps: ["Announcements → New announcement. Pin important news to keep it on top.", "Add an optional link (for example to the registration page or a PDF)."],
  },
  {
    id: "programme",
    title: "Programme, speakers & panels",
    steps: [
      ["Speakers", "Add each speaker with a photo, designation, affiliation, label (Academia / Industry / Panelist), bio, talk title and abstract. Tick “Feature on the home page” for the highlight grid."],
      ["Programme", "Add sessions with day, start/end time, type, theme and room. Link speakers, or for panels choose a moderator and panelists."],
      ["Programme status", "Site settings → Programme → Schedule. Keep “To be announced” until the schedule is ready; switch to “Draft” or “Final” to show it. The PDF download updates automatically."],
    ],
  },
  {
    id: "learn",
    title: "Tutorials, demos, kiosks & partners",
    steps: [
      "Tutorials: instructors, level, duration, prerequisites (laptop, software, accounts) and material links such as GitHub.",
      "Demos: title, team or company, description, an image and/or a YouTube link.",
      "Industry kiosks and Partners & sponsors: logo, name, website and description. Kiosks are listed on the Programme page; partner logos loop on the home page and are grouped by tier on the Partners & sponsors page. Sponsor tiers and intro text are in Site settings → Partners & kiosks.",
    ],
  },
  {
    id: "people",
    title: "Organisers, volunteers, mentors & judges",
    steps: [
      "Organisers & volunteers → New person. Choose the group: Faculty organiser, Student organiser, Volunteer, Mentor or Judge.",
      "Volunteers show a “Coming soon” card until you add the first one. Mentors and judges appear on the Hackathon page.",
      "Square photos (at least 400×400 px) look best. Uploads are compressed automatically.",
    ],
  },
  {
    id: "hackathon",
    title: "Hackathon",
    steps: [
      "Hackathon → Overview, tracks, rules, timeline, prizes, judging criteria and resources.",
      "Fill in timeline dates as they are confirmed. The timeline shows progress automatically.",
      "After the event, add winners under Hackathon → Results, then enable “Post-event: show hackathon winners” in Site settings → Site-wide → Features & post-event.",
    ],
  },
  {
    id: "responses",
    title: "Registrations & enquiries",
    steps: [
      "Registrations lists everyone who registered on the website. Change a status (e.g. confirmed / waitlisted), add notes, or download a CSV for Excel.",
      "Enquiries collects contact-form messages, exhibitor and sponsorship requests. Use “Reply” to answer by e-mail.",
      "Confirmation e-mails are sent automatically when e-mail (SMTP) is configured on the server.",
    ],
  },
  {
    id: "post",
    title: "After the event",
    steps: ["Upload photos under Photo gallery and add slides / YouTube links under Slides & recordings.", "Then switch them on in Site settings → Site-wide → Features & post-event."],
  },
  {
    id: "access",
    title: "Users & passwords",
    steps: ["Administrators can add users under Users. Editors can change all content; administrators can also manage users and volunteers and delete registrations.", "Change your own password under My account."],
  },
  {
    id: "volunteers",
    title: "Volunteers & the task tracker",
    steps: [
      ["Volunteers → Add volunteer", "Name, e-mail, password (or “Generate”), their responsibility and the areas they may change. They only see those areas. “Delete items” is a separate permission; without it they can add, edit, hide and reorder but not delete."],
      ["Changes apply at once", "Editing a volunteer's permissions, or disabling them, takes effect on their next click, even if they are signed in."],
      ["Task tracker", "Everything volunteers do, newest first: who, when, where, and each changed field before and after. Filter by volunteer or area and mark entries as reviewed. Administrators' and editors' changes are not tracked."],
      "To show volunteers on the website, add them under Organisers & volunteers; that is separate from their sign-in.",
    ],
  },
];

function Step({ s }: { s: string | [string, string] }) {
  if (typeof s === "string") {
    const parts = s.split(/(`[^`]+`)/g);
    return (
      <>
        {parts.map((p, i) =>
          p.startsWith("`") ? (
            <code key={i} className="rounded bg-surface-2 px-1.5 py-0.5 text-[13px] text-fg ring-1 ring-border">
              {p.slice(1, -1)}
            </code>
          ) : (
            p
          ),
        )}
      </>
    );
  }
  return (
    <>
      <strong className="text-fg">{s[0]}:</strong> {s[1]}
    </>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl">
      <PageTitle title="Help guide" description="How to keep the website up to date, no coding needed." />
      <div className="card mb-6 flex items-center gap-4 p-5">
        <Aura variant="admin" size={90} lite />
        <p className="text-[15px] text-muted">
          Start with <Link className="font-semibold text-brand underline" href="/admin/settings">Site settings</Link>, then add <Link className="font-semibold text-brand underline" href="/admin/content/speakers">speakers</Link> and the{" "}
          <Link className="font-semibold text-brand underline" href="/admin/content/sessions">programme</Link>. A printable version of this guide is in <code>docs/ADMIN_GUIDE.md</code>.
        </p>
      </div>
      <nav aria-label="Guide contents" className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-muted ring-1 ring-border hover:text-fg">
            {s.title}
          </a>
        ))}
      </nav>
      <div className="grid gap-4">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="card scroll-mt-6 p-6">
            <h2 className="font-display text-xl font-bold text-fg">{s.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-muted marker:text-brand">
              {s.steps.map((step, i) => (
                <li key={i}>
                  <Step s={step} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
