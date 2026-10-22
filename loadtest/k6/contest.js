/*
 * The hackathon itself: 300 participants on the site at once for 5 minutes, rising to 400 for 2 minutes
 * (a round's results, a new problem statement), then back to 300. They mostly check the hackathon page,
 * the announcements on the home page and the programme, and download the programme PDF and calendar
 * entries. 30 % of visits start with nothing cached (a phone, a new laptop); the rest have the site's
 * files cached. Organisers post an announcement every 2 minutes, which re-renders the home page for
 * everyone, and two more keep the admin panel open.
 *
 *   k6 run -e IP_MODE=shared --local-ips 127.20.0.1 loadtest/k6/contest.js   (or use run.sh)
 */
import http from "k6/http";
import { sleep } from "k6";
import { adminGet, announce, signIn } from "./lib/admin.js";
import { download, openPage, readManifest } from "./lib/browser.js";
import { BASE, baseOptions, between, dur, PACE, pick, thresholds, users, weighted } from "./lib/config.js";
import { enquiryPayload, settle, submit } from "./lib/forms.js";
import { summarise } from "./lib/summary.js";

const USERS = users(Number(__ENV.USERS || 300));
const PEAK = users(Number(__ENV.PEAK || 400));

const stages = [
  { duration: dur(60), target: USERS },
  { duration: dur(300), target: USERS },
  { duration: dur(30), target: PEAK },
  { duration: dur(120), target: PEAK },
  { duration: dur(30), target: USERS },
  { duration: dur(60), target: USERS },
  { duration: dur(30), target: 0 },
];
const TOTAL = 630;

export const options = {
  ...baseOptions,
  thresholds: { ...thresholds, "submissions{form:enquiry,outcome:ok}": ["count>=0"] },
  scenarios: {
    participants: { executor: "ramping-vus", startVUs: 0, stages, gracefulRampDown: dur(60), exec: "participant" },
    announcer: { executor: "constant-vus", vus: 1, duration: dur(TOTAL), exec: "announcer" },
    organisers: { executor: "constant-vus", vus: 2, duration: dur(TOTAL), exec: "organiser" },
  },
};

const PAGES = { "/hackathon": 35, "/": 25, "/programme": 20, "/speakers": 5, "/venue": 5, "/tutorials": 3, "/about": 2 };

export function setup() {
  const programme = http.get(`${BASE}/programme`, { responseType: "text" }).body;
  return { manifest: readManifest(), sessions: [...new Set(programme.match(/\/api\/calendar\?session=[a-f0-9]{24}/g) ?? [])] };
}

export function participant({ manifest, sessions }) {
  let page = weighted(PAGES);
  if (!openPage(manifest, page, { cold: Math.random() < 0.3 })) return;
  const more = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < more; i++) {
    sleep(between(10, 40) * PACE);
    const roll = Math.random();
    if (roll < 0.06) download("/api/programme/pdf", "programme PDF");
    else if (roll < 0.09) download(sessions.length ? pick(sessions) : "/api/calendar", "calendar entry");
    else {
      const next = weighted(PAGES);
      openPage(manifest, next, { from: page });
      page = next;
    }
  }
  if (Math.random() < 0.02) {
    sleep(between(20, 60) * PACE); // writing to the organisers
    settle("enquiry", [submit("enquiry", enquiryPayload(`c${__VU}-${__ITER}`, "contact"), "/")]);
  }
  sleep(between(10, 30) * PACE);
}

export function announcer() {
  signIn();
  sleep(120 * PACE);
  announce(__ITER + 1);
}

export function organiser() {
  signIn();
  adminGet("/api/admin/stats", "admin dashboard");
  sleep(between(20, 40) * PACE);
  adminGet("/api/admin/registrations?type=hackathon", "admin teams");
  sleep(between(20, 40) * PACE);
}

export const handleSummary = summarise(`Hackathon contest: ${USERS} participants, peak ${PEAK}`);
