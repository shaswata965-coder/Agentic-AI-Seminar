import "server-only";
import { z } from "zod";
import { ATTENDEE_CATEGORIES, ENQUIRY_TYPES } from "@/lib/content/constants";
import { cleanLine, cleanText } from "@/lib/safe-text";

/*
 * Validation for the public forms. Every field has a type and a maximum
 * length, unknown fields are dropped, choices must be one of the options, and
 * control characters are removed (line breaks only survive in multi-line
 * answers), so nothing typed can reach the database, an e-mail header or a
 * CSV export as anything but plain text.
 */

const TYPE = { message: "Please check this field." };
const line = (max: number, msg = "This field is too long.") => z.string(TYPE).overwrite(cleanLine).trim().max(max, msg);
const text = (max: number, msg = "This field is too long.") => z.string(TYPE).overwrite(cleanText).trim().max(max, msg);
const required = (max: number, label: string) => z.string(TYPE).overwrite(cleanLine).trim().min(1, `Please enter your ${label}.`).max(max, `Your ${label} is too long.`);
const email = z.string(TYPE).trim().toLowerCase().max(160, "This e-mail address is too long.").email("Please enter a valid e-mail address.");
const phone = z
  .string(TYPE)
  .trim()
  .max(30, "This phone number is too long.")
  .regex(/^[+()\d\s-]*$/, "Please enter a valid phone number.");
const link = z
  .string(TYPE)
  .trim()
  .max(300, "This link is too long.")
  .refine((v) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(v), "Please enter a full URL starting with https://");

export const registrationSchema = z.object({
  name: required(120, "name"),
  email,
  phone: phone.optional().default(""),
  organisation: required(160, "institution or organisation"),
  designation: line(120).optional().default(""),
  category: z.enum(ATTENDEE_CATEGORIES, { message: "Please choose a category." }),
  city: line(80).optional().default(""),
  country: line(80).optional().default("India"),
  interests: z.array(z.enum(["healthcare", "science", "entrepreneurship"])).max(3).optional().default([]),
  tutorials: z.boolean(TYPE).optional().default(false),
  hackathonInterest: z.boolean(TYPE).optional().default(false),
  dietary: line(40).optional().default(""),
  accessibility: text(500).optional().default(""),
  heardFrom: line(60).optional().default(""),
  message: text(1000).optional().default(""),
  consent: z.literal(true, { message: "Please confirm so we can process your registration." }),
});

const member = z.object({
  name: required(120, "name"),
  email,
  phone: phone.optional().default(""),
  organisation: required(160, "institution or organisation"),
  role: line(60).optional().default(""),
});

export const hackathonSchema = z.object({
  teamName: z.string(TYPE).overwrite(cleanLine).trim().min(2, "Please choose a team name.").max(60, "Team name is too long."),
  track: z.string(TYPE).trim().max(40).regex(/^[a-z0-9-]*$/, "Please choose a theme."),
  members: z
    .array(member)
    .min(1, "Add at least the team lead.")
    .max(6, "Teams can have at most 6 members.")
    .refine((m) => Boolean(m[0]?.phone), { message: "The team lead's phone is required.", path: ["0", "phone"] })
    .refine((m) => new Set(m.map((x) => x.email)).size === m.length, { message: "Each member needs a different e-mail address.", path: ["0", "email"] }),
  ideaTitle: line(120).optional().default(""),
  ideaSummary: text(1500).optional().default(""),
  githubUrl: z.union([z.literal(""), link]).optional().default(""),
  consent: z.literal(true, { message: "Please accept the rules and code of conduct." }),
});

export const enquirySchema = z
  .object({
    type: z.enum(ENQUIRY_TYPES).default("contact"),
    name: required(120, "name"),
    email,
    organisation: line(160).optional().default(""),
    phone: phone.optional().default(""),
    subject: line(160).optional().default(""),
    message: z.string(TYPE).overwrite(cleanText).trim().min(10, "Please write a few more words (at least 10 characters).").max(3000, "Your message is too long."),
  })
  .refine((v) => v.type === "contact" || v.organisation.length > 0, { message: "Please enter your company or organisation.", path: ["organisation"] });
