import type { AssistantEntry } from "@/components/aura/AuraAssistant";
import { stripMarkdown } from "@/components/ui/RichText";
import { getFaqs, getSessions, getSettings, getSpeakers, getTutorials } from "./queries";

const PAGES: AssistantEntry[] = [
  { kind: "Page", title: "Home", href: "/", keywords: "overview countdown announcements news highlights" },
  { kind: "Page", title: "Programme", subtitle: "Day-wise schedule for 15 & 16 Dec", href: "/programme", keywords: "schedule agenda timetable sessions keynote talk panel pdf download calendar kiosks exhibitors hackathon" },
  { kind: "Page", title: "Speakers", subtitle: "Academic & industry speakers, panelists", href: "/speakers", keywords: "keynote panel panelists bio talk abstract" },
  { kind: "Page", title: "Tutorials & Demos", subtitle: "Hands-on tutorials and live demos", href: "/tutorials", keywords: "tutorial workshop hands on prerequisites laptop github material demo" },
  { kind: "Page", title: "Hackathon", subtitle: "One hackathon, three themes: prizes, timeline and rules", href: "/hackathon", keywords: "hackathon team prize prizes theme themes track judging criteria mentors judges rules code of conduct timeline" },
  { kind: "Page", title: "Registration", subtitle: "Register for the workshop", href: "/register", keywords: "register registration sign up ticket fee fees deadline seat" },
  { kind: "Page", title: "About the workshop", subtitle: "Why agentic AI, who should attend, what happens", href: "/about", keywords: "about motivation what is agentic ai who should attend audience activities" },
  { kind: "Page", title: "Venue & travel", subtitle: "Directions, campus entry, stays and local tips", href: "/venue", keywords: "venue travel directions airport flight railway station train metro road cab taxi hotel accommodation stay guest house campus entry gate id tips weather" },
  { kind: "Page", title: "Partners & sponsors", subtitle: "Partners, sponsorship tiers and enquiries", href: "/partners", keywords: "sponsor sponsorship partner partners tiers brochure become a partner logo" },
  { kind: "Page", title: "Organisers", subtitle: "Faculty, student organisers and volunteers", href: "/organisers", keywords: "team organisers organizers faculty students volunteers committee" },
  { kind: "Page", title: "Meet Aura", subtitle: "Our agentic mascot", href: "/meet-aura", keywords: "mascot aura robot" },
];

const SECTIONS: AssistantEntry[] = [
  { kind: "Section", title: "Themes", subtitle: "Healthcare · Scientific discovery · Entrepreneurship", href: "/#themes", keywords: "themes healthcare science discovery entrepreneurship startups" },
  { kind: "Section", title: "Announcements", href: "/#news", keywords: "news updates announcements" },
  { kind: "Section", title: "Hackathon registration", subtitle: "Register your team on the Hackathon page", href: "/hackathon#register", keywords: "hackathon register team sign up apply" },
  { kind: "Section", title: "Industry kiosks", subtitle: "On the programme page", href: "/programme#kiosks", keywords: "industry kiosk exhibit exhibitor booth companies" },
  { kind: "Section", title: "Route map", subtitle: "Interactive map of the way to IIT Delhi", href: "/#venue", keywords: "map route directions airport railway metro road how to reach" },
  { kind: "Section", title: "FAQ", href: "/#faq", keywords: "faq questions help" },
  { kind: "Section", title: "Contact", href: "/#contact", keywords: "contact email phone social linkedin message" },
];

export async function buildAssistantIndex(): Promise<AssistantEntry[]> {
  const [s, faqs, speakers, sessions, tutorials] = await Promise.all([getSettings(), getFaqs(), getSpeakers(), getSessions(), getTutorials()]);
  const entries: AssistantEntry[] = [...PAGES, ...SECTIONS];
  if (s.showGallery) entries.push({ kind: "Page", title: "Photo gallery", href: "/gallery", keywords: "photos pictures gallery" });
  if (s.showTalks) entries.push({ kind: "Page", title: "Slides & recordings", href: "/talks", keywords: "slides recordings videos youtube talks" });
  for (const f of faqs) {
    const answer = stripMarkdown(f.answer);
    entries.push({ kind: "FAQ", title: f.question, subtitle: answer.length > 90 ? `${answer.slice(0, 88)}…` : answer, href: "/#faq", keywords: answer });
  }
  for (const sp of speakers) {
    entries.push({
      kind: "Speaker",
      title: sp.name,
      subtitle: [sp.designation, sp.affiliation].filter(Boolean).join(", "),
      href: `/speakers?speaker=${encodeURIComponent(sp.slug)}`,
      keywords: `${sp.talkTitle} ${sp.category}`,
    });
  }
  if (s.programmeStatus !== "tba") {
    for (const se of sessions) {
      entries.push({ kind: "Session", title: se.title, subtitle: `Day ${se.day} · ${se.start}${se.room ? ` · ${se.room}` : ""}`, href: `/programme?day=${se.day}#session-${se.id}`, keywords: `${se.type} ${se.theme}` });
    }
  }
  for (const t of tutorials) {
    entries.push({ kind: "Tutorial", title: t.title, subtitle: t.instructors.map((i) => i.name).join(", "), href: `/tutorials#${t.slug || t.id}`, keywords: t.prerequisites.join(" ") });
  }
  return entries;
}
