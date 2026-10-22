# Load tests

End-to-end load tests for the website: real HTTPS through nginx (the README's production server block) to
`next start` and MongoDB, with every form actually submitted, stored and e-mailed, from many client IP
addresses or from one. Results of the last full run: [`docs/LOAD_TEST_REPORT.md`](../docs/LOAD_TEST_REPORT.md).

```
k6 (one source IP per user) ──HTTPS/2──▶ nginx :443 ──X-Forwarded-For──▶ next start :3000 ──▶ MongoDB
Chromium (Playwright probe) ─────────────┘                                    └──SMTP──▶ smtp-sink :2525
```

## Scenarios

| Script | Who | Shape |
| --- | --- | --- |
| [`k6/daily.js`](k6/daily.js) | An ordinary day: **100 people** on the site at once | 1 min ramp, 8 min at 100, 1 min down. Each visit lands on a page with nothing cached and views 1 to 4 more; 4 % register for the workshop, 1 % the hackathon, 2 % send a message, 4 % download the PDF, 4 % a calendar entry. One organiser in the admin panel. |
| [`k6/submission.js`](k6/submission.js) | The submission rush: **2,000 people** registering at once | All 2,000 arrive within 60 s (a deadline, or the link going round), so all are on the site together. Each opens the form (60 % directly, 40 % through the home page), fills it in for 20 to 60 s and sends it: workshop 75 %, hackathon team of 1 to 6 people 20 %, contact form 5 %. 3 % send it from two tabs at once and 2 % again later. Three organisers watch the registrations and download CSVs. |
| [`k6/contest.js`](k6/contest.js) | The hackathon: **300 participants**, peaking at **400** | 1 min ramp, 5 min at 300, 2 min at 400, back to 300. Mostly the hackathon page, the home page's announcements and the programme, the PDF and calendar entries; 30 % of visits with nothing cached. An organiser posts an announcement every 2 minutes (each one re-renders the home page for everyone); two more keep the admin panel open. |

### Client IP addresses

The site rate-limits its forms per client IP (8 workshop registrations, 6 hackathon teams and 5 messages per
address per 10 to 15 minutes, `src/lib/server/rate-limit.ts`), so the same users can get very different
results depending on how many addresses they come from. Each scenario runs in these modes:

| Mode | Addresses | Like |
| --- | --- | --- |
| `distinct` | every user their own (`127.10.0.0/20`) | people at home or on mobile data |
| `shared` | every user the same one (`127.20.0.1`) | a whole campus, hostel or office behind one NAT |
| `campus` | one user in four behind one of 10 NAT addresses, the rest their own | a realistic mix during the rush |

k6 binds each virtual user to its address (`--local-ips`); Linux routes all of `127.0.0.0/8` to the loopback
interface, so nothing needs configuring. nginx sees the address as the client and overwrites
`X-Forwarded-For` with it, exactly as in production, and the site rate-limits on that. The nginx log in each
result shows how many distinct client addresses the site saw.

### How a visit is modelled

Recorded from a real Chromium visit to the built site: a first visit to the home page makes about 74
requests (1.35 MB): the HTML (~170 KB gzipped, the CSS is inlined), ~20 scripts, 2 fonts, the theme
photos and logos, and 18 router prefetches made by the loading screen (the route tree and the page for
each of the nine main pages; Next.js checks their `_rsc` hash, which [`k6/lib/browser.js`](k6/lib/browser.js)
computes the way the browser does). Other pages prefetch the navigation bar's links. k6 does the same:

- **first visit**: the HTML, then every file it references at once (HTTP/2), then the prefetches;
- **later pages in a visit**: the HTML and the prefetches, with files cached. A browser does a client-side
  navigation from prefetched data instead, which costs the server less, so the results err on the safe side.

### Service levels (thresholds)

A run fails if any of these is missed ([`k6/lib/config.js`](k6/lib/config.js)):

| | |
| --- | --- |
| Page HTML | p95 < 1.5 s, p99 < 3 s |
| Page ready (HTML + every file, first visit) | p95 < 3 s |
| Files, prefetches | p95 < 1 s |
| Form submissions | p95 < 2 s |
| PDF, calendar | p95 < 1.5 s |
| Failed requests | < 1 % |
| Submissions refused with an error, or rate-limited | **none**: a real person turned away is a failure |

### Data checks

After each run, [`tools/report.mjs`](tools/report.mjs) checks MongoDB and the SMTP sink against what k6 was
told: every person k6 saw registered is stored exactly once (one registration per e-mail address, one team
per name, nobody in two teams), every saved enquiry is stored, every registration and team got its
confirmation e-mail and the organisers their notices, no visitor address got more than the site's 3 e-mails
a day, nginx returned no 5xx and had enough connections, and the site logged no errors.

### The real browser

During the busiest part of each scenario, [`tools/browser-probe.mjs`](tools/browser-probe.mjs) has two
headless Chromium users open `/register` with nothing cached, fill in all three steps and submit, over and
over, recording page load, largest contentful paint and the time to the confirmation. It connects from
`127.0.0.1`, so in the shared-IP modes it is a user elsewhere, not behind the shared address.

## Running

Linux, as root (nginx listens on 443). Needs nginx, [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)
(tested with v1.3.0), MongoDB 6+ and Playwright with Chromium for the browser probe.

```bash
mongod --dbpath /tmp/aaiw-loadtest-db --fork --logpath /tmp/mongod.log      # or any MongoDB; the test uses the aaiw-loadtest database
NEXT_PUBLIC_SITE_URL=https://localhost npm run build
SERVER_CPUS=0,1 K6_CPUS=2,3 loadtest/run.sh                                 # everything, about 70 minutes
SERVER_CPUS=0,1 K6_CPUS=2,3 loadtest/run.sh submission:distinct submission:shared
SCALE=0.05 PACE=0.2 loadtest/run.sh daily:distinct                         # quick smoke run
NGINX_PROFILE=tuned LABEL=tuned loadtest/run.sh submission:distinct         # with the tuned nginx
ARRIVAL=600 LABEL=10min loadtest/run.sh submission:distinct                 # the 2,000 arrive over 10 minutes
```

`run.sh` starts a fresh stack for every run ([`stack/up.sh`](stack/up.sh): nginx, `next start`, the SMTP sink),
empties and prepares the `aaiw-loadtest` database ([`tools/prepare.mjs`](tools/prepare.mjs): default and sample
content, both registrations open, the programme published, an organiser account; it refuses any database
whose name lacks "loadtest"), presses "Refresh website", runs k6 with the browser probe and a resource
monitor, and writes everything to `loadtest/results/<time>/<scenario>-<mode>/`:

| File | |
| --- | --- |
| `summary.txt`, `summary.json` | k6's results |
| `report.md`, `report.json` | data checks, nginx statuses and client IPs, time spent in Next.js, CPU and memory, connections, e-mails, the browser probe |
| `nginx-access.log`, `nginx-error.log`, `next.log`, `k6.log`, `probe.jsonl`, `monitor.jsonl` | the raw material |

`SERVER_CPUS` and `K6_CPUS` keep the load generator from taking CPU from the server (`taskset`): with `0,1`
the server side has two cores, like a small VM. `NGINX_PROFILE=tuned` swaps the README's nginx server block
for [`stack/nginx.tuned.conf.template`](stack/nginx.tuned.conf.template) (build files from disk, more
connections, a 2-second micro-cache, nothing compressed per request; see the report's finding 2).
`NGINX_CONNECTIONS` (default 768, Ubuntu's stock value) and `NGINX_WORKERS` change the README profile's nginx;
`ARRIVAL` spreads the submission rush over that many seconds (default 60); `LABEL` is added to the result
folder's name; `SMTP_SINK_DELAY_MS` slows the SMTP sink down like a real mail server.

To test another deployment, run a script directly against it with k6, e.g.
`k6 run -e BASE_URL=https://staging.example.org loadtest/k6/daily.js` (sign-in details for the organiser
scenarios: `LOADTEST_ADMIN_EMAIL`, `LOADTEST_ADMIN_PASSWORD`). **Never against the live site during
registration:** the scripts register thousands of people.

## Limits

- Everything runs on one machine over loopback: no network latency, packet loss or bandwidth limit, so
  times are what the server adds. Real visitors on mobile data will see more.
- Next.js's in-memory caches and rate limits assume one Node.js process, the documented deployment; so does
  this test.
- Browsers keep the site's files in the service worker's cache after a first visit; k6 treats every
  iteration of `daily` and `submission` as a new visitor, which is heavier.
