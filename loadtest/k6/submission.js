/*
 * Submission rush: 2,000 people register within about a minute (a deadline, or the link going round on
 * WhatsApp), so all 2,000 are on the site at once (ARRIVAL, in seconds, spreads them out). Each is one
 * virtual user doing one thing:
 *   - opens the form page directly (60 %) or comes through the home page (40 %), with nothing cached;
 *   - spends 20 to 60 s filling it in;
 *   - sends it: workshop registration 75 %, hackathon team (1 to 6 members) 20 %, contact form 5 %;
 *     3 % send it from two tabs at once and 2 % send it again a little later, as people do;
 *   - and 30 % then look at another page.
 * Meanwhile three organisers watch the dashboard and the registrations list and download CSV exports.
 *
 *   k6 run -e IP_MODE=distinct --local-ips 127.10.0.0/20 loadtest/k6/submission.js   (or use run.sh)
 */
import { sleep } from "k6";
import { adminGet, signIn } from "./lib/admin.js";
import { openPage, readManifest } from "./lib/browser.js";
import { baseOptions, between, dur, PACE, thresholds, users, weighted } from "./lib/config.js";
import { enquiryPayload, hackathonPayload, settle, submit, submitTwice, workshopPayload } from "./lib/forms.js";
import { summarise } from "./lib/summary.js";

const USERS = users(Number(__ENV.USERS || 2000));
const ARRIVAL = Number(__ENV.ARRIVAL || 60); // seconds over which they arrive

export const options = {
  ...baseOptions,
  setupTimeout: "2m",
  thresholds: { ...thresholds, "submissions{form:enquiry,outcome:ok}": ["count>=0"] },
  scenarios: {
    applicants: { executor: "per-vu-iterations", vus: USERS, iterations: 1, maxDuration: dur(ARRIVAL + 540), exec: "applicant" },
    organisers: { executor: "constant-vus", vus: 3, duration: dur(ARRIVAL + 150), exec: "organiser" },
  },
};

const FORM_PAGE = { workshop: "/register", hackathon: "/hackathon#register", enquiry: "/" };
const PAYLOAD = { workshop: workshopPayload, hackathon: hackathonPayload, enquiry: (id) => enquiryPayload(id, "contact") };

export function setup() {
  return { manifest: readManifest() };
}

export function applicant({ manifest }) {
  sleep(between(0, ARRIVAL) * PACE);
  const form = weighted({ workshop: 75, hackathon: 20, enquiry: 5 });
  const page = FORM_PAGE[form];

  let cold = true;
  let from = null;
  if (page !== "/" && Math.random() < 0.4) {
    if (!openPage(manifest, "/", { cold })) return settle(form, ["error"]);
    cold = false;
    from = "/";
    sleep(between(3, 10) * PACE);
  }
  if (!openPage(manifest, page, { cold, from })) return settle(form, ["error"]);

  sleep(between(20, 60) * PACE); // filling in the form
  const payload = PAYLOAD[form](`s${__VU}`);
  const roll = Math.random();
  let outcomes;
  if (roll < 0.03) {
    outcomes = submitTwice(form, payload, page);
  } else {
    outcomes = [submit(form, payload, page)];
    if (roll < 0.05) {
      sleep(between(5, 15) * PACE);
      outcomes.push(submit(form, payload, page, { repeat: true }));
    }
  }
  settle(form, outcomes);

  if (Math.random() < 0.3) {
    sleep(between(3, 8) * PACE);
    openPage(manifest, weighted({ "/programme": 2, "/hackathon": 1, "/speakers": 1, "/venue": 1 }), { from: page.split("#")[0] });
  }
}

export function organiser() {
  signIn();
  adminGet("/api/admin/stats", "admin dashboard");
  sleep(between(10, 20) * PACE);
  adminGet("/api/admin/registrations?type=workshop", "admin registrations");
  sleep(between(10, 20) * PACE);
  adminGet("/api/admin/registrations?type=hackathon", "admin teams");
  if (Math.random() < 0.3) adminGet("/api/admin/export/workshop", "admin CSV export");
  sleep(between(10, 20) * PACE);
}

export const handleSummary = summarise(`Submission rush: ${USERS} people registering at once`);
