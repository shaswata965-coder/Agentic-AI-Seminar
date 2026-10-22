/*
 * Organisers in the admin panel while the public is busy: watching the dashboard and the registrations
 * list, downloading CSV exports, and posting announcements (which expires the cached home page, so the
 * next visitors get it rendered afresh).
 */
import { check, fail } from "k6";
import http from "k6/http";
import { ADMIN, BASE } from "./config.js";

const HEADERS = { Accept: "application/json", "User-Agent": "Mozilla/5.0 aaiw-loadtest organiser", "Sec-Fetch-Site": "same-origin" };
let cookie = "";

/** Sign in once per virtual user. */
export function signIn() {
  if (cookie) return;
  const res = http.post(`${BASE}/api/admin/auth/login`, JSON.stringify(ADMIN), {
    headers: { ...HEADERS, "Content-Type": "application/json", Origin: BASE },
    responseType: "text",
    tags: { kind: "admin", name: "admin sign-in" },
  });
  const token = res.cookies.aaiw_admin?.[0]?.value;
  if (!check(res, { "admin: signed in": (r) => r.status === 200 && Boolean(token) })) fail(`admin sign-in failed: ${res.status} ${res.body}`);
  cookie = `aaiw_admin=${token}`;
}

export function adminGet(path, name) {
  const res = http.get(`${BASE}${path}`, { headers: { ...HEADERS, Cookie: cookie }, tags: { kind: "admin", name } });
  check(res, { [`${name}: status 200`]: (r) => r.status === 200 });
  return res;
}

/** Post an announcement, as an organiser would during the contest. */
export function announce(n) {
  const body = {
    title: `Load test update ${n}: round ${n} starts in 15 minutes`,
    body: "Teams, please check the timeline on the hackathon page. Mentors are in the atrium.",
    date: new Date().toISOString(),
    tone: "info",
    linkUrl: "/hackathon",
    linkLabel: "Hackathon timeline",
    pinned: false,
    published: true,
  };
  const res = http.post(`${BASE}/api/admin/content/announcements`, JSON.stringify(body), {
    headers: { ...HEADERS, Cookie: cookie, "Content-Type": "application/json", Origin: BASE },
    tags: { kind: "admin", name: "admin announce" },
  });
  check(res, { "admin announce: status 201": (r) => r.status === 201 });
}
