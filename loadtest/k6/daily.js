/*
 * An ordinary day before the event: 100 people on the site at once for 8 minutes (after a 1-minute
 * ramp). Each iteration is one visit by a new visitor: they land on a page with nothing cached, look at
 * 1 to 4 more with 5 to 20 s between them, and some download the programme or a calendar entry,
 * register for the workshop or the hackathon, or send a message. One organiser checks the admin panel.
 *
 *   k6 run -e IP_MODE=distinct --local-ips 127.10.0.0/20 loadtest/k6/daily.js   (or use run.sh)
 */
import http from "k6/http";
import { sleep } from "k6";
import { adminGet, signIn } from "./lib/admin.js";
import { download, openPage, readManifest } from "./lib/browser.js";
import { BASE, baseOptions, between, dur, PACE, pick, thresholds, users, weighted } from "./lib/config.js";
import { enquiryPayload, hackathonPayload, settle, submit, workshopPayload } from "./lib/forms.js";
import { summarise } from "./lib/summary.js";

const USERS = users(Number(__ENV.USERS || 100));

export const options = {
  ...baseOptions,
  thresholds: { ...thresholds, "submissions{form:enquiry,outcome:ok}": ["count>=0"] },
  scenarios: {
    visitors: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: dur(60), target: USERS },
        { duration: dur(480), target: USERS },
        { duration: dur(60), target: 0 },
      ],
      gracefulRampDown: dur(60),
      exec: "visitor",
    },
    organiser: { executor: "constant-vus", vus: 1, duration: dur(600), exec: "organiser" },
  },
};

const LANDING = { "/": 55, "/programme": 12, "/speakers": 10, "/register": 10, "/hackathon": 8, "/about": 5 };
const BROWSE = { "/": 2, "/about": 3, "/programme": 4, "/speakers": 3, "/register": 2, "/hackathon": 3, "/partners": 1, "/venue": 2, "/tutorials": 1, "/organisers": 1 };

export function setup() {
  const programme = http.get(`${BASE}/programme`, { responseType: "text" }).body;
  return { manifest: readManifest(), sessions: [...new Set(programme.match(/\/api\/calendar\?session=[a-f0-9]{24}/g) ?? [])] };
}

export function visitor({ manifest, sessions }) {
  const id = `d${__VU}-${__ITER}`;
  let page = weighted(LANDING);
  if (!openPage(manifest, page, { cold: true })) return;
  const views = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < views; i++) {
    sleep(between(5, 20) * PACE);
    const next = weighted(BROWSE);
    if (next === page) continue;
    openPage(manifest, next, { from: page });
    page = next;
  }
  if (Math.random() < 0.04) download("/api/programme/pdf", "programme PDF");
  if (Math.random() < 0.04) download(sessions.length ? pick(sessions) : "/api/calendar", "calendar entry");

  const action = weighted({ none: 93, workshop: 4, hackathon: 1, enquiry: 2 });
  if (action !== "none") {
    const form = action === "enquiry" ? "/" : action === "hackathon" ? "/hackathon#register" : "/register";
    if (page !== form.split("#")[0]) openPage(manifest, form, { from: page });
    sleep(between(30, 90) * PACE); // filling in the form
    const payload = action === "workshop" ? workshopPayload(id) : action === "hackathon" ? hackathonPayload(id) : enquiryPayload(id, "contact");
    settle(action, [submit(action, payload, form)]);
  }
  sleep(between(5, 15) * PACE);
}

export function organiser() {
  signIn();
  adminGet("/api/admin/stats", "admin dashboard");
  sleep(between(30, 60) * PACE);
  adminGet("/api/admin/registrations?type=workshop", "admin registrations");
  sleep(between(30, 60) * PACE);
}

export const handleSummary = summarise(`Ordinary day: ${USERS} people on the site at once`);
