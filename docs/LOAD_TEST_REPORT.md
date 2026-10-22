# Load test report

End-to-end load tests of the production build (commit `fbf90b7`) for the three loads in the brief: **100
people on an ordinary day**, **2,000 during the submission (registration) period** and **300+ during the
hackathon**, each with every visitor on their own IP address and with many behind one shared address.
Run on 22 October 2026. The test suite, and how to run it again, is in [`loadtest/`](../loadtest/README.md).

## Verdict

| Load | As deployed by the README | With the tuned nginx below |
| --- | --- | --- |
| 100 people at once (ordinary day) | ✅ Pass. Pages p95 98 ms; Next.js used 44 % of one core. | not needed |
| 300 → 400 participants (contest) | ✅ Pass. Pages p95 172 ms. | ✅ Pages p95 14 ms. |
| 2,000 people arriving within one minute (deadline rush) | ❌ **Fail.** 86 % of people could not register: Node.js saturated, nginx ran out of connections, 7,700 errors. | ✅ **Pass.** All 2,000 registered; pages p95 611 ms, submissions p95 651 ms, no errors. |
| 2,000 people arriving over ten minutes | ✅ Pass. Pages p95 105 ms. | not needed |
| Many people behind **one IP address** (campus, hostel or office network) | ❌ **Fail, whatever the server.** The forms allow 8 workshop registrations, 6 hackathon teams and 5 messages per address per 10 to 15 minutes; everyone else behind that address is turned away. | ❌ same (this is in the site's code) |
| Data integrity under load | ✅ In every run, including the failing ones: each registration stored exactly once, no duplicate e-mail or team, nobody in two teams, every saved registration e-mailed, no visitor e-mailed more than 3 times. | ✅ |

Before registration opens:

1. **Decide how to treat shared IP addresses** ([finding 1](#1-people-behind-one-ip-address-are-turned-away)). On IIT Delhi's
   network, in a college lab or behind a mobile operator's shared address, the 9th person to register within
   15 minutes is told *"Too many attempts. Please wait a few minutes"*.
2. **Use the tuned nginx configuration** ([finding 2](#2-a-one-minute-rush-of-2000-overwhelms-the-readmes-deployment)) or put
   a CDN in front, if a rush is possible (a deadline, or the link shared in a large group). It is a
   configuration change plus one deploy step; the site's code is unchanged.
3. **Check the mail provider's sending limits** ([finding 3](#3-confirmation-e-mails-one-smtp-connection-each-and-no-retry)): a
   rush of 2,000 sends about 2,600 e-mails in two minutes, and a confirmation that fails is not retried.

## What was tested

```
k6 (one source IP per user) ──HTTPS/2──▶ nginx :443 ──X-Forwarded-For──▶ next start :3000 ──▶ MongoDB 8
Chromium (Playwright probe) ─────────────┘                                    └──SMTP──▶ mail sink
```

- **The stack as the README deploys it**: `npm run build` and `npm start` (one Node.js 22 process), MongoDB
  8, and nginx 1.24 with the README's server block (HTTPS, HTTP/2, `X-Forwarded-For $remote_addr`) inside
  Ubuntu's stock `nginx.conf` (768 connections per worker). E-mail went to an SMTP sink that accepts and
  counts every message, so sending was part of every request that sends.
- **A small server**: nginx, Next.js and MongoDB were pinned to **2 CPU cores** (like a 2-vCPU VM, 15 GB
  RAM available); the load generator ran on the other two.
- **Full sample content**: 8 speakers, a two-day programme, partners and announcements, both registrations
  open, the programme published.
- **Real visits**: a first visit is the page plus every file it loads (scripts, fonts, images) and the
  router prefetches the loading screen makes for the nine main pages, as recorded from Chromium: about 74
  requests and 1.35 MB. Every form was filled in with valid, unique data and really sent; 3 % of people sent
  theirs from two tabs at once and 2 % sent it again later.
- **IP addresses**: each virtual user had its own source address (`distinct`), all shared one (`shared`), or
  one in four was behind one of ten campus addresses (`campus`). nginx saw these as the client address and
  passed them on in `X-Forwarded-For`, exactly as in production.
- **A real browser**: during the busiest part of every run, two headless Chromium users kept opening
  `/register` with nothing cached, filling in all three steps and registering.
- **Checks afterwards**: MongoDB and the mail sink were compared with what k6 was told (see
  [`loadtest/README.md`](../loadtest/README.md#data-checks)).

Service levels a run must meet: page HTML p95 < 1.5 s and p99 < 3 s, a page with all its files ready p95 <
3 s, files and prefetches p95 < 1 s, form submissions p95 < 2 s, under 1 % failed requests, and **no person
turned away** by an error or a rate limit.

| Scenario | Shape |
| --- | --- |
| Ordinary day | 100 people at once for 8 minutes, each visit 2 to 5 pages; 4 % register, 1 % register a team, 2 % send a message, 8 % download the PDF or a calendar entry |
| Submission rush | 2,000 people, each arriving within the same 60 s (or 10 minutes), opening the form, filling it in for 20 to 60 s and sending it: workshop 75 %, hackathon team of 1 to 6 people 20 %, message 5 % |
| Contest | 300 participants for 5 minutes, 400 for 2 minutes, back to 300; mostly the hackathon page, announcements and programme; an organiser posts an announcement every 2 minutes |

Organisers used the admin panel throughout (dashboard, registrations, CSV exports, announcements).

## Results

People *registered* is everyone whose submission was saved; *turned away* is everyone who never got
through (an error, or rate-limited). CPU is % of one core, average / peak; the server had two.

| Run | Pages p95 | Page ready p95 | Submit p95 | Failed requests | Registered | Turned away | 5xx | Next.js CPU | nginx CPU | Service levels | Data checks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ordinary day · distinct | 98 ms | 169 ms | 56 ms | 0 % | 90 | 0 | 0 | 44 / 102 | 5 / 13 | ✅ | ✅ |
| Ordinary day · shared | 87 ms | 144 ms | 40 ms | 0 % | 19 | **62** | 0 | 43 / 111 | 5 / 12 | ❌ rate limits | ✅ |
| Rush (1 min) · distinct | 4.0 s | 13.2 s | 2.3 s | **45 %** | 276 | **1,724** | 7,715 | 42 / 154 | 9 / 69 | ❌ | ❌ 5xx |
| Rush (1 min) · shared | 4.8 s | 19.4 s | 2.4 s | **49 %** | 17 | **1,983** | 8,381 | 42 / 163 | 11 / 99 | ❌ | ❌ 5xx |
| Rush (1 min) · campus | 3.5 s | 17.3 s | 1.7 s | **51 %** | 235 | **1,765** | 10,505 | 42 / 147 | 9 / 41 | ❌ | ❌ 5xx |
| Rush (10 min) · distinct | 105 ms | 206 ms | 50 ms | 0 % | 2,000 | 0 | 0 | 42 / 100 | 5 / 13 | ✅ | ✅ |
| Contest · distinct | 172 ms | 216 ms | 80 ms | 0 % | 53 | 0 | 0 | 68 / 133 | 8 / 17 | ✅ | ✅ |
| Contest · shared | 160 ms | 201 ms | 54 ms | 0 % | 5 | **57** | 0 | 66 / 114 | 8 / 16 | ❌ rate limits | ✅ |
| **Tuned nginx** | | | | | | | | | | | |
| Rush (1 min) · distinct · tuned v1 | 3.9 s | 11.1 s | 6.8 s | 0 % | 2,000 | 0 | 0 | 19 / 110 | 38 / 178 | ❌ slow | ✅ |
| Rush (1 min) · campus · tuned v1 | 3.3 s | 8.4 s | 3.1 s | 0 % | 1,653 | **347** | 0 | 19 / 83 | 40 / 166 | ❌ | ✅ |
| Rush (1 min) · distinct · **tuned** | **611 ms** | **2.0 s** | **651 ms** | 0 % | **2,000** | 0 | 0 | 20 / 79 | 6 / 28 | ✅ | ✅ |
| Contest · distinct · tuned v1 | 27 ms | 50 ms | 23 ms | 0 % | 50 | 0 | 0 | 9 / 60 | 25 / 50 | ✅ | ✅ |
| Contest · distinct · **tuned** | **14 ms** | **27 ms** | **22 ms** | 0 % | 56 | 0 | 0 | 13 / 65 | 5 / 10 | ✅ | ✅ |

*Tuned v1* compressed every response in nginx; *tuned* (the recommended configuration) serves
pre-compressed copies instead (finding 2). Each run's full report, with response-time percentiles for every
kind of request, nginx status codes, connections, memory, e-mails, the real browser's timings and the data
checks, is in [`LOAD_TEST_RUNS.md`](LOAD_TEST_RUNS.md).

**The real browser** (Chromium registering during the busiest part of each run): in every run that met the
service levels, the registration page loaded in 0.45 to 0.65 s (median; p95 0.8 to 1.05 s) and the
confirmation came 0.3 to 0.6 s (median) after pressing the button. In the rushes that didn't, page loads
reached 3 to 10 s at p95. One or two in a hundred of its attempts timed out ticking the consent box, in
light and heavy runs alike, with nothing logged by the site: the probe's interaction, not the server.

## Findings

### 1. People behind one IP address are turned away

**Severity: high. Where: `src/app/api/register/route.ts`, `api/hackathon/register`, `api/enquiries`.**

Each form is rate-limited per client IP address: **8 workshop registrations per 15 minutes, 6 hackathon
teams per 15 minutes, 5 messages per 10 minutes.** Every person behind the same address shares that
allowance. Measured:

| | Tried | Got through | Turned away |
| --- | --- | --- | --- |
| Ordinary day, everyone on one address (10 minutes) | 81 | 19 (8 workshop, 6 teams, 5 messages) | 62 |
| Rush, everyone on one address | 2,000 | 17 | 1,983 |
| Rush, 500 people on 10 campus addresses, 1,500 on their own (tuned nginx) | 500 on campus | 153 | **347**, all of them on campus |
| Contest, everyone on one address | 62 messages | 5 | 57 |

Everyone with their own address got through in every run, and pages are never rate-limited, so this hits
only the forms, and only people who share an address: a campus or hostel network (IIT Delhi's own included),
a college computer lab, an office, and mobile networks that put many subscribers behind one IPv4 address.
They see *"Too many attempts. Please wait a few minutes and try again."*

The limits protect the event's mail server and database from a flood from one machine, so simply removing
them isn't the answer. Options, from least to most work:

- **Exempt known networks**, such as IIT Delhi's own outgoing addresses, from the per-address limits (a list in
  an environment variable). Lowest risk, but only helps the networks you list.
- **Limit per person as well as per address**: keep today's small limits per address *and e-mail* (so one
  person can't hammer the form), and put a much higher ceiling on the address as a whole (e.g. a few hundred
  per 15 minutes) to stop a flood. A shared network then works, at the cost of a single machine being able to
  send more confirmation e-mails before it is stopped.
- Add a CAPTCHA-style challenge (e.g. Cloudflare Turnstile) only when an address passes the small limit,
  instead of refusing.

Which trade-off to take is the organisers' call; the load tests can measure whichever is chosen
(`loadtest/run.sh submission:campus submission:shared`).

### 2. A one-minute rush of 2,000 overwhelms the README's deployment

**Severity: high if a rush is possible. Where: the deployment (README "Reverse proxy with HTTPS"), not the
code.**

With the README's nginx, every request, including the ~20 build files and 18 router prefetches of each first
visit, goes to the single Node.js process. When 2,000 people arrived within a minute:

- Node.js could not keep up and requests queued inside it (build files waited 1.3 s at the median, 25 s at
  p99);
- each waiting request held an nginx connection, and within **10 seconds** nginx's 768 connections per worker
  (Ubuntu's default) ran out: 10,500 *"worker_connections are not enough"* errors, answered as **500**s, and
  nginx began closing visitors' connections;
- **1,724 of 2,000 people never got to register** (86 %), though nothing that was saved was lost or doubled.

The same 2,000 spread over ten minutes was fine (pages p95 105 ms), so the default deployment copes with at
least 200 new visitors a minute; 2,000 in a minute is too many. A minute-long rush needs one of:

**a) The tuned nginx configuration**, tested above: [`loadtest/stack/nginx.tuned.conf.template`](../loadtest/stack/nginx.tuned.conf.template). Compared with the
README's block it

1. serves `/_next/static/` (content-hashed build files) from disk instead of through Node.js;
2. raises `worker_connections` to 4,096 and keeps connections to Node.js alive (`upstream … keepalive`);
3. micro-caches anonymous page and router-prefetch requests for **2 seconds**, so a rush reaches Node.js about
   once per page every 2 s. Signed-in organisers (`aaiw_admin` cookie) and the admin's live preview (Draft
   Mode, `__prerender_bypass`) bypass it, and `/api/` and `/admin` are never cached. An edit saved in the
   admin reaches visitors after about 2 seconds instead of at once (measured: an announcement appeared to
   visitors 2.0 s after it was saved, and to the organiser at once);
4. compresses nothing per request: pages are cached already gzipped, and build files are served from
   gzipped copies made once after each build, with
   `find .next/static -type f \( -name '*.js' -o -name '*.css' \) -exec gzip -9 -k -f {} +`. A first
   version that let nginx compress every response (*tuned v1* above) served everyone but spent most of the
   server's CPU on compression, so a rush still saw 4 to 11 s at p95.

With it, 2,000 people in one minute all registered on the same two cores, with nginx using 6 % CPU on
average.

**b) A CDN in front** (e.g. Cloudflare): Next.js already marks pages and prefetches `s-maxage=300` and build
files immutable, so a CDN would absorb most of the rush. Purge it after admin edits, or edits take up to 5
minutes to appear.

Only one Node.js process should run: rate limits and the page cache live in its memory, so a second process
(e.g. PM2 cluster mode) would serve stale pages after admin edits.

### 3. Confirmation e-mails: one SMTP connection each, and no retry

**Severity: medium. Where: `src/lib/server/mail.ts`.**

The one-minute rush sent **about 2,600 e-mails in under two minutes** (confirmations, team confirmations,
acknowledgements and organiser notices), each over a new SMTP connection (up to 102 open at once). A failed
send is logged and the registration shows *Confirmation e-mail: Not sent* in the admin, but it is never
retried. The test's mail sink accepts everything; a real provider may not. Microsoft 365, for example, allows
30 messages a minute per mailbox over SMTP, and Google Workspace about 2,000 a day per user. Check the
provider's limits before a rush; consider nodemailer's pooled transport (`pool: true`, a few connections)
with a send rate under the provider's limit, or a transactional mail service, and a way to resend the
unsent ones.

### 4. A first visit costs 74 requests

**Severity: low. Where: `src/components/loading/warm.ts`.**

The loading screen prefetches all nine main pages (18 requests) on a first visit, so prefetches were 40 % of
all requests in the rush. With the tuned nginx they are almost free (served from the micro-cache); without
it they are a large part of what saturated Node.js. If the default deployment is kept, prefetching only the
pages a first visitor is likely to open next (registration, hackathon, programme) would lighten a rush.

### 5. What held up

- **No lost or doubled data** in any run, including those where most requests failed: one registration per
  e-mail address and one team per name held when the same person submitted from two tabs at once, nobody
  ended up in two teams, and every saved registration was e-mailed exactly as designed.
- **Contest and ordinary days** are comfortable on two cores: pages p95 under 200 ms with Next.js at 44 to 68 %
  of one core. Organisers' admin requests, including CSV exports of 2,000 registrations, stayed under 1 s at
  p95 except in the overloaded rushes.
- **MongoDB** was never busy (under 10 % of a core) and used 12 connections.
- **Memory**: Next.js peaked at about 1 GB during the tuned rush (2,000 registrations and 2,600 e-mails in
  two minutes) and stayed under 500 MB outside the rush. Plan for at least 2 GB of RAM.

## Limits of this test

- Everything ran on one machine over loopback: no network latency or bandwidth limits, so times are what the
  server adds. Visitors on mobile data will see more.
- In the rush runs the load generator peaked near its own two cores (up to 190 %), which adds to the
  measured tail times; server-side times (from nginx's log) were lower, e.g. pages p95 158 ms inside Next.js
  in the passing tuned rush.
- The certificate was a 2048-bit RSA one. An ECDSA certificate makes each new HTTPS connection cheaper still.
- Each iteration of the daily and rush scenarios is a new visitor with nothing cached; returning visitors
  are lighter (the service worker caches the site's files).
