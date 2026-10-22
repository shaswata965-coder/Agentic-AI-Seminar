# Load test runs, 22 October 2026

The full report of every run behind [LOAD_TEST_REPORT.md](LOAD_TEST_REPORT.md), as `loadtest/tools/report.mjs` wrote it. Run names are `<scenario>-<IP mode>[-<variant>]`: `readme-10min` is the README deployment with the 2,000 arriving over ten minutes, `tuned` is the first tuned nginx (nginx compressing every response) and `tuned-v2` the recommended one (now `loadtest/stack/nginx.tuned.conf.template`). The daily-distinct browser probe predates its own submission cap, so after 8 registrations it was rate-limited itself; its page timings are unaffected.

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

