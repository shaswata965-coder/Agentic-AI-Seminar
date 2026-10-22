/*
 * The three public forms: workshop registration, hackathon team registration and enquiries. Payloads
 * are what the site's own forms send (src/components/forms), with made-up people whose addresses are
 * unique to the run, and every answer is sorted into an outcome (see `thresholds` in config.js).
 */
import { check } from "k6";
import http from "k6/http";
import { Counter, Trend } from "k6/metrics";
import { BASE, pick, RUN_ID } from "./config.js";

/** Every answer to a form, tagged with `form` and `outcome`. */
export const submissions = new Counter("submissions");
/** People whose submission was saved (once each, however many times they sent it). */
export const peopleRegistered = new Counter("people_registered");
/** People who never got through: every attempt was refused or failed. */
export const peopleBlocked = new Counter("people_blocked");
export const submitTime = new Trend("submit_time", true);

const FIRST = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Meera", "Kabir", "Isha", "Arjun", "Diya", "Sahil", "Nisha", "Farhan", "Lakshmi", "Tenzin", "Grace"];
const LAST = ["Sharma", "Iyer", "Gupta", "Reddy", "Singh", "Nair", "Banerjee", "Khan", "Das", "Patel", "Menon", "Joshi", "Bhat", "Kaur"];
const ORGS = ["IIT Delhi", "IIT Bombay", "IIIT Hyderabad", "University of Delhi", "Delhi Technological University", "NSUT", "Jamia Millia Islamia", "IIT Kanpur", "Ashoka University", "AIIMS New Delhi", "A healthcare start-up", "Microsoft Research India", "TCS Research"];
const CATEGORIES = ["student", "student", "student", "researcher", "faculty", "industry", "startup", "investor", "other"];
const THEMES = ["healthcare", "science", "enterprise"];
const CITIES = ["New Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata", "Chennai", "Pune"];

const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

/** A made-up person. `id` must be unique in the run. */
export function person(id) {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  return { name, email: `aaiw-${RUN_ID}-${id}@example.com`, phone: `+91 9${digits(9)}`, organisation: pick(ORGS) };
}

export function workshopPayload(id) {
  const p = person(id);
  return {
    ...p,
    designation: pick(["PhD student", "B.Tech student", "Data scientist", "Professor", "Founder", ""]),
    category: pick(CATEGORIES),
    city: pick(CITIES),
    country: "India",
    interests: THEMES.filter(() => Math.random() < 0.5),
    tutorials: Math.random() < 0.6,
    hackathonInterest: Math.random() < 0.3,
    dietary: pick(["", "Vegetarian", "Vegan", "Jain"]),
    accessibility: "",
    heardFrom: pick(["WhatsApp", "LinkedIn", "Professor", "Friend", "IIT Delhi website"]),
    message: Math.random() < 0.2 ? "Looking forward to the sessions on agents in healthcare." : "",
    consent: true,
    website: "", // the honeypot the real form leaves empty
  };
}

export function hackathonPayload(id) {
  const size = 1 + Math.floor(Math.random() * 6);
  const members = Array.from({ length: size }, (_, i) => ({ ...person(`${id}-m${i}`), role: i === 0 ? "Team lead" : pick(["Developer", "Designer", "ML engineer", "Domain expert"]) }));
  return {
    teamName: `LT ${RUN_ID} ${id}`.slice(0, 60),
    track: pick([...THEMES, "undecided"]),
    members,
    ideaTitle: "Agents that triage clinic queues",
    ideaSummary: "A multi-agent assistant that reads intake forms, checks history and books follow-ups, with a clinician in the loop.",
    githubUrl: Math.random() < 0.5 ? `https://github.com/example/aaiw-${id}` : "",
    consent: true,
    website: "",
  };
}

export function enquiryPayload(id, type = "contact") {
  const p = person(id);
  return {
    type,
    name: p.name,
    email: p.email,
    organisation: type === "contact" ? "" : pick(ORGS),
    phone: p.phone,
    subject: type === "contact" ? "Question about the workshop" : "Exhibiting at the workshop",
    message: "Hello, could you share more details about the schedule and accommodation near the venue? Thank you.",
    website: "",
  };
}

const ENDPOINT = { workshop: "/api/register", hackathon: "/api/hackathon/register", enquiry: "/api/enquiries" };

function postParams(form, from) {
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Origin: BASE,
      Referer: `${BASE}${from}`,
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "User-Agent": "Mozilla/5.0 aaiw-loadtest",
    },
    responseType: "text",
    // Sorted below; a 409 or 429 is an answer the site means to give, not a broken request.
    responseCallback: http.expectedStatuses(201, 409, 429),
    tags: { kind: "submit", name: `submit ${form}` },
  };
}

/** `ok`, `duplicate`, `rate_limited` or `error`, from the site's answer. */
function outcomeOf(res, { repeat }) {
  if (res.status === 201) return "ok";
  if (res.status === 429) return "rate_limited";
  // A repeat from the same person: the hackathon form refuses the team again, as designed.
  if (res.status === 409 && repeat) return "duplicate";
  return "error";
}

/**
 * Send one form. `repeat`: this person already sent it (a second tab, or sending again later). Returns
 * the outcome.
 */
export function submit(form, payload, from, { repeat = false } = {}) {
  const res = http.post(`${BASE}${ENDPOINT[form]}`, JSON.stringify(payload), postParams(form, from));
  return record(form, res, { repeat });
}

/** The same person sending the form from two tabs at once. Returns both outcomes. */
export function submitTwice(form, payload, from) {
  const req = { method: "POST", url: `${BASE}${ENDPOINT[form]}`, body: JSON.stringify(payload), params: postParams(form, from) };
  const [a, b] = http.batch([req, req]);
  const first = record(form, a, { repeat: true });
  const second = record(form, b, { repeat: true });
  return [first, second];
}

function record(form, res, { repeat }) {
  const outcome = outcomeOf(res, { repeat });
  submissions.add(1, { form, outcome });
  submitTime.add(res.timings.duration, { form });
  check(res, { [`${form}: accepted or refused as designed`]: () => outcome !== "error" });
  if (outcome === "error") console.warn(`[${form}] ${res.status} ${res.error || ""} ${String(res.body).slice(0, 200)}`);
  return outcome;
}

/** Count the person once: registered if any attempt was saved, blocked if none was. */
export function settle(form, outcomes) {
  if (outcomes.includes("ok")) peopleRegistered.add(1, { form });
  else peopleBlocked.add(1, { form, reason: outcomes.includes("rate_limited") ? "rate_limited" : "error" });
}
