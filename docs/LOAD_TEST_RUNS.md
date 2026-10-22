# Load test runs, 22 October 2026

The full report of every run behind [LOAD_TEST_REPORT.md](LOAD_TEST_REPORT.md), as `loadtest/tools/report.mjs` wrote it. Run names are `<scenario>-<IP mode>[-<variant>]`: `readme-10min` is the README deployment with the 2,000 arriving over ten minutes, `tuned` is the first tuned nginx (nginx compressing every response) and `tuned-v2` the recommended one (now `loadtest/stack/nginx.tuned.conf.template`). Runs ending `-final` are after the fixes (the README's current nginx configuration, the new rate limits and e-mail, and an SMTP sink refusing more than 3 connections at once); `-exempt` ran with the shared address in `RATE_LIMIT_EXEMPT`, and `-noprobe` without the real-browser probe. The daily-distinct browser probe predates its own submission cap, so after 8 registrations it was rate-limited itself; its page timings are unaffected.

## daily-distinct

```
Ordinary day: 100 people on the site at once · IP mode: distinct
  peak users 101 · requests 75102 (119.1/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    4037  med    30 ms  p95    98 ms  p99   180 ms  max   408 ms
  page ready (HTML + files)       4037  med    47 ms  p95   169 ms  p99   283 ms  max   880 ms
  files (JS, fonts, images)      29897  med    32 ms  p95    86 ms  p99   150 ms  max   296 ms
  router prefetches              40960  med    22 ms  p95    68 ms  p99   126 ms  max   406 ms
  form submissions                  90  med    15 ms  p95    56 ms  p99   174 ms  max   206 ms
  PDF / calendar                    92  med     6 ms  p95    40 ms  p99    70 ms  max   116 ms
  admin panel API                   15  med    31 ms  p95   159 ms  p99   339 ms  max   384 ms

  Submissions      saved  duplicate  rate-limited  error
  answers             90          0             0      0
  People           registered  blocked
  workshop                53        0
  hackathon               11        0
  enquiry                 26        0

  All thresholds met.
```

nginx: 78699 requests from 102 client IPs (max 3597 from one); statuses 200×78532, 201×98, 429×69.

Time in Next.js (nginx upstream, ms): page p50 22 / p95 67 / p99 121 / max 295; api p50 5 / p95 45 / p99 166 / max 166; admin p50 30 / p95 384 / p99 384 / max 384; static p50 30 / p95 80 / p99 134 / max 295; submit p50 13 / p95 53 / p99 120 / max 204.
CPU % (avg / peak, 100 = one core): next 44/102, mongod 1/4, nginx 5/13, smtp 0/1, k6 15/43. Peak memory MB: next 467, mongod 181, nginx 20, smtp 54, k6 404.
Peak connections: nginx 103, Next.js 61, MongoDB 12. SMTP: 135 e-mails over 135 connections (peak 3 open at once).
Real browser (Chromium): 8/77 attempts loaded and filled in the form, 8 registered; page load p50 596 ms / p95 1009 ms; LCP p50 396 ms / p95 960 ms; submit to confirmation p50 354 ms / p95 1334 ms. Failures: refused: Too many attempts. Please wait a few minutes and try again.; refused: Too many attempts. Please wait a few minutes and try again.; refused: Too many attempts. Please wait a few minutes and try again.; refused: Too many attempts. Please wait a few minutes and try again.; refused: Too many attempts. Please wait a few minutes and try again.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 61 stored, 53 expected from k6 + 8 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 11 stored, 11 expected |
| every saved enquiry is stored | ✅ | 26 stored, 26 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 61 sent, 61/61 marked sent |
| a confirmation e-mail for every team | ✅ | 11 sent, 11/11 marked sent |
| organisers told of every team | ✅ | 11 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 26 acks, 26 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## daily-shared

```
Ordinary day: 100 people on the site at once · IP mode: shared
  peak users 101 · requests 76755 (121.7/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    4082  med    29 ms  p95    87 ms  p99   136 ms  max   402 ms
  page ready (HTML + files)       4082  med    44 ms  p95   144 ms  p99   252 ms  max   543 ms
  files (JS, fonts, images)      30901  med    30 ms  p95    76 ms  p99   131 ms  max   509 ms
  router prefetches              41574  med    20 ms  p95    61 ms  p99   111 ms  max   287 ms
  form submissions                  81  med     8 ms  p95    40 ms  p99    70 ms  max   103 ms
  PDF / calendar                    91  med     6 ms  p95    27 ms  p99    67 ms  max   158 ms
  admin panel API                   15  med    33 ms  p95   152 ms  p99   339 ms  max   385 ms

  Submissions      saved  duplicate  rate-limited  error
  answers             19          0            62      0
  People           registered  blocked
  workshop                 8       38
  hackathon                6        7
  enquiry                  5       17

  FAILED thresholds:
    ✗ submissions{outcome:rate_limited} count==0
```

nginx: 80626 requests from 2 client IPs (max 76755 from one); statuses 200×80538, 201×26, 429×62.

Time in Next.js (nginx upstream, ms): page p50 20 / p95 61 / p99 106 / max 471; api p50 5 / p95 32 / p99 156 / max 156; admin p50 32 / p95 385 / p99 385 / max 385; static p50 28 / p95 72 / p99 125 / max 322; submit p50 8 / p95 33 / p99 102 / max 102.
CPU % (avg / peak, 100 = one core): next 43/111, mongod 1/3, nginx 5/12, smtp 0/1, k6 15/40. Peak memory MB: next 465, mongod 182, nginx 20, smtp 54, k6 402.
Peak connections: nginx 104, Next.js 50, MongoDB 12. SMTP: 37 e-mails over 37 connections (peak 2 open at once).
Real browser (Chromium): 85/85 attempts loaded and filled in the form, 7 registered; page load p50 531 ms / p95 869 ms; LCP p50 352 ms / p95 824 ms; submit to confirmation p50 289 ms / p95 777 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 15 stored, 8 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 6 stored, 6 expected |
| every saved enquiry is stored | ✅ | 5 stored, 5 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 15 sent, 15/15 marked sent |
| a confirmation e-mail for every team | ✅ | 6 sent, 6/6 marked sent |
| organisers told of every team | ✅ | 6 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 5 acks, 5 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-distinct

```
Hackathon contest: 300 participants, peak 400 · IP mode: distinct
  peak users 403 · requests 103084 (156.0/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8161  med    42 ms  p95   172 ms  p99   331 ms  max   1.15 s
  page ready (HTML + files)       8161  med    53 ms  p95   216 ms  p99   446 ms  max   1.48 s
  files (JS, fonts, images)      19519  med    38 ms  p95   150 ms  p99   280 ms  max   764 ms
  router prefetches              74802  med    25 ms  p95   104 ms  p99   214 ms  max   954 ms
  form submissions                  53  med    14 ms  p95    80 ms  p99   131 ms  max   157 ms
  PDF / calendar                   488  med     8 ms  p95    60 ms  p99   149 ms  max   236 ms
  admin panel API                   50  med    37 ms  p95   800 ms  p99   1.27 s  max   1.29 s

  Submissions      saved  duplicate  rate-limited  error
  answers             53          0             0      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                 53        0

  All thresholds met.
```

nginx: 106663 requests from 404 client IPs (max 3578 from one); statuses 200×106598, 201×65.

Time in Next.js (nginx upstream, ms): page p50 25 / p95 101 / p99 206 / max 1146; api p50 6 / p95 55 / p99 162 / max 234; admin p50 36 / p95 1250 / p99 1287 / max 1287; static p50 35 / p95 137 / p99 260 / max 535; submit p50 14 / p95 83 / p99 114 / max 114.
CPU % (avg / peak, 100 = one core): next 68/133, mongod 1/3, nginx 8/17, smtp 0/1, k6 25/72. Peak memory MB: next 462, mongod 189, nginx 28, smtp 54, k6 1800.
Peak connections: nginx 404, Next.js 115, MongoDB 12. SMTP: 113 e-mails over 113 connections (peak 2 open at once).
Real browser (Chromium): 79/79 attempts loaded and filled in the form, 7 registered; page load p50 638 ms / p95 1025 ms; LCP p50 456 ms / p95 1012 ms; submit to confirmation p50 431 ms / p95 1239 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 53 stored, 53 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 53 acks, 53 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-shared

```
Hackathon contest: 300 participants, peak 400 · IP mode: shared
  peak users 403 · requests 101928 (154.3/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8105  med    41 ms  p95   160 ms  p99   286 ms  max   1.22 s
  page ready (HTML + files)       8105  med    52 ms  p95   201 ms  p99   370 ms  max   1.23 s
  files (JS, fonts, images)      18956  med    37 ms  p95   119 ms  p99   216 ms  max   506 ms
  router prefetches              74230  med    25 ms  p95    96 ms  p99   165 ms  max   623 ms
  form submissions                  62  med     6 ms  p95    54 ms  p99    87 ms  max    88 ms
  PDF / calendar                   514  med     7 ms  p95    52 ms  p99    96 ms  max   367 ms
  admin panel API                   50  med    30 ms  p95   855 ms  p99   1.42 s  max   1.43 s

  Submissions      saved  duplicate  rate-limited  error
  answers              5          0            57      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                  5       57

  FAILED thresholds:
    ✗ submissions{outcome:rate_limited} count==0
```

nginx: 105544 requests from 2 client IPs (max 101928 from one); statuses 200×105470, 201×17, 429×57.

Time in Next.js (nginx upstream, ms): page p50 25 / p95 96 / p99 164 / max 1218; api p50 6 / p95 51 / p99 96 / max 199; admin p50 31 / p95 1398 / p99 1421 / max 1421; static p50 34 / p95 112 / p99 188 / max 500; submit p50 5 / p95 54 / p99 81 / max 81.
CPU % (avg / peak, 100 = one core): next 66/114, mongod 1/3, nginx 8/16, smtp 0/1, k6 25/68. Peak memory MB: next 450, mongod 189, nginx 27, smtp 53, k6 1798.
Peak connections: nginx 405, Next.js 49, MongoDB 12. SMTP: 17 e-mails over 17 connections (peak 2 open at once).
Real browser (Chromium): 80/80 attempts loaded and filled in the form, 7 registered; page load p50 586 ms / p95 1044 ms; LCP p50 380 ms / p95 924 ms; submit to confirmation p50 390 ms / p95 694 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 5 stored, 5 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 5 acks, 5 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 50422 (210.9/s) · failed 45.47% · checks 59.35%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    2193  med   1.35 s  p95   4.00 s  p99   6.16 s  max  25.68 s
  page ready (HTML + files)        496  med   4.63 s  p95  13.20 s  p99  19.53 s  max  41.84 s
  files (JS, fonts, images)      30643  med    16 ms  p95   5.43 s  p99  20.87 s  max  60.11 s
  router prefetches              17200  med   1.25 s  p95   5.03 s  p99  12.52 s  max  32.38 s
  form submissions                 327  med    15 ms  p95   2.29 s  p99   4.89 s  max  13.55 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   49  med    26 ms  p95   2.07 s  p99   3.93 s  max   3.98 s

  Submissions      saved  duplicate  rate-limited  error
  answers            292          3             0     32
  People           registered  blocked
  workshop               212     1288
  hackathon               53      351
  enquiry                 11       85

  FAILED thresholds:
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ submissions{outcome:error} count==0
    ✗ checks rate>0.99
    ✗ http_req_failed rate<0.01
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:submit} p(95)<2000
```

nginx: 36778 requests from 1372 client IPs (max 1502 from one); statuses 200×28716, 201×299, 409×3, 499×45, 500×7381, 502×334.

Time in Next.js (nginx upstream, ms): page p50 1316 / p95 4771 / p99 13224 / max 32090; api p50 164 / p95 164 / p99 164 / max 164; admin p50 25 / p95 1361 / p99 2710 / max 2710; static p50 1330 / p95 5919 / p99 25689 / max 60173; submit p50 15 / p95 1401 / p99 3760 / max 13224.
CPU % (avg / peak, 100 = one core): next 42/154, mongod 1/4, nginx 9/69, smtp 0/2, k6 22/177. Peak memory MB: next 463, mongod 182, nginx 57, smtp 55, k6 2066.
Peak connections: nginx 1049, Next.js 593, MongoDB 12. SMTP: 351 e-mails over 351 connections (peak 3 open at once).
Real browser (Chromium): 32/33 attempts loaded and filled in the form, 7 registered; page load p50 543 ms / p95 7320 ms; LCP p50 472 ms / p95 2956 ms; submit to confirmation p50 384 ms / p95 2199 ms. Failures: locator.check: Timeout 30000ms exceeded.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 219 stored, 212 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 53 stored, 53 expected |
| every saved enquiry is stored | ✅ | 11 stored, 11 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 223 sent, 219/219 marked sent |
| a confirmation e-mail for every team | ✅ | 53 sent, 53/53 marked sent |
| organisers told of every team | ✅ | 53 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 11 acks, 11 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ❌ | 500×7381, 502×334 |
| nginx had enough connections | ❌ | 10531 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-shared

```
Submission rush: 2000 people registering at once · IP mode: shared
  peak users 2003 · requests 53993 (224.4/s) · failed 49.41% · checks 58.94%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    2195  med   1.44 s  p95   4.82 s  p99   9.44 s  max  17.32 s
  page ready (HTML + files)        496  med   5.38 s  p95  19.41 s  p99  29.68 s  max  61.62 s
  files (JS, fonts, images)      32846  med     4 ms  p95   5.87 s  p99  24.24 s  max  60.13 s
  router prefetches              18566  med   1.24 s  p95   4.91 s  p99   8.77 s  max  49.94 s
  form submissions                 326  med     5 ms  p95   2.41 s  p99   4.54 s  max  11.25 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   50  med    21 ms  p95   1.94 s  p99   4.34 s  max   6.01 s

  Submissions      saved  duplicate  rate-limited  error
  answers             18          1           254     53
  People           registered  blocked
  workshop                 8     1454
  hackathon                5      421
  enquiry                  4      108

  FAILED thresholds:
    ✗ submissions{outcome:rate_limited} count==0
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ checks rate>0.99
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:submit} p(95)<2000
    ✗ submissions{outcome:error} count==0
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_failed rate<0.01
```

nginx: 37311 requests from 2 client IPs (max 35777 from one); statuses 200×28616, 201×25, 409×1, 429×254, 499×34, 500×8064, 502×317.

Time in Next.js (nginx upstream, ms): page p50 1270 / p95 3813 / p99 9421 / max 49941; api p50 138 / p95 138 / p99 138 / max 138; static p50 1101 / p95 6440 / p99 27647 / max 60128; admin p50 21 / p95 1491 / p99 5032 / max 5032; submit p50 5 / p95 1636 / p99 2896 / max 3779.
CPU % (avg / peak, 100 = one core): next 42/163, mongod 1/4, nginx 11/99, smtp 0/2, k6 24/181. Peak memory MB: next 436, mongod 184, nginx 72, smtp 54, k6 2317.
Peak connections: nginx 1362, Next.js 602, MongoDB 12. SMTP: 35 e-mails over 35 connections (peak 2 open at once).
Real browser (Chromium): 32/34 attempts loaded and filled in the form, 7 registered; page load p50 536 ms / p95 2987 ms; LCP p50 428 ms / p95 1876 ms; submit to confirmation p50 935 ms / p95 2085 ms. Failures: page.goto: net::ERR_SOCKET_NOT_CONNECTED at https://localhost/register; locator.check: Timeout 30000ms exceeded.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 15 stored, 8 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 5 stored, 5 expected |
| every saved enquiry is stored | ✅ | 5 stored, 5 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 15 sent, 15/15 marked sent |
| a confirmation e-mail for every team | ✅ | 5 sent, 5/5 marked sent |
| organisers told of every team | ✅ | 5 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 5 acks, 5 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ❌ | 500×8064, 502×317 |
| nginx had enough connections | ❌ | 11262 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-campus

```
Submission rush: 2000 people registering at once · IP mode: campus
  peak users 2003 · requests 49305 (205.0/s) · failed 51.13% · checks 55.72%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    2153  med   1.47 s  p95   3.51 s  p99   6.35 s  max  37.04 s
  page ready (HTML + files)        403  med   4.88 s  p95  17.34 s  p99  44.13 s  max  49.91 s
  files (JS, fonts, images)      30089  med     5 ms  p95   5.92 s  p99  27.78 s  max  60.18 s
  router prefetches              16740  med   931 ms  p95   4.79 s  p99  13.81 s  max  55.26 s
  form submissions                 262  med    17 ms  p95   1.65 s  p99   2.94 s  max   4.56 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   51  med    29 ms  p95   1.52 s  p99   2.22 s  max   2.83 s

  Submissions      saved  duplicate  rate-limited  error
  answers            243          2             0     17
  People           registered  blocked
  workshop               184     1350
  hackathon               44      331
  enquiry                  7       84

  FAILED thresholds:
    ✗ submissions{outcome:error} count==0
    ✗ checks rate>0.99
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ http_req_failed rate<0.01
    ✗ page_ready p(95)<3000
```

nginx: 36156 requests from 1008 client IPs (max 1518 from one); statuses 200×25351, 201×250, 409×2, 499×48, 500×10144, 502×361.

Time in Next.js (nginx upstream, ms): page p50 1492 / p95 4948 / p99 14767 / max 55258; api p50 201 / p95 201 / p99 201 / max 201; admin p50 28 / p95 1523 / p99 2823 / max 2823; static p50 1444 / p95 7308 / p99 34900 / max 60018; submit p50 16 / p95 1601 / p99 2625 / max 4557.
CPU % (avg / peak, 100 = one core): next 42/147, mongod 1/5, nginx 9/41, smtp 0/2, k6 20/129. Peak memory MB: next 448, mongod 186, nginx 43, smtp 55, k6 1940.
Peak connections: nginx 273, Next.js 672, MongoDB 12. SMTP: 298 e-mails over 298 connections (peak 3 open at once).
Real browser (Chromium): 33/35 attempts loaded and filled in the form, 7 registered; page load p50 524 ms / p95 5219 ms; LCP p50 424 ms / p95 1984 ms; submit to confirmation p50 726 ms / p95 2553 ms. Failures: page.goto: net::ERR_CONNECTION_CLOSED at https://localhost/register; locator.check: Timeout 30000ms exceeded.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 191 stored, 184 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 44 stored, 44 expected |
| every saved enquiry is stored | ✅ | 8 stored, 8 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 194 sent, 191/191 marked sent |
| a confirmation e-mail for every team | ✅ | 44 sent, 44/44 marked sent |
| organisers told of every team | ✅ | 44 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 8 acks, 8 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ❌ | 500×10144, 502×361 |
| nginx had enough connections | ❌ | 14171 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct-readme-10min

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 90733 (116.5/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3349  med    32 ms  p95   105 ms  p99   189 ms  max   1.29 s
  page ready (HTML + files)       3349  med    74 ms  p95   206 ms  p99   335 ms  max   1.51 s
  files (JS, fonts, images)      48335  med    32 ms  p95    89 ms  p99   153 ms  max   363 ms
  router prefetches              36756  med    24 ms  p95    70 ms  p99   116 ms  max   230 ms
  form submissions                2110  med    15 ms  p95    50 ms  p99    94 ms  max   290 ms
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                  173  med    36 ms  p95   122 ms  p99   1.32 s  max   1.34 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2086         24             0      0
  People           registered  blocked
  workshop              1476        0
  hackathon              423        0
  enquiry                101        0

  All thresholds met.
```

nginx: 92500 requests from 2004 client IPs (max 1767 from one); statuses 200×90383, 201×2093, 409×24.

Time in Next.js (nginx upstream, ms): page p50 24 / p95 70 / p99 117 / max 1294; api p50 171 / p95 171 / p99 171 / max 171; admin p50 34 / p95 120 / p99 1340 / max 1341; static p50 30 / p95 87 / p99 149 / max 361; submit p50 14 / p95 48 / p99 85 / max 133.
CPU % (avg / peak, 100 = one core): next 42/100, mongod 2/10, nginx 5/13, smtp 1/2, k6 15/193. Peak memory MB: next 494, mongod 208, nginx 22, smtp 58, k6 3202.
Peak connections: nginx 180, Next.js 52, MongoDB 12. SMTP: 2584 e-mails over 2584 connections (peak 4 open at once).
Real browser (Chromium): 38/39 attempts loaded and filled in the form, 7 registered; page load p50 481 ms / p95 934 ms; LCP p50 376 ms / p95 764 ms; submit to confirmation p50 272 ms / p95 675 ms. Failures: locator.check: Timeout 30000ms exceeded.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1483 stored, 1476 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 423 stored, 423 expected |
| every saved enquiry is stored | ✅ | 105 stored, 105 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1528 sent, 1483/1483 marked sent |
| a confirmation e-mail for every team | ✅ | 423 sent, 423/423 marked sent |
| organisers told of every team | ✅ | 423 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 105 acks, 105 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct-tuned

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 90155 (374.9/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3340  med    38 ms  p95   3.93 s  p99   5.86 s  max   8.50 s
  page ready (HTML + files)       3340  med   105 ms  p95  11.09 s  p99  14.14 s  max  16.93 s
  files (JS, fonts, images)      48245  med    39 ms  p95   2.42 s  p99   2.81 s  max   8.22 s
  router prefetches              36414  med    27 ms  p95   2.16 s  p99   2.80 s  max   8.24 s
  form submissions                2093  med    60 ms  p95   6.84 s  p99   8.56 s  max   9.48 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   53  med    68 ms  p95   3.52 s  p99   5.82 s  max   6.74 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2077         16             0      0
  People           registered  blocked
  workshop              1503        0
  hackathon              397        0
  enquiry                100        0

  FAILED thresholds:
    ✗ http_req_duration{kind:admin} p(95)<3000
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:submit} p(95)<2000
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
```

nginx: 91769 requests from 2004 client IPs (max 1614 from one); statuses 200×89669, 201×2084, 409×16.
nginx micro-cache: HIT×42031, MISS×113, not cached (disk, API)×38618, STALE×2376, UPDATING×8631.
Time in Next.js (nginx upstream, ms): page p50 65 / p95 285 / p99 444 / max 683; api p50 158 / p95 158 / p99 158 / max 158; static p50 1308 / p95 1308 / p99 1308 / max 1308; admin p50 54 / p95 1260 / p99 1340 / max 1340; submit p50 29 / p95 4482 / p99 6044 / max 6188.
CPU % (avg / peak, 100 = one core): next 19/110, mongod 3/10, nginx 38/178, smtp 1/9, k6 34/181. Peak memory MB: next 836, mongod 199, nginx 69, smtp 60, k6 4147.
Peak connections: nginx 1607, Next.js 217, MongoDB 12. SMTP: 2552 e-mails over 2552 connections (peak 102 open at once).
Real browser (Chromium): 34/35 attempts loaded and filled in the form, 7 registered; page load p50 581 ms / p95 7616 ms; LCP p50 324 ms / p95 7416 ms; submit to confirmation p50 501 ms / p95 788 ms. Failures: locator.check: Clicking the checkbox did not change its state

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1510 stored, 1503 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 397 stored, 397 expected |
| every saved enquiry is stored | ✅ | 102 stored, 102 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1554 sent, 1510/1510 marked sent |
| a confirmation e-mail for every team | ✅ | 397 sent, 397/397 marked sent |
| organisers told of every team | ✅ | 397 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 102 acks, 102 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-campus-tuned

```
Submission rush: 2000 people registering at once · IP mode: campus
  peak users 2003 · requests 91325 (379.7/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3409  med    51 ms  p95   3.33 s  p99   7.32 s  max   8.78 s
  page ready (HTML + files)       3409  med   130 ms  p95   8.42 s  p99  14.50 s  max  16.18 s
  files (JS, fonts, images)      48390  med    43 ms  p95   1.39 s  p99   3.18 s  max   8.04 s
  router prefetches              37358  med    36 ms  p95   1.30 s  p99   1.93 s  max   5.82 s
  form submissions                2107  med    62 ms  p95   3.08 s  p99   4.50 s  max   8.50 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   51  med    56 ms  p95   1.76 s  p99   2.36 s  max   2.71 s

  Submissions      saved  duplicate  rate-limited  error
  answers           1712         27           368      0
  People           registered  blocked
  workshop              1201      284
  hackathon              347       63
  enquiry                105        0

  FAILED thresholds:
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:submit} p(95)<2000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ submissions{outcome:rate_limited} count==0
```

nginx: 92999 requests from 1514 client IPs (max 2511 from one); statuses 200×90885, 201×1719, 409×27, 429×368.
nginx micro-cache: HIT×45975, MISS×106, not cached (disk, API)×38729, UPDATING×5699, STALE×2490.
Time in Next.js (nginx upstream, ms): page p50 212 / p95 989 / p99 1355 / max 1355; api p50 170 / p95 170 / p99 170 / max 170; static p50 1442 / p95 1496 / p99 1496 / max 1496; admin p50 54 / p95 1530 / p99 2594 / max 2594; submit p50 29 / p95 1900 / p99 2869 / max 3089.
CPU % (avg / peak, 100 = one core): next 19/83, mongod 3/9, nginx 40/166, smtp 1/7, k6 34/190. Peak memory MB: next 630, mongod 204, nginx 67, smtp 59, k6 3969.
Peak connections: nginx 1493, Next.js 121, MongoDB 12. SMTP: 2155 e-mails over 2155 connections (peak 68 open at once).
Real browser (Chromium): 37/37 attempts loaded and filled in the form, 7 registered; page load p50 466 ms / p95 10188 ms; LCP p50 284 ms / p95 624 ms; submit to confirmation p50 851 ms / p95 2489 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1208 stored, 1201 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 347 stored, 347 expected |
| every saved enquiry is stored | ✅ | 111 stored, 111 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1239 sent, 1208/1208 marked sent |
| a confirmation e-mail for every team | ✅ | 347 sent, 347/347 marked sent |
| organisers told of every team | ✅ | 347 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 111 acks, 111 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-distinct-tuned

```
Hackathon contest: 300 participants, peak 400 · IP mode: distinct
  peak users 403 · requests 105009 (159.0/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8197  med    14 ms  p95    27 ms  p99    48 ms  max   506 ms
  page ready (HTML + files)       8197  med    20 ms  p95    50 ms  p99    86 ms  max   709 ms
  files (JS, fonts, images)      20709  med    12 ms  p95    27 ms  p99    42 ms  max   272 ms
  router prefetches              75474  med     3 ms  p95    15 ms  p99    28 ms  max   1.07 s
  form submissions                  50  med    10 ms  p95    23 ms  p99    57 ms  max    79 ms
  PDF / calendar                   514  med     5 ms  p95    27 ms  p99    57 ms  max   220 ms
  admin panel API                   54  med    24 ms  p95   538 ms  p99   1.21 s  max   1.22 s

  Submissions      saved  duplicate  rate-limited  error
  answers             50          0             0      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                 50        0

  All thresholds met.
```

nginx: 108649 requests from 404 client IPs (max 3640 from one); statuses 200×108587, 201×62.
nginx micro-cache: MISS×117, HIT×74670, not cached (disk, API)×17901, STALE×15333, UPDATING×628.
Time in Next.js (nginx upstream, ms): page p50 22 / p95 997 / p99 1031 / max 1066; api p50 4 / p95 20 / p99 48 / max 214; admin p50 23 / p95 1207 / p99 1215 / max 1215; static p50 39 / p95 130 / p99 130 / max 130; submit p50 9 / p95 32 / p99 66 / max 66.
CPU % (avg / peak, 100 = one core): next 9/60, mongod 1/4, nginx 25/50, smtp 0/1, k6 23/69. Peak memory MB: next 393, mongod 206, nginx 36, smtp 54, k6 1816.
Peak connections: nginx 405, Next.js 28, MongoDB 12. SMTP: 107 e-mails over 107 connections (peak 2 open at once).
Real browser (Chromium): 79/80 attempts loaded and filled in the form, 7 registered; page load p50 522 ms / p95 815 ms; LCP p50 360 ms / p95 776 ms; submit to confirmation p50 463 ms / p95 964 ms. Failures: locator.check: Timeout 30000ms exceeded.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 50 stored, 50 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 50 acks, 50 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct-tuned-v2

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 90288 (376.7/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3334  med     7 ms  p95   611 ms  p99   1.58 s  max   3.63 s
  page ready (HTML + files)       3334  med    19 ms  p95   1.97 s  p99   4.15 s  max   5.49 s
  files (JS, fonts, images)      48260  med     3 ms  p95   552 ms  p99   1.42 s  max   3.34 s
  router prefetches              36536  med     2 ms  p95   380 ms  p99   1.28 s  max   3.21 s
  form submissions                2094  med    17 ms  p95   651 ms  p99   1.65 s  max   3.35 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   54  med    42 ms  p95   867 ms  p99   1.41 s  max   1.42 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2073         21             0      0
  People           registered  blocked
  workshop              1471        0
  hackathon              420        0
  enquiry                109        0

  All thresholds met.
```

nginx: 92254 requests from 2004 client IPs (max 1966 from one); statuses 200×90153, 201×2080, 409×21.
nginx micro-cache: HIT×50015, MISS×95, not cached (disk, API)×38803, UPDATING×873, STALE×2468.
Time in Next.js (nginx upstream, ms): page p50 60 / p95 158 / p99 310 / max 310; api p50 187 / p95 187 / p99 187 / max 187; static p50 1412 / p95 1519 / p99 1519 / max 1519; admin p50 40 / p95 1389 / p99 1419 / max 1419; submit p50 13 / p95 51 / p99 153 / max 322.
CPU % (avg / peak, 100 = one core): next 20/79, mongod 3/8, nginx 6/28, smtp 1/6, k6 27/183. Peak memory MB: next 984, mongod 214, nginx 63, smtp 59, k6 3758.
Peak connections: nginx 1511, Next.js 38, MongoDB 12. SMTP: 2590 e-mails over 2590 connections (peak 17 open at once).
Real browser (Chromium): 43/43 attempts loaded and filled in the form, 7 registered; page load p50 453 ms / p95 785 ms; LCP p50 328 ms / p95 772 ms; submit to confirmation p50 613 ms / p95 1313 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1478 stored, 1471 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 420 stored, 420 expected |
| every saved enquiry is stored | ✅ | 118 stored, 118 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1514 sent, 1478/1478 marked sent |
| a confirmation e-mail for every team | ✅ | 420 sent, 420/420 marked sent |
| organisers told of every team | ✅ | 420 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 118 acks, 118 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-distinct-tuned-v2

```
Hackathon contest: 300 participants, peak 400 · IP mode: distinct
  peak users 403 · requests 103579 (156.8/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8153  med     6 ms  p95    14 ms  p99    33 ms  max   167 ms
  page ready (HTML + files)       8153  med    11 ms  p95    27 ms  p99    54 ms  max   658 ms
  files (JS, fonts, images)      19938  med     2 ms  p95     5 ms  p99    12 ms  max   646 ms
  router prefetches              74850  med     1 ms  p95     4 ms  p99    12 ms  max   1.13 s
  form submissions                  56  med     9 ms  p95    22 ms  p99    31 ms  max    34 ms
  PDF / calendar                   521  med     5 ms  p95    15 ms  p99    28 ms  max   334 ms
  admin panel API                   50  med    23 ms  p95   749 ms  p99   1.26 s  max   1.26 s

  Submissions      saved  duplicate  rate-limited  error
  answers             56          0             0      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                 56        0

  All thresholds met.
```

nginx: 107490 requests from 404 client IPs (max 3911 from one); statuses 200×107422, 201×68.
nginx micro-cache: HIT×73883, MISS×113, not cached (disk, API)×17504, STALE×15162, UPDATING×828.
Time in Next.js (nginx upstream, ms): page p50 27 / p95 1035 / p99 1109 / max 1125; api p50 4 / p95 12 / p99 26 / max 319; static p50 615 / p95 646 / p99 646 / max 646; admin p50 23 / p95 1248 / p99 1258 / max 1258; submit p50 8 / p95 17 / p99 28 / max 28.
CPU % (avg / peak, 100 = one core): next 13/65, mongod 2/4, nginx 5/10, smtp 0/1, k6 18/71. Peak memory MB: next 385, mongod 218, nginx 35, smtp 54, k6 1857.
Peak connections: nginx 405, Next.js 26, MongoDB 12. SMTP: 119 e-mails over 119 connections (peak 1 open at once).
Real browser (Chromium): 86/86 attempts loaded and filled in the form, 7 registered; page load p50 478 ms / p95 786 ms; LCP p50 332 ms / p95 772 ms; submit to confirmation p50 633 ms / p95 933 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 56 stored, 56 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 56 acks, 56 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct-final-noprobe

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 91506 (380.5/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3398  med     5 ms  p95    12 ms  p99    25 ms  max    73 ms
  page ready (HTML + files)       3398  med    13 ms  p95    40 ms  p99   1.53 s  max   1.91 s
  files (JS, fonts, images)      48460  med     2 ms  p95    14 ms  p99   1.49 s  max   1.89 s
  router prefetches              37474  med     1 ms  p95    12 ms  p99   1.00 s  max   1.51 s
  form submissions                2114  med    11 ms  p95    35 ms  p99    85 ms  max   254 ms
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   50  med    32 ms  p95   685 ms  p99   1.13 s  max   1.15 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2098         16             0      0
  People           registered  blocked
  workshop              1469        0
  hackathon              423        0
  enquiry                108        0

  All thresholds met.
```

nginx: 91515 requests from 2004 client IPs (max 70 from one); statuses 200×89401, 201×2098, 409×16.
nginx micro-cache: HIT×85966, MISS×819, not cached (disk, API)×2166, UPDATING×708, STALE×1856.
Time at nginx, request to last byte (ms): page p50 0 / p95 22 / p99 509; api p50 178 / p95 178 / p99 178; static p50 0 / p95 0 / p99 1492; admin p50 31 / p95 1122 / p99 1143; submit p50 10 / p95 32 / p99 84.
Time in Next.js (nginx upstream, ms): page p50 58 / p95 1022 / p99 1051 / max 1051; api p50 178 / p95 178 / p99 178 / max 178; static p50 1521 / p95 1802 / p99 1842 / max 1890; admin p50 31 / p95 1122 / p99 1143 / max 1143; submit p50 10 / p95 32 / p99 84 / max 254.
CPU % (avg / peak, 100 = one core): next 18/97, mongod 3/8, nginx 6/31, smtp 1/4, k6 27/168. Peak memory MB: next 431, mongod 197, nginx 63, smtp 57, k6 3491.
Peak connections: nginx 1460, Next.js 360, MongoDB 12. SMTP: 2583 e-mails over 27 connections (peak 3 open at once).


| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1469 stored, 1469 expected from k6 + 0 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 423 stored, 423 expected |
| every saved enquiry is stored | ✅ | 112 stored, 112 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1513 sent, 1469/1469 marked sent |
| a confirmation e-mail for every team | ✅ | 423 sent, 423/423 marked sent |
| organisers told of every team | ✅ | 423 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 112 acks, 112 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-distinct-final

```
Submission rush: 2000 people registering at once · IP mode: distinct
  peak users 2003 · requests 90628 (376.8/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3359  med    14 ms  p95   2.34 s  p99   4.31 s  max   8.40 s
  page ready (HTML + files)       3359  med    47 ms  p95   9.22 s  p99  14.30 s  max  17.12 s
  files (JS, fonts, images)      48295  med    17 ms  p95   2.46 s  p99   4.94 s  max   8.51 s
  router prefetches              36810  med     5 ms  p95   1.88 s  p99   4.41 s  max   7.63 s
  form submissions                2100  med    25 ms  p95   2.34 s  p99   4.23 s  max   6.01 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   54  med    59 ms  p95   1.18 s  p99   2.46 s  max   2.51 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2077         23             0      0
  People           registered  blocked
  workshop              1484        0
  hackathon              410        0
  enquiry                106        0

  FAILED thresholds:
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:submit} p(95)<2000
```

nginx: 92292 requests from 2004 client IPs (max 1664 from one); statuses 200×90185, 201×2084, 409×23.
nginx micro-cache: MISS×123, HIT×86729, not cached (disk, API)×2163, STALE×2516, UPDATING×761.
Time at nginx, request to last byte (ms): page p50 0 / p95 15 / p99 80; api p50 171 / p95 171 / p99 171; static p50 0 / p95 0 / p99 1000; admin p50 46 / p95 1149 / p99 1176; submit p50 14 / p95 73 / p99 161.
Time in Next.js (nginx upstream, ms): page p50 43 / p95 121 / p99 692 / max 692; api p50 171 / p95 171 / p99 171 / max 171; static p50 1243 / p95 1301 / p99 1307 / max 1307; admin p50 46 / p95 1149 / p99 1176 / max 1176; submit p50 14 / p95 71 / p99 144 / max 242.
CPU % (avg / peak, 100 = one core): next 21/74, mongod 3/8, nginx 7/39, smtp 1/4, k6 33/193. Peak memory MB: next 947, mongod 187, nginx 63, smtp 59, k6 4004.
Peak connections: nginx 1579, Next.js 32, MongoDB 12. SMTP: 2582 e-mails over 28 connections (peak 3 open at once).
Real browser (Chromium): 36/36 attempts loaded and filled in the form, 7 registered; page load p50 571 ms / p95 1532 ms; LCP p50 344 ms / p95 1072 ms; submit to confirmation p50 502 ms / p95 988 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1491 stored, 1484 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 410 stored, 410 expected |
| every saved enquiry is stored | ✅ | 115 stored, 115 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1532 sent, 1491/1491 marked sent |
| a confirmation e-mail for every team | ✅ | 410 sent, 410/410 marked sent |
| organisers told of every team | ✅ | 410 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 115 acks, 115 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-campus-final

```
Submission rush: 2000 people registering at once · IP mode: campus
  peak users 2003 · requests 89937 (373.8/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3314  med     9 ms  p95   3.46 s  p99   7.82 s  max  13.42 s
  page ready (HTML + files)       3314  med    23 ms  p95  12.28 s  p99  16.08 s  max  22.46 s
  files (JS, fonts, images)      48225  med     4 ms  p95   2.80 s  p99   5.56 s  max  13.54 s
  router prefetches              36240  med     2 ms  p95   2.23 s  p99   5.04 s  max  12.50 s
  form submissions                2094  med    24 ms  p95   4.22 s  p99   7.16 s  max  11.73 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   54  med    60 ms  p95   1.35 s  p99   1.77 s  max   2.21 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2074         20             0      0
  People           registered  blocked
  workshop              1509        0
  hackathon              402        0
  enquiry                 89        0

  FAILED thresholds:
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ http_req_duration{kind:prefetch} p(95)<1000
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:submit} p(95)<2000
```

nginx: 91662 requests from 1514 client IPs (max 2392 from one); statuses 200×89561, 201×2081, 409×20.
nginx micro-cache: HIT×85885, MISS×122, not cached (disk, API)×2157, STALE×2560, UPDATING×938.
Time at nginx, request to last byte (ms): page p50 0 / p95 17 / p99 95; api p50 159 / p95 159 / p99 159; static p50 0 / p95 0 / p99 1500; admin p50 49 / p95 1353 / p99 1375; submit p50 13 / p95 84 / p99 350.
Time in Next.js (nginx upstream, ms): page p50 61 / p95 157 / p99 328 / max 328; api p50 159 / p95 159 / p99 159 / max 159; static p50 1509 / p95 1575 / p99 1578 / max 1578; admin p50 49 / p95 1353 / p99 1375 / max 1375; submit p50 13 / p95 75 / p99 193 / max 406.
CPU % (avg / peak, 100 = one core): next 21/77, mongod 3/8, nginx 7/29, smtp 1/4, k6 29/168. Peak memory MB: next 535, mongod 185, nginx 64, smtp 57, k6 3912.
Peak connections: nginx 1541, Next.js 32, MongoDB 12. SMTP: 2549 e-mails over 27 connections (peak 3 open at once).
Real browser (Chromium): 38/38 attempts loaded and filled in the form, 7 registered; page load p50 517 ms / p95 921 ms; LCP p50 296 ms / p95 1184 ms; submit to confirmation p50 877 ms / p95 5867 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1516 stored, 1509 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 402 stored, 402 expected |
| every saved enquiry is stored | ✅ | 91 stored, 91 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1563 sent, 1516/1516 marked sent |
| a confirmation e-mail for every team | ✅ | 402 sent, 402/402 marked sent |
| organisers told of every team | ✅ | 402 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 91 acks, 91 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-shared-final

```
Submission rush: 2000 people registering at once · IP mode: shared
  peak users 2003 · requests 90589 (376.5/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3358  med     8 ms  p95   754 ms  p99   2.04 s  max   5.22 s
  page ready (HTML + files)       3358  med    21 ms  p95   2.16 s  p99   4.95 s  max   7.45 s
  files (JS, fonts, images)      48295  med     4 ms  p95   707 ms  p99   1.50 s  max   3.76 s
  router prefetches              36760  med     2 ms  p95   561 ms  p99   1.32 s  max   4.16 s
  form submissions                2110  med     5 ms  p95   923 ms  p99   1.85 s  max   5.15 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   56  med    18 ms  p95   537 ms  p99   1.22 s  max   1.22 s

  Submissions      saved  duplicate  rate-limited  error
  answers            179          1          1930      0
  People           registered  blocked
  workshop                96     1386
  hackathon               39      360
  enquiry                 38       81

  FAILED thresholds:
    ✗ submissions{outcome:rate_limited} count==0
```

nginx: 92461 requests from 2 client IPs (max 90589 from one); statuses 200×90344, 201×186, 409×1, 429×1930.
nginx micro-cache: HIT×86978, MISS×122, not cached (disk, API)×2175, STALE×2471, UPDATING×715.
Time at nginx, request to last byte (ms): page p50 0 / p95 10 / p99 62; api p50 226 / p95 226 / p99 226; static p50 0 / p95 0 / p99 1000; admin p50 17 / p95 1213 / p99 1220; submit p50 4 / p95 29 / p99 214.
Time in Next.js (nginx upstream, ms): page p50 43 / p95 231 / p99 721 / max 721; api p50 226 / p95 226 / p99 226 / max 226; static p50 1362 / p95 1418 / p99 1420 / max 1420; admin p50 17 / p95 1213 / p99 1220 / max 1220; submit p50 4 / p95 27 / p99 208 / max 281.
CPU % (avg / peak, 100 = one core): next 11/85, mongod 1/3, nginx 6/33, smtp 0/3, k6 28/189. Peak memory MB: next 422, mongod 187, nginx 63, smtp 55, k6 4144.
Peak connections: nginx 1540, Next.js 20, MongoDB 12. SMTP: 261 e-mails over 4 connections (peak 3 open at once).
Real browser (Chromium): 41/41 attempts loaded and filled in the form, 7 registered; page load p50 494 ms / p95 788 ms; LCP p50 316 ms / p95 812 ms; submit to confirmation p50 410 ms / p95 2448 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 103 stored, 96 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 39 stored, 39 expected |
| every saved enquiry is stored | ✅ | 40 stored, 40 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 103 sent, 103/103 marked sent |
| a confirmation e-mail for every team | ✅ | 39 sent, 39/39 marked sent |
| organisers told of every team | ✅ | 39 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 40 acks, 40 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## submission-shared-final-exempt

```
Submission rush: 2000 people registering at once · IP mode: shared
  peak users 2003 · requests 91578 (407.0/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    3382  med     8 ms  p95   2.23 s  p99   4.50 s  max   8.22 s
  page ready (HTML + files)       3382  med    21 ms  p95   7.79 s  p99  11.38 s  max  16.24 s
  files (JS, fonts, images)      48555  med     3 ms  p95   2.64 s  p99   4.87 s  max   9.76 s
  router prefetches              37482  med     2 ms  p95   2.47 s  p99   4.84 s  max   8.37 s
  form submissions                2096  med    19 ms  p95   2.45 s  p99   4.82 s  max   7.48 s
  PDF / calendar                     0  med     0 ms  p95     0 ms  p99     0 ms  max     0 ms
  admin panel API                   53  med    45 ms  p95   1.11 s  p99   1.18 s  max   1.25 s

  Submissions      saved  duplicate  rate-limited  error
  answers           2071         25             0      0
  People           registered  blocked
  workshop              1471        0
  hackathon              413        0
  enquiry                116        0

  FAILED thresholds:
    ✗ http_req_duration{kind:submit} p(95)<2000
    ✗ page_ready p(95)<3000
    ✗ http_req_duration{kind:asset} p(95)<1000
    ✗ http_req_duration{kind:document} p(95)<1500, p(99)<3000
    ✗ http_req_duration{kind:prefetch} p(95)<1000
```

nginx: 93389 requests from 2 client IPs (max 91578 from one); statuses 200×91286, 201×2078, 409×25.
nginx micro-cache: MISS×129, HIT×87594, not cached (disk, API)×2158, STALE×2577, UPDATING×931.
Time at nginx, request to last byte (ms): page p50 0 / p95 13 / p99 72; api p50 146 / p95 146 / p99 146; admin p50 39 / p95 1109 / p99 1113; static p50 0 / p95 0 / p99 1000; submit p50 12 / p95 55 / p99 119.
Time in Next.js (nginx upstream, ms): page p50 54 / p95 220 / p99 660 / max 660; api p50 146 / p95 146 / p99 146 / max 146; admin p50 39 / p95 1109 / p99 1113 / max 1113; static p50 1259 / p95 1286 / p99 1286 / max 1286; submit p50 12 / p95 52 / p99 105 / max 202.
CPU % (avg / peak, 100 = one core): next 21/75, mongod 3/8, nginx 7/29, smtp 1/3, k6 30/172. Peak memory MB: next 486, mongod 192, nginx 63, smtp 58, k6 4264.
Peak connections: nginx 1517, Next.js 29, MongoDB 12. SMTP: 2593 e-mails over 28 connections (peak 3 open at once).
Real browser (Chromium): 39/39 attempts loaded and filled in the form, 7 registered; page load p50 457 ms / p95 925 ms; LCP p50 392 ms / p95 948 ms; submit to confirmation p50 1234 ms / p95 2720 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 1478 stored, 1471 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 413 stored, 413 expected |
| every saved enquiry is stored | ✅ | 125 stored, 125 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 1517 sent, 1478/1478 marked sent |
| a confirmation e-mail for every team | ✅ | 413 sent, 413/413 marked sent |
| organisers told of every team | ✅ | 413 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 125 acks, 125 notices |
| no visitor address got more than 3 e-mails | ✅ | max 2 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## daily-shared-final

```
Ordinary day: 100 people on the site at once · IP mode: shared
  peak users 101 · requests 77648 (123.2/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    4108  med     5 ms  p95    11 ms  p99    31 ms  max   240 ms
  page ready (HTML + files)       4108  med    10 ms  p95    28 ms  p99    59 ms  max   278 ms
  files (JS, fonts, images)      30965  med     2 ms  p95     6 ms  p99    18 ms  max   215 ms
  router prefetches              42366  med     1 ms  p95     4 ms  p99    10 ms  max   138 ms
  form submissions                  78  med    13 ms  p95    41 ms  p99   185 ms  max   194 ms
  PDF / calendar                   105  med     7 ms  p95    38 ms  p99    51 ms  max    72 ms
  admin panel API                   15  med    27 ms  p95   154 ms  p99   336 ms  max   382 ms

  Submissions      saved  duplicate  rate-limited  error
  answers             78          0             0      0
  People           registered  blocked
  workshop                43        0
  hackathon               10        0
  enquiry                 25        0

  All thresholds met.
```

nginx: 81766 requests from 2 client IPs (max 77648 from one); statuses 200×81681, 201×85.
nginx micro-cache: MISS×167, HIT×64147, not cached (disk, API)×207, STALE×16830, UPDATING×415.
Time at nginx, request to last byte (ms): page p50 0 / p95 45 / p99 107; api p50 6 / p95 38 / p99 71; admin p50 27 / p95 381 / p99 381; static p50 0 / p95 0 / p99 21; submit p50 12 / p95 40 / p99 193.
Time in Next.js (nginx upstream, ms): page p50 27 / p95 152 / p99 330 / max 671; api p50 6 / p95 38 / p99 71 / max 155; admin p50 27 / p95 381 / p99 381 / max 381; static p50 33 / p95 126 / p99 131 / max 131; submit p50 12 / p95 40 / p99 193 / max 193.
CPU % (avg / peak, 100 = one core): next 14/77, mongod 1/8, nginx 4/7, smtp 0/2, k6 10/36. Peak memory MB: next 438, mongod 189, nginx 30, smtp 54, k6 389.
Peak connections: nginx 103, Next.js 26, MongoDB 12. SMTP: 120 e-mails over 2 connections (peak 2 open at once).
Real browser (Chromium): 90/90 attempts loaded and filled in the form, 7 registered; page load p50 445 ms / p95 730 ms; LCP p50 304 ms / p95 688 ms; submit to confirmation p50 330 ms / p95 1239 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 50 stored, 43 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 10 stored, 10 expected |
| every saved enquiry is stored | ✅ | 25 stored, 25 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 50 sent, 50/50 marked sent |
| a confirmation e-mail for every team | ✅ | 10 sent, 10/10 marked sent |
| organisers told of every team | ✅ | 10 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 25 acks, 25 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-shared-final

```
Hackathon contest: 300 participants, peak 400 · IP mode: shared
  peak users 403 · requests 104123 (157.6/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8196  med     6 ms  p95    13 ms  p99    29 ms  max   204 ms
  page ready (HTML + files)       8196  med    10 ms  p95    25 ms  p99    51 ms  max   240 ms
  files (JS, fonts, images)      19904  med     2 ms  p95     5 ms  p99    15 ms  max    76 ms
  router prefetches              75384  med     1 ms  p95     3 ms  p99    12 ms  max   1.03 s
  form submissions                  55  med     9 ms  p95    27 ms  p99    34 ms  max    35 ms
  PDF / calendar                   523  med     5 ms  p95    17 ms  p99    43 ms  max   150 ms
  admin panel API                   50  med    23 ms  p95   671 ms  p99   1.14 s  max   1.14 s

  Submissions      saved  duplicate  rate-limited  error
  answers             40          0            15      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                 40       15

  FAILED thresholds:
    ✗ submissions{outcome:rate_limited} count==0
```

nginx: 108152 requests from 2 client IPs (max 104123 from one); statuses 200×108085, 201×52, 429×15.
nginx micro-cache: MISS×147, HIT×91405, not cached (disk, API)×637, STALE×15070, UPDATING×893.
Time at nginx, request to last byte (ms): page p50 0 / p95 30 / p99 67; api p50 4 / p95 12 / p99 38; admin p50 22 / p95 1130 / p99 1142; static p50 0 / p95 4 / p99 19; submit p50 8 / p95 19 / p99 33.
Time in Next.js (nginx upstream, ms): page p50 32 / p95 954 / p99 1015 / max 1027; api p50 4 / p95 13 / p99 38 / max 150; admin p50 22 / p95 1130 / p99 1142 / max 1142; static p50 29 / p95 62 / p99 95 / max 95; submit p50 8 / p95 19 / p99 33 / max 33.
CPU % (avg / peak, 100 = one core): next 13/66, mongod 1/4, nginx 5/9, smtp 0/1, k6 18/69. Peak memory MB: next 409, mongod 189, nginx 35, smtp 54, k6 1832.
Peak connections: nginx 413, Next.js 31, MongoDB 12. SMTP: 87 e-mails over 3 connections (peak 3 open at once).
Real browser (Chromium): 88/88 attempts loaded and filled in the form, 7 registered; page load p50 478 ms / p95 798 ms; LCP p50 328 ms / p95 732 ms; submit to confirmation p50 289 ms / p95 774 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 40 stored, 40 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 40 acks, 40 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

## contest-shared-final-exempt

```
Hackathon contest: 300 participants, peak 400 · IP mode: shared
  peak users 403 · requests 105521 (159.8/s) · failed 0.00% · checks 100.00%

  Response times                 count      median        p95        p99        max
  pages (HTML)                    8222  med     6 ms  p95    14 ms  p99    44 ms  max   832 ms
  page ready (HTML + files)       8221  med    11 ms  p95    27 ms  p99    82 ms  max   914 ms
  files (JS, fonts, images)      21160  med     2 ms  p95     5 ms  p99    15 ms  max   177 ms
  router prefetches              75514  med     1 ms  p95     4 ms  p99    23 ms  max   1.01 s
  form submissions                  46  med    10 ms  p95    26 ms  p99    55 ms  max    63 ms
  PDF / calendar                   514  med     5 ms  p95    15 ms  p99    63 ms  max   190 ms
  admin panel API                   54  med    22 ms  p95   465 ms  p99   1.16 s  max   1.18 s

  Submissions      saved  duplicate  rate-limited  error
  answers             46          0             0      0
  People           registered  blocked
  workshop                 0        0
  hackathon                0        0
  enquiry                 46        0

  All thresholds met.
```

nginx: 109575 requests from 2 client IPs (max 105521 from one); statuses 200×109517, 201×58.
nginx micro-cache: HIT×93103, MISS×140, not cached (disk, API)×623, STALE×15083, UPDATING×626.
Time at nginx, request to last byte (ms): page p50 0 / p95 28 / p99 59; api p50 4 / p95 10 / p99 45; admin p50 22 / p95 1145 / p99 1176; static p50 0 / p95 4 / p99 15; submit p50 10 / p95 25 / p99 63.
Time in Next.js (nginx upstream, ms): page p50 32 / p95 941 / p99 1004 / max 1013; api p50 4 / p95 10 / p99 45 / max 163; admin p50 22 / p95 1145 / p99 1176 / max 1176; static p50 128 / p95 174 / p99 176 / max 176; submit p50 10 / p95 25 / p99 63 / max 63.
CPU % (avg / peak, 100 = one core): next 13/71, mongod 1/4, nginx 5/19, smtp 0/1, k6 17/64. Peak memory MB: next 404, mongod 196, nginx 34, smtp 54, k6 1830.
Peak connections: nginx 405, Next.js 34, MongoDB 12. SMTP: 99 e-mails over 1 connections (peak 1 open at once).
Real browser (Chromium): 90/90 attempts loaded and filled in the form, 7 registered; page load p50 446 ms / p95 749 ms; LCP p50 296 ms / p95 748 ms; submit to confirmation p50 303 ms / p95 1419 ms.

| Data check | | |
| --- | --- | --- |
| every registered person is stored once (workshop) | ✅ | 7 stored, 0 expected from k6 + 7 from the browser probe |
| every registered team is stored once (hackathon) | ✅ | 0 stored, 0 expected |
| every saved enquiry is stored | ✅ | 46 stored, 46 expected |
| no e-mail address registered twice | ✅ | 0 duplicates |
| no team name registered twice | ✅ | 0 duplicates |
| nobody in two teams | ✅ | 0 people |
| a confirmation e-mail for every workshop registration | ✅ | 7 sent, 7/7 marked sent |
| a confirmation e-mail for every team | ✅ | 0 sent, 0/0 marked sent |
| organisers told of every team | ✅ | 0 notices |
| an acknowledgement and an organiser notice for every enquiry | ✅ | 46 acks, 46 notices |
| no visitor address got more than 3 e-mails | ✅ | max 1 |
| no server errors (5xx) at nginx | ✅ | none |
| nginx had enough connections | ✅ | 0 "worker_connections are not enough" |
| no errors logged by the site | ✅ | 0 errors, 0 mail failures |

