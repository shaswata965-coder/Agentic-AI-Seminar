import type { AuraVariant } from "@/components/aura/types";

export type Tone = "azure" | "lilac" | "mint" | "peach" | "blush" | "butter" | "aqua";

export const THEME_KEYS = ["healthcare", "science", "entrepreneurship", "general"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export const THEME_META: Record<
  ThemeKey,
  { label: string; short: string; tone: Tone; aura: AuraVariant; icon: "heart" | "atom" | "rocket" | "spark" }
> = {
  healthcare: { label: "Agentic AI in Healthcare", short: "Healthcare", tone: "blush", aura: "healthcare", icon: "heart" },
  science: { label: "Agentic AI for Scientific Discovery", short: "Scientific Discovery", tone: "lilac", aura: "science", icon: "atom" },
  entrepreneurship: { label: "Agentic AI and Entrepreneurship", short: "Entrepreneurship", tone: "peach", aura: "entrepreneurship", icon: "rocket" },
  general: { label: "Cross-cutting", short: "General", tone: "azure", aura: "guide", icon: "spark" },
};

export const SESSION_TYPES = ["keynote", "talk", "panel", "tutorial", "demo", "hackathon", "break", "other"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_META: Record<SessionType, { label: string; tone: Tone }> = {
  keynote: { label: "Keynote", tone: "lilac" },
  talk: { label: "Talk", tone: "azure" },
  panel: { label: "Panel", tone: "peach" },
  tutorial: { label: "Tutorial", tone: "mint" },
  demo: { label: "Demo", tone: "aqua" },
  hackathon: { label: "Hackathon", tone: "blush" },
  break: { label: "Break", tone: "butter" },
  other: { label: "Session", tone: "azure" },
};

export const SPEAKER_CATEGORIES = ["academia", "industry", "panelist"] as const;
export type SpeakerCategory = (typeof SPEAKER_CATEGORIES)[number];
export const SPEAKER_CATEGORY_META: Record<SpeakerCategory, { label: string; tone: Tone }> = {
  academia: { label: "Academia", tone: "lilac" },
  industry: { label: "Industry", tone: "peach" },
  panelist: { label: "Panelist", tone: "mint" },
};

export const PEOPLE_GROUPS = ["faculty", "student", "volunteer", "mentor", "judge"] as const;
export type PeopleGroup = (typeof PEOPLE_GROUPS)[number];
export const PEOPLE_GROUP_META: Record<PeopleGroup, { label: string; plural: string }> = {
  faculty: { label: "Faculty organiser", plural: "Faculty organisers" },
  student: { label: "Student organiser", plural: "Student organisers" },
  volunteer: { label: "Volunteer", plural: "Volunteers" },
  mentor: { label: "Mentor", plural: "Mentors" },
  judge: { label: "Judge", plural: "Judges" },
};

export const SPONSOR_TIERS = ["title", "platinum", "gold", "silver", "bronze", "partner", "academic", "community", "media"] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];
export const SPONSOR_TIER_META: Record<SponsorTier, { label: string; size: "xl" | "lg" | "md" | "sm" }> = {
  title: { label: "Title partner", size: "xl" },
  platinum: { label: "Platinum", size: "lg" },
  gold: { label: "Gold", size: "lg" },
  silver: { label: "Silver", size: "md" },
  bronze: { label: "Bronze", size: "md" },
  partner: { label: "Partners", size: "md" },
  academic: { label: "Academic partners", size: "sm" },
  community: { label: "Community partners", size: "sm" },
  media: { label: "Media partners", size: "sm" },
};

export const LEVELS = ["beginner", "intermediate", "advanced", "all"] as const;
export const LEVEL_META: Record<(typeof LEVELS)[number], { label: string; tone: Tone }> = {
  beginner: { label: "Beginner", tone: "mint" },
  intermediate: { label: "Intermediate", tone: "azure" },
  advanced: { label: "Advanced", tone: "lilac" },
  all: { label: "All levels", tone: "butter" },
};

export const FAQ_CATEGORIES = ["general", "registration", "programme", "hackathon", "travel", "sponsorship"] as const;
export const FAQ_CATEGORY_META: Record<(typeof FAQ_CATEGORIES)[number], string> = {
  general: "General",
  registration: "Registration",
  programme: "Programme",
  hackathon: "Hackathon",
  travel: "Venue & travel",
  sponsorship: "Sponsorship & exhibiting",
};

export const REGISTRATION_STATUSES = ["soon", "open", "closed"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const PROGRAMME_STATUSES = ["tba", "draft", "final"] as const;
export type ProgrammeStatus = (typeof PROGRAMME_STATUSES)[number];

export const ATTENDEE_CATEGORIES = [
  "student",
  "researcher",
  "faculty",
  "industry",
  "startup",
  "investor",
  "other",
] as const;
export const ATTENDEE_CATEGORY_META: Record<(typeof ATTENDEE_CATEGORIES)[number], string> = {
  student: "Student",
  researcher: "Researcher / postdoc",
  faculty: "Faculty",
  industry: "Industry practitioner",
  startup: "Startup founder / team",
  investor: "Investor",
  other: "Other",
};

export const ENQUIRY_TYPES = ["contact", "exhibitor", "sponsor"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const opts = <T extends string>(keys: readonly T[], label: (k: T) => string) =>
  keys.map((value) => ({ value, label: label(value) }));
