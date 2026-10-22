# Security report

**Site:** Agentic AI Workshop 2026 website and admin panel (Next.js 16, MongoDB)
**Date:** 15 October 2026
**Method:**
- A line-by-line review of every API route, the validation, authentication, storage and output code, plus a second, independent review.
- Every finding was fixed.
- The fixes were then checked by attacking a production build (`next build && next start`, real MongoDB, a local mail server) with a scripted suite of **246 attack checks**.
- Also run:
  - the **36-check end-to-end test** of the Site settings editor and live preview;
  - a page-by-page comparison of every public page with the last release, at desktop and phone widths;
  - a browser sweep of all 29 public and admin pages for Content-Security-Policy violations.

**Result:**

| Check | Result |
| --- | --- |
| Attack checks | 246/246 pass |
| Editor checks | 36/36 pass |
| Public pages vs last release (1280 px and 390 px) | Identical on every page |
| CSP sweep | No violations or page errors |
| `npm audit` (production dependencies) | 0 vulnerabilities |

The [findings table](#2-what-was-found-and-fixed) lists what was found and fixed. The [residual risks](#8-residual-risks-and-recommendations) are what is left, and why.

---

## 1. Volunteer permissions: Site settings by page

Volunteers still get one permission per area of the admin panel. Site settings is now split: **one permission per tab**, 15 in all.

| Group | Permissions |
| --- | --- |
| Site settings (one per tab) | Site-wide, Home, About, Programme, Speakers, Tutorials, Hackathon, Hackathon registration, Registration, Partners, Venue, Organisers, Photo gallery, Slides & recordings, Meet Aura |
| Event | Hackathon, Announcements |
| Programme | Sessions, Speakers, Tutorials, Demos |
| Content | People, Kiosks, Sponsors, FAQs |
| Post-event | Gallery, Talks |
| Responses | Registrations, Enquiries |
| Files | Media library |
| Separate | Delete items |

The server enforces this, not only the screen (`src/lib/server/settings-access.ts`):

- **Reading.** A volunteer receives only their pages' fields. They also get the public event details that the texts' placeholders use (event name, dates, venue, tagline, organiser). Private settings never reach them unless they have *Site-wide*: the notification e-mail, contact phone and analytics ID.
- **Saving and previewing.**
  - What a volunteer sends is merged over the saved settings, and only their pages' fields are taken from it.
  - A request that also contains the event name, the notification e-mail, another page's texts or the registration status leaves all of those untouched.
  - Their preview drafts work the same way.
- **The screen.**
  - The editor shows only their tabs. `?page=<tab>` opens one of them; a link to a page they don't have opens their own page instead.
  - The sidebar and dashboard link to their pages ("Site settings › Venue").
  - The task tracker names the page changed ("Site settings › Home").
- **Media.** Upload rights now follow need: only pages and content types with an image or file field come with access to the media library.
- **Older accounts.** Volunteers who had the old single "Site settings" permission keep every page. New accounts can't be given the old catch-all.

Every settings field belongs to exactly one page; this was checked by script (126 fields, no overlaps, none unassigned).

## 2. What was found and fixed

Severity: **High** means exploitable by an outsider or a low-privilege account. **Medium** is exploitable with conditions. **Low** is defence in depth.

| # | Severity | Area | Finding | Fix |
| --- | --- | --- | --- | --- |
| 1 | High | Sessions | Signing out only deleted the cookie in the browser. A copied token stayed valid for 7 days. Changing a password, disabling or deleting an account did not end existing sessions. | Every sign-in now creates a session record in the database (`admin_sessions`, expired automatically by a TTL index). The JWT carries its id, and every admin request checks it. Sign-out deletes the session. A password change ends the account's other sessions. An administrator's password reset, disable or delete ends all of them. |
| 2 | High | Rate limits | The client IP for rate limits was the first `X-Forwarded-For` entry, which the visitor can type. Every limit could be bypassed by changing that header. | The last entry is used: the one the reverse proxy adds. `CLIENT_IP_HEADER` names another trusted header if needed. IPv6 addresses count per /64. Docker Compose now publishes the app port on localhost only, so the proxy can't be bypassed. |
| 3 | High | Uploads | An uploaded SVG could carry a script, for example inside a namespaced `<x:script>`. If an admin opened the file's link, the script ran on the site's origin with the admin's session. The SVG sandbox header was also being silently replaced by the site-wide one (Next applies config headers before a route's own). | SVGs are checked after decoding character references: scripts in any namespace, event handlers, `javascript:` (even split by tabs or encoded), `foreignObject`, `<!ENTITY>`. When opened directly they are downloaded, not displayed, and served with `sandbox`. `/api/media` is exempt from the site-wide CSP rule so its own per-type policy applies. |
| 4 | High | Mail | Through the public forms, anyone could get the event's mail server to send text of their choice to any address. The enquiry acknowledgement repeated the visitor's message. | The acknowledgement repeats nothing the visitor typed. Every e-mail to an address typed into a form is capped at 3 per address per day, covering the to: and cc: addresses alike. |
| 5 | High | CSP | No Content-Security-Policy and no HSTS. | Policy on every page: scripts only from the site and Google Analytics; no plugins; no `<base>` hijacking; forms post only to the site; framing only by the site itself. Plus HSTS, COOP and a tighter Permissions-Policy. |
| 6 | Medium | Enumeration | The workshop form told anyone whether an e-mail address was already registered. | With e-mail set up, the answer is identical for new and already-registered addresses. The registration ID goes by e-mail, and the original registrant gets their confirmation again. |
| 7 | Medium | Enumeration | Sign-in answered faster for unknown and disabled accounts, because no password hash was checked. That let anyone find out who has an account. | A password hash is always checked (a dummy hash for unknown accounts), and the account is checked only afterwards. Measured medians: 381, 389 and 361 ms for an unknown e-mail, a wrong password and a disabled account. |
| 8 | Medium | Lockout | Per-account limits counted every attempt, so anyone could lock an administrator out. | Only failed attempts count: 8 per account per address, 100 per account in total, 10 per address. A correct password from elsewhere always works. |
| 9 | Medium | Links | The validation library accepts `javascript:` as a valid URL. The public project-link field and the preview drafts relied on it. Admin links allowed `//other-host`. | One shared rule: links must be `https://`, `http://`, `mailto:`, `tel:` or a path on the site. Drafts may hold unfinished links but never another scheme; the check follows browser rules, ignoring tabs and leading spaces. Rich-text links follow the same rule. |
| 10 | Medium | Drafts | The public forms read settings through the preview path. A browser in Draft Mode could make registration follow an unsaved draft: its status, deadlines and where notifications go. | The API routes read the saved settings only. The preview can't be switched on from another site's link. |
| 11 | Medium | Admins | An admin could demote, disable or delete themselves by writing their id in capitals, and the last administrator could be removed. | Ids are normalised, and the last active administrator can't be demoted, disabled or deleted. |
| 12 | Low | Input | No control-character cleaning. Lists, multi-select fields and references had no item limit. Dates had no length limit. The hackathon track was free text. | Every field strips control characters and bidi overrides (Indic joiners are kept); single-line fields also turn line breaks into spaces. Lists are capped at 200 items; dates and times are length-capped; tracks must be one of the tracks. |
| 13 | Low | Bodies | JSON bodies were read whole before the size check, with no Content-Type check. A form-encoded cross-site POST could carry JSON. | Bodies are streamed with a hard byte cap. `application/json` and valid UTF-8 are required. Uploads are refused from their declared length before reading. |
| 14 | Low | CSRF | `Sec-Fetch-Site: same-site` was accepted, letting sibling subdomains send changes. | Only `same-origin` (or a typed URL) is accepted. Sign-out is protected too. |
| 15 | Low | Passwords | bcrypt silently ignores bytes after the 72nd. Passwords like `aaaaaaaaaa` were accepted. | New passwords must be 10 characters to 72 bytes, with at least 4 different characters. A password change must differ from the old one. Changing your own password is rate-limited. |
| 16 | Low | JWT | No issuer, audience or session id in the token. Weak secrets were accepted if 32 characters long. | Tokens carry `iss`, `aud`, `jti`, `iat` and `exp`, all required; only HS256 is accepted; tokens are capped at 4 KB. In production, a secret that is short, repetitive or the development secret is refused. |
| 17 | Low | ReDoS | The rich-text parser was quadratic on input like 20,000 `[` characters: 309 ms per render, reachable through the calendar route. | Every pattern is bounded: 30 ms on the same input. |
| 18 | Low | Prototype keys | `/api/admin/content/constructor` and `/singleton/toString` matched built-in object properties, which crashed with 500. | Lookups use prototype-free maps and own properties only: 404. |
| 19 | Low | Bodies | A malformed or empty body to the settings or hackathon save could reset everything to defaults. | Non-object bodies are refused with 400 before anything is read or saved. |
| 20 | Low | Leaks | `/api/admin/auth/me` returned the session id. Uploaded files' original names and alt text were not length-capped. | Removed, and capped. |

A data-safety bug was caught during testing, before it could do harm. The new session model was first named `Session`, which is already the model for the programme's sessions (talks). It was renamed `AdminSession`, with its own collection. The programme data was checked: unchanged, with no stray indexes.

## 3. Injection, and type and length checking

**Every value that reaches the database, a page, an e-mail, a CSV or a calendar file is validated on the server.**

| Form or route | Checks |
| --- | --- |
| Workshop registration | Every field typed and length-capped: name 120, e-mail 160, organisation 160, message 1000, and so on. The category must be one of the categories; at most 3 interests, each from the list; true/false fields must be booleans; consent must be `true`. |
| Hackathon registration | 1–6 members, each with a unique e-mail; team name 2–60; the track must be a real track; the project link must be `https://`; idea summary up to 1500. |
| Contact and partner enquiries | Type from the list; message 10–3000; subject 160. |
| Sign-in | E-mail up to 254 characters, password up to 200; the body is capped at 4 KB. |
| All admin content, settings and hackathon editors | Built from the field definitions. Every field has a type and a maximum length; options must be options; colours must be `#rrggbb`; numbers are bounded; dates and times must have their format; lists, multi-selects and references are capped. |
| Volunteers and users | Role from the list; e-mail up to 254 characters; permissions from the list; passwords as in [§5](#5-passwords). |
| Statuses and notes | Registration status from the list; notes up to 5000 characters. |
| Body sizes | 4 KB for sign-in, 64 KB by default, 512 KB for content, 1 MB for settings, 8 MB for uploads (`MAX_UPLOAD_MB`). |

How each kind of injection is closed off:

- **NoSQL injection.**
  - The schemas keep only the fields they define, each of its own type. An operator (`{"$ne": ""}`), `$where`, `__proto__` or `constructor` is either refused (wrong type) or dropped (unknown key).
  - Query parameters are only ever strings, and ids must be 24 hex characters.
  - Tested: operator log-ins, operator e-mails, extra keys in registrations and content, operators in query strings.
- **XSS.**
  - Text is rendered by React, which escapes it. There is no raw HTML anywhere except the JSON-LD block, whose `<` is escaped.
  - Rich text supports only safe Markdown, with links limited to the safe schemes.
  - Colours and the Google Analytics ID are pattern-checked before they reach CSS or a script.
  - Tested: `<script>`, `<img onerror>`, `javascript:` Markdown links, and a `</script>` event name breaking out of JSON-LD.
- **E-mail header injection.** Single-line fields lose their line breaks, and the mail library also encodes headers. E-mail HTML is escaped.
- **CSV formula injection.** Cells starting with `=`, `+`, `-`, `@`, tab or CR are prefixed with `'`.
- **Calendar files.** ICS text is escaped, including line breaks.
- **Path traversal.** Files are fetched from GridFS by ObjectId only.
- **Header injection.** The preview's redirect accepts only plain site paths, so line breaks, `//host` and `/\host` are refused.

## 4. JSON Web Tokens and sessions

**Token.**
- An HS256 JWT signed with `AUTH_SECRET` (32+ random characters, required in production).
- It carries issuer `aaiw`, audience `aaiw-admin`, a 256-bit random session id (`jti`), issued-at, and expiry after 7 days.
- Verification accepts only HS256 with that secret and requires every one of those claims.
- Tested and refused:
  - an unsigned token (`alg: none`), a tampered payload, another or the development secret, HS512;
  - a missing, forged or another user's session id;
  - an expired token, the wrong audience or issuer, no subject, garbage, and a 5,000-character cookie.

**Cookie.** `aaiw_admin`, `HttpOnly`, `SameSite=Lax`, `Secure` in production (over HTTPS), 7 days, limited to the site's path.

**Sessions.**
- Every request to the admin API checks the token, then its session in the database, then the account (it must exist and be active).
- Role and permissions are read from the database each time, so changes apply at once.
- Each account may be signed in on up to 10 browsers at once. **My account** lists them and can sign out all the others.
- Sessions end when:

| Event | Sessions ended |
| --- | --- |
| Signing out | That browser's session (a saved copy of the cookie stops working) |
| Changing your own password | Every other session |
| An administrator resets the password, disables or deletes the account | Every session, at once |
| 7 days after sign-in | That session (removed from the database automatically) |

- Admin pages redirect to sign-in without a valid token. Every admin API route refuses requests without a session; all 24 listed in the test were checked.

**CSRF.**
- Changes must come from the site's own pages: `Sec-Fetch-Site: same-origin`, and an `Origin` host equal to the site's.
- JSON bodies require `Content-Type: application/json`, which a plain HTML form can't send.
- Tested for admin changes, sign-in, sign-out, the public forms and the preview.

**Who can do what.**
- Administrators only: users, volunteers, the task tracker's review, deleting registrations and enquiries.
- Editors: all content.
- Volunteers: their permissions only, with deleting a separate permission.
- Tested: editors can't manage users or change an admin's password; volunteers can't reach other areas, exports, users or statistics.

## 5. Passwords

- **Never stored in plain text.** Passwords are stored only as salted **bcrypt** hashes with cost 12 (`$2b$12$…`). The test searched every collection of the database for the test passwords in plain text and found none.
- **Never shown.** A hash is never sent in any API response (`{ passwordHash: 0 }` projections and explicit field lists), never logged, and never put in the token or the task tracker. Checked: users, volunteers, me, sessions, activity, the sign-in response and the server log.
- **Rules.** 10 characters to 72 bytes (bcrypt's limit), at least 4 different characters, and different from the current one. The same rules apply in the admin, the API and `npm run create-admin`.
- **Bootstrap.** The first administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD` is created only on an empty database. The comparison is constant-time, and only the hash is stored.

## 6. Information leakage

- **Accounts.** Unknown e-mail, wrong password and disabled account get the same answer in the same time.
- **Registrations.** With e-mail set up, new and already-registered addresses get the same answer, and the ID goes only to the inbox. The hackathon form refuses a member who is already in a team without naming the address or the team.
- **Settings.** Volunteers see only their pages. Refused requests say nothing about the data.
- **Errors.** No stack traces, file paths or database errors in any response; tested with malformed requests to every public route. Errors are logged on the server only.
- **Pages.** Public pages contain no notification e-mail, secret or database detail. Browser source maps aren't published. `/api/health` reports only `status` and `db`.
- **Admin.** Admin pages are `noindex` and `no-store`, and every admin API answer is `no-store`. `robots.txt` excludes `/admin` and `/api`, and the sitemap lists neither.
- **Task tracker.** Volunteers see only their own changes. A password change is recorded as an event, never with the password.

## 7. Security headers (every page)

| Header | Value |
| --- | --- |
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; frame-src 'self'` plus the YouTube, Vimeo and Google Maps embeds; `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'` … |
| Strict-Transport-Security | `max-age=31536000` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `SAMEORIGIN` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Cross-Origin-Opener-Policy | `same-origin` |
| Permissions-Policy | camera, microphone, geolocation, payment, USB and topics off |
| X-Powered-By | not sent |

Uploaded files (`/api/media/…`) get `default-src 'none'; sandbox`. PDFs are the exception: browsers won't show a sandboxed PDF, so they only get `frame-ancestors 'self'`.

## 8. Residual risks and recommendations

None of these is exploitable as things stand. Each is a deliberate trade-off or depends on how the site is deployed.

1. **Deploy behind HTTPS and the reverse proxy, as in the README.**
   - The `Secure` cookie flag, HSTS and the per-IP rate limits all depend on it.
   - Keep the app port on localhost, which Compose now does by default. Keep `AUTH_SECRET` 32+ random characters.
   - Never set `COOKIE_SECURE=false` in production; it exists only for testing over plain HTTP.
2. **Configure SMTP in production.**
   - Without e-mail, the registration ID must be shown on screen. The workshop form then still says "already registered" for a known address (an enumeration leak that only e-mail removes).
   - The hackathon's one-team-per-person rule inherently tells a submitter that *someone* in their team is already registered. The answer names no address or team, and submissions are rate-limited. Organisers who prefer no signal at all could drop the rule and remove duplicates in the admin.
3. **`'unsafe-inline'` scripts in the CSP.**
   - Next.js puts inline scripts in statically generated pages. Removing `'unsafe-inline'` needs per-request nonces, which would make every page dynamic: slower, and no caching.
   - XSS protection therefore rests on escaping and validation, which the tests cover. The CSP still blocks third-party scripts, plugins, `<base>` hijacking, foreign form targets and framing.
4. **Rate limits live in the memory of one Node process,** which is the documented deployment. Running several instances would need a shared store such as Redis.
   - The public forms allow each person (IP address and e-mail) 8 registrations, 6 teams or 5 messages per 10 to 15 minutes, and one address as a whole 100, 40 and 40, so that a campus or office network where dozens share an address can register (the load tests found the earlier per-address limits of 8, 6 and 5 turned most of such a network away; see `docs/LOAD_TEST_REPORT.md`). One machine can therefore send up to 100 confirmation e-mails in 15 minutes to addresses it chooses, each address at most 3 a day. Networks in `RATE_LIMIT_EXEMPT` have no per-address ceiling: list only ones you trust, such as the institute's own.
5. **One shared preview draft.**
   - Two people editing Site settings at the same time see each other's unsaved changes in their previews.
   - Next's Draft Mode cookie is the same for every browser of a build, so a former volunteer who kept it could view a draft while one is being edited, and the photo gallery and slides pages before they are switched on (the preview shows them so their texts can be prepared). Drafts expire after 2 hours or when the editor closes, and the public forms ignore drafts.
6. **Sessions have a 7-day absolute lifetime and no idle timeout,** and there is no two-factor sign-in. Both would be worth adding if the admin panel's audience grows.
7. **PDF uploads are shown inline** (browsers run PDF scripts in their own sandbox). Only administrators and volunteers with upload rights can upload.
8. **Development dependencies.** `npm audit` reports a `braces` advisory, reached only through the ESLint configuration (`eslint-config-next`), which is a development tool and isn't part of the deployed site. It goes away with the next `eslint-config-next` release.
9. **Accounts set up before this change** with passwords over 72 bytes still sign in: bcrypt compares their first 72 bytes, as it always did. New passwords can't exceed the limit.

## Appendix: the attack checks (246/246 passed)

They were run against the production build on 15 October 2026, with e-mail going to a local test mail server.

<details>
<summary><b>Volunteer permissions: Site settings per page</b>: 35/35 passed</summary>

- ✅ volunteer with Home only can read Site settings
- ✅ …and receives Home's fields
- ✅ …but not other pages' fields (About, Site-wide)
- ✅ …and not private settings (notification e-mail, contact phone, analytics)
- ✅ …only the public event details placeholders need
- ✅ volunteer can save their own page
- ✅ …the Home change is saved
- ✅ …a smuggled Site-wide field (event name) is ignored
- ✅ …a smuggled private field (notification e-mail) is ignored
- ✅ …a smuggled field of another page (About) is ignored
- ✅ …registration status unchanged
- ✅ a partial save by a volunteer keeps every other setting
- ✅ the task tracker names the page changed
- ✅ …and lists only Home's fields as changed
- ✅ a volunteer's preview draft changes only their page
- ✅ volunteer with Home + About reads exactly those pages
- ✅ volunteer without Site settings pages can't read Site settings
- ✅ volunteer without Site settings pages can't save Site settings
- ✅ volunteer without Site settings pages can't open the preview
- ✅ volunteer without Site settings pages can't store a preview draft
- ✅ volunteer with only Speakers can't read Site settings
- ✅ …but can read Speakers
- ✅ …and can't save the Hackathon
- ✅ …and can't open /users
- ✅ …and can't open /volunteers
- ✅ …and can't open /stats
- ✅ …and can't open /export/workshop
- ✅ …and can't open /registrations
- ✅ …and can't open /enquiries
- ✅ …but may upload (speakers have photos)
- ✅ Home-only volunteer can't upload (no images on Home)
- ✅ an older volunteer's single "settings" permission now means every page
- ✅ …so they still see all of Site settings
- ✅ new accounts can't be given the old catch-all "settings" permission
- ✅ unknown permissions are refused

</details>

<details>
<summary><b>Injection: NoSQL operators, prototype keys, XSS, headers, CSV, SVG</b>: 55/55 passed</summary>

- ✅ login with Mongo operators instead of strings is refused
- ✅ login with an array e-mail is refused
- ✅ login with an operator as password is refused
- ✅ login with injection strings just fails
- ✅ registration with an operator as e-mail is refused
- ✅ registration with extra keys is stored without them
- ✅ …and no prototype is polluted on the server (it keeps working)
- ✅ control characters, line breaks and bidi overrides are removed from names
- ✅ CSV export defuses formulas (=, +, @)
- ✅ link "javascript:alert(1)" is refused in content
- ✅ link "JaVaScRiPt:alert(1)" is refused in content
- ✅ link " javascript:alert(1)" is refused in content
- ✅ link "java\tscript:alert(1)" is refused in content
- ✅ link "data:text/html,<script>alert(1)</script>" is refused in content
- ✅ link "vbscript:msgbox(1)" is refused in content
- ✅ link "//evil.test/x" is refused in content
- ✅ link "/\\evil.test" is refused in content
- ✅ link "file:///etc/passwd" is refused in content
- ✅ link "javascript:alert(1)" can't become a script link even in a preview draft
- ✅ link "java\nscript:alert(1)" can't become a script link even in a preview draft
- ✅ link "\u0001javascript:alert(1)" can't become a script link even in a preview draft
- ✅ link "data:text/html;base64,PHNjcmlwdD4=" can't become a script link even in a preview draft
- ✅ link "//evil.test" can't become a script link even in a preview draft
- ✅ …while an unfinished https link previews fine
- ✅ HTML typed into content is shown as text, not run
- ✅ a javascript: link in rich text is not made a link
- ✅ …while an https link in rich text is
- ✅ a colour that isn't a hex colour is refused
- ✅ an event name with </script> can't break out of the JSON-LD block
- ✅ an analytics ID with script in it is never put in the page
- ✅ prototype name in a URL (/content/constructor) finds nothing
- ✅ prototype name in a URL (/content/__proto__) finds nothing
- ✅ prototype name in a URL (/content/toString) finds nothing
- ✅ prototype name in a URL (/singleton/__proto__) finds nothing
- ✅ prototype name in a URL (/singleton/constructor) finds nothing
- ✅ prototype name in a URL (/singleton/toString) finds nothing
- ✅ prototype name in a URL (/content/hasOwnProperty/reorder) finds nothing
- ✅ operators in query parameters are plain text
- ✅ content with an object where text belongs is refused
- ✅ content with extra keys is stored without them
- ✅ SVG with <script> is refused
- ✅ SVG with a namespaced <x:script> is refused
- ✅ SVG with an onload handler is refused
- ✅ SVG with an entity-encoded javascript: link is refused
- ✅ SVG with a javascript: link split by a tab is refused
- ✅ SVG with foreignObject HTML is refused
- ✅ SVG with an <!ENTITY> declaration is refused
- ✅ a plain SVG is accepted
- ✅ …and served as a download, sandboxed, with nosniff
- ✅ an HTML file named .png is refused
- ✅ PDFs are served inline (viewable) but can't be framed by other sites
- ✅ an upload declaring 50 MB is refused before it is read
- ✅ media path /api/media/..%2F..%2Fetc%2Fpasswd finds nothing
- ✅ media path /api/media/%7B%22%24ne%22%3A1%7D finds nothing
- ✅ media path /api/media/000000000000000000000000 finds nothing

</details>

<details>
<summary><b>Type and length checks on every form</b>: 52/52 passed</summary>

- ✅ registration: a 121-character name is refused
- ✅ registration: a 161-character e-mail is refused
- ✅ registration: an invalid e-mail is refused
- ✅ registration: a phone with letters is refused
- ✅ registration: an unknown category is refused
- ✅ registration: four interests (max 3) is refused
- ✅ registration: an unknown interest is refused
- ✅ registration: a 1001-character message is refused
- ✅ registration: "yes" where true/false belongs is refused
- ✅ registration: consent as the string "true" is refused
- ✅ registration: a number as the name is refused
- ✅ registration: an empty name is refused
- ✅ registration: a name of only control characters is refused
- ✅ enquiry: a 3001-character message is refused
- ✅ enquiry: a 9-character message is refused
- ✅ enquiry: an unknown type is refused
- ✅ enquiry: a 161-character subject is refused
- ✅ enquiry: an array as the message is refused
- ✅ hackathon: seven members (max 6) is refused
- ✅ hackathon: no members is refused
- ✅ hackathon: a 61-character team name is refused
- ✅ hackathon: an unknown track is refused
- ✅ hackathon: markup as the track is refused
- ✅ hackathon: a javascript: project link is refused
- ✅ hackathon: a data: project link is refused
- ✅ hackathon: two members with one e-mail is refused
- ✅ a body over 64 KB is refused
- ✅ a streamed body over 64 KB without a length is cut off and refused
- ✅ a JSON body sent as text/plain (form CSRF style) is refused
- ✅ invalid UTF-8 is refused
- ✅ a JSON array instead of an object is refused
- ✅ malformed JSON is refused
- ✅ a sign-in over 4 KB is refused
- ✅ settings: a number where text belongs is refused
- ✅ settings: text over its limit is refused
- ✅ settings: a list over 200 items is refused
- ✅ settings: a choice that isn't an option is refused
- ✅ settings: an invalid date is refused
- ✅ settings: on/off switches only take true/false
- ✅ settings: an array body is refused (nothing is reset)
- ✅ hackathon: a null body is refused and nothing is reset
- ✅ settings: a body over 1 MB is refused
- ✅ content: text over its limit is refused
- ✅ content: reordering over 1000 items is refused
- ✅ enquiry notes over 5000 characters are refused
- ✅ a registration status that isn't an option is refused
- ✅ a password of 9 characters is refused
- ✅ a password of more than 72 bytes is refused
- ✅ a password of too repetitive is refused
- ✅ an e-mail over 254 characters is refused
- ✅ a user role that doesn't exist is refused
- ✅ the Users page can't create volunteers without permissions checks

</details>

<details>
<summary><b>JSON Web Tokens and sessions</b>: 63/63 passed</summary>

- ✅ the session cookie is HttpOnly, SameSite=Lax, 7 days
- ✅ (the Secure flag is off only because this test runs over plain HTTP with COOKIE_SECURE=false)
- ✅ the token is an HS256 JWT with issuer, audience, expiry and a session id
- ✅ the token holds no password or hash
- ✅ control: a correctly signed token for a live session works
- ✅ a token with alg "none" (unsigned) is refused
- ✅ a token with a payload changed after signing is refused
- ✅ a token with the wrong secret is refused
- ✅ a token with the development secret is refused
- ✅ a token with HS512 instead of HS256 is refused
- ✅ a token with no session id (an older token) is refused
- ✅ a token with a session id that doesn't exist is refused
- ✅ a token with another user's session id is refused
- ✅ a token with an expired token is refused
- ✅ a token with the wrong audience is refused
- ✅ a token with the wrong issuer is refused
- ✅ a token with no subject is refused
- ✅ a token with a garbage cookie is refused
- ✅ a token with a 5000-character cookie is refused
- ✅ /auth/me doesn't reveal the session id
- ✅ every admin API route refuses requests without a session (14 routes)
- ✅ every admin API change refuses requests without a session
- ✅ admin pages redirect to sign-in without a session
- ✅ …and with a forged token
- ✅ one account can be signed in in several browsers at once
- ✅ My account lists them, marking this browser
- ✅ signing out clears the cookie
- ✅ …and ends the session: a saved copy of the cookie no longer works
- ✅ …while the other browsers stay signed in
- ✅ changing your password works
- ✅ …keeps you signed in here
- ✅ …and signs you out everywhere else
- ✅ …the old password no longer works
- ✅ changing it needs the current password
- ✅ disabling a volunteer signs them out at once
- ✅ …and they can't sign in
- ✅ re-enabling doesn't bring old sessions back
- ✅ an administrator resetting a volunteer's password signs them out
- ✅ permission changes apply to a signed-in volunteer immediately (no re-login)
- ✅ deleting a volunteer signs them out and removes their sessions
- ✅ each account keeps at most 10 sessions (oldest ended)
- ✅ "Sign out on other devices" ends every other session
- ✅ sessions expire in the database too (TTL index)
- ✅ a cross-site request (Origin: another site) is blocked
- ✅ a cross-site request (Sec-Fetch-Site: cross-site) is blocked
- ✅ a cross-site request (Sec-Fetch-Site: same-site (a sibling subdomain)) is blocked
- ✅ a cross-site request (Origin: null) is blocked
- ✅ a cross-site sign-out is blocked
- ✅ a link on another site can't switch on preview mode
- ✅ preview won't open "//evil.test"
- ✅ preview won't open "/\\evil.test"
- ✅ preview won't open "https://evil.test"
- ✅ preview won't open "/admin"
- ✅ preview won't open "/api/admin/users"
- ✅ preview won't open "/%0d%0aSet-Cookie:x=1"
- ✅ preview won't open "/a\r\nb"
- ✅ an admin can't demote themselves (even writing their id in capitals)
- ✅ …or delete themselves
- ✅ an editor can't GET /users (administrators only)
- ✅ an editor can't POST /volunteers (administrators only)
- ✅ an editor can't PATCH /activity (administrators only)
- ✅ an editor can't GET /activity (administrators only)
- ✅ an editor can't change an admin's password

</details>

<details>
<summary><b>Passwords</b>: 6/6 passed</summary>

- ✅ every password is stored as a bcrypt hash with cost 12
- ✅ no password appears in plain text anywhere in the database
- ✅ sessions store no token or password, only a random id, browser and times
- ✅ no API response contains a password hash
- ✅ the server log contains no password
- ✅ the tracker records that a password was changed, never the password

</details>

<details>
<summary><b>Sign-in: brute force, lockout and account enumeration</b>: 6/6 passed</summary>

- ✅ after 8 wrong passwords from one address, that address is held back
- ✅ …but the real user elsewhere can still sign in (no lockout)
- ✅ a faked X-Forwarded-For entry doesn't get round the limit (the proxy's own entry counts)
- ✅ IPv6 addresses count per /64, so hopping inside one block doesn't help
- ✅ unknown e-mail, wrong password and disabled account get the same answer
- ✅ …in the same time (medians 381 / 389 / 361 ms)

</details>

<details>
<summary><b>Information leaks</b>: 19/19 passed</summary>

- ✅ registering an address that is already registered gets the same answer as a new one
- ✅ …which doesn't include the registration ID (that goes by e-mail)
- ✅ …the real owner of the address gets their confirmation (twice: new, then re-sent)
- ✅ …and the re-sent one has the original name, not the new submission's
- ✅ an address typed into the forms gets at most 3 e-mails a day
- ✅ the acknowledgement repeats nothing the visitor typed (no relaying of phishing text)
- ✅ organisers are still notified of each enquiry
- ✅ hackathon: a member already in a team is refused without naming the address or the team
- ✅ in preview mode the registration form still uses the saved settings (closed stays closed)
- ✅ …while the preview itself does show the draft
- ✅ bad requests never get stack traces, file paths or database errors back
- ✅ /api/health says only whether the database is connected
- ✅ public pages contain no notification e-mail, secrets or database details
- ✅ browser source maps aren't published
- ✅ the admin panel is kept out of search engines
- ✅ admin pages are noindex and not cached
- ✅ admin API answers are never cached
- ✅ a refused request says nothing about the data
- ✅ volunteers see only their own changes in the tracker

</details>

<details>
<summary><b>Security headers</b>: 10/10 passed</summary>

- ✅ Content-Security-Policy: scripts only from the site and Google Analytics
- ✅ …no plugins, no <base> hijack, forms post only to the site
- ✅ …only the site itself may frame it (the admin preview), and it may frame itself
- ✅ strict-transport-security is set
- ✅ x-content-type-options is set
- ✅ x-frame-options is set
- ✅ referrer-policy is set
- ✅ cross-origin-opener-policy is set
- ✅ permissions-policy is set
- ✅ X-Powered-By isn't sent

</details>

