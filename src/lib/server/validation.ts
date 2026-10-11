import "server-only";
import { z } from "zod";
import { ATTENDEE_CATEGORIES, ENQUIRY_TYPES } from "@/lib/content/constants";

const text = (max: number, msg = "This field is too long.") => z.string().trim().max(max, msg);
const required = (max: number, label: string) => z.string().trim().min(1, `Please enter your ${label}.`).max(max, `Your ${label} is too long.`);
const email = z.string().trim().toLowerCase().max(160).email("Please enter a valid e-mail address.");
const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s-]*$/, "Please enter a valid phone number.");

export const registrationSchema = z.object({
  name: required(120, "name"),
  email,
  phone: phone.optional().default(""),
  organisation: required(160, "institution or organisation"),
  designation: text(120).optional().default(""),
  category: z.enum(ATTENDEE_CATEGORIES, { message: "Please choose a category." }),
  city: text(80).optional().default(""),
  country: text(80).optional().default("India"),
  interests: z.array(z.enum(["healthcare", "science", "entrepreneurship"])).max(3).optional().default([]),
  tutorials: z.boolean().optional().default(false),
  hackathonInterest: z.boolean().optional().default(false),
  dietary: text(40).optional().default(""),
  accessibility: text(500).optional().default(""),
  heardFrom: text(60).optional().default(""),
  message: text(1000).optional().default(""),
  consent: z.literal(true, { message: "Please confirm so we can process your registration." }),
});

const member = z.object({
  name: required(120, "name"),
  email,
  phone: phone.optional().default(""),
  organisation: required(160, "institution or organisation"),
  role: text(60).optional().default(""),
});

export const hackathonSchema = z.object({
  teamName: z.string().trim().min(2, "Please choose a team name.").max(60, "Team name is too long."),
  track: text(40),
  members: z
    .array(member)
    .min(1, "Add at least the team lead.")
    .max(6, "Teams can have at most 6 members.")
    .refine((m) => Boolean(m[0]?.phone), { message: "The team lead's phone is required.", path: ["0", "phone"] })
    .refine((m) => new Set(m.map((x) => x.email)).size === m.length, { message: "Each member needs a different e-mail address.", path: ["0", "email"] }),
  ideaTitle: text(120).optional().default(""),
  ideaSummary: text(1500).optional().default(""),
  githubUrl: z.union([z.literal(""), z.string().trim().max(300).url("Please enter a full URL starting with https://")]).optional().default(""),
  consent: z.literal(true, { message: "Please accept the rules and code of conduct." }),
});

export const enquirySchema = z
  .object({
    type: z.enum(ENQUIRY_TYPES).default("contact"),
    name: required(120, "name"),
    email,
    organisation: text(160).optional().default(""),
    phone: phone.optional().default(""),
    subject: text(160).optional().default(""),
    message: z.string().trim().min(10, "Please write a few more words (at least 10 characters).").max(3000, "Your message is too long."),
  })
  .refine((v) => v.type === "contact" || v.organisation.length > 0, { message: "Please enter your company or organisation.", path: ["organisation"] });
