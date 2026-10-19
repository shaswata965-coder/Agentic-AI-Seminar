# Requirements checklist

How the website meets each section of the *Website Requirements Brief — Agentic AI Workshop 2026*. Paths are on the public site; "Admin →" means the admin panel at `/admin`.

## 1. Event at a glance

| Brief | Where |
| --- | --- |
| Event name (final name/logo to be confirmed) | Admin → Site settings → Site-wide → Event details; event logo under Logos & images |
| Organised by IIT Delhi and ScAI, IIT Delhi | Hero, footer, About, JSON-LD organiser data |
| Tue 15 – Wed 16 December 2026 | Hero, countdown, calendar files, programme day tabs (dates come from the start/end settings) |
| Venue IIT Delhi, Hauz Khas (hall TBA) | Hero, the home route map and `/venue`; the hall shows "to be announced" until it is set |
| Three themes; activities; audience | Themes section; About section (activities, who should attend), all editable |
| Goal: inform, drive registrations, showcase speakers and partners, single source for updates | Announcements box, registration forms, speakers and partners sections, site-wide banner |

## 2. Site structure

| Menu item | Implemented as |
| --- | --- |
| Home | `/`: single scroll with sticky top navigation and reading-progress bar |
| About | Page `/about` (in the navigation bar; topics around Aura on home at `/#about`) |
| Themes | Section `/#themes` |
| Programme | Page `/programme` with an overview, the schedule, industry kiosks and the hackathon |
| Speakers | Page `/speakers` (featured speakers on home) |
| Tutorials & Demos | Page `/tutorials` |
| Industry Kiosks | Section `/programme#kiosks` |
| Hackathon | Page `/hackathon` (+ `/hackathon/register`; teaser on home) |
| Registration | Page `/register`, or an external form link (Admin → Site settings → Site-wide → Registration) |
| Organisers | Page `/organisers` |
| Venue & Travel | Page `/venue`, with the interactive route map at `/#venue` |
| Partners / Sponsors | Page `/partners` (logo strip on home at `/#partners`) |
| FAQ & Contact | Section `/#faq` and `/#contact` |

## 3. Section-wise content

| Section | Requirement | Status |
| --- | --- | --- |
| Hero | Title, tagline, dates, venue, IIT Delhi + ScAI logos, live countdown to 15 Dec 2026, Register / Join the Hackathon / View Programme buttons | ✅ Changed on request: the IIT Delhi emblem and the ScAI logo sit at the left and right corners of the navigation bar; Register and the Programme are in the navigation bar, and the hackathon is under *Explore*. Add to calendar and share are in About and the footer |
| | Highlight strip (speakers, tutorials, demos, kiosks, prize pool; TBA) | ✅ Editable, up to 6 items |
| | Announcements / News box updated by organisers | ✅ Admin → Announcements (pin, tone, link) |
| | Hackathon announcement on home | ✅ Title, tagline, tracks, team size, mode and prize pool, with *Register your team* and *Hackathon details* (`/hackathon`) buttons |
| | Loading screen (added on request) | ✅ Caches the main pages' scripts, styles, fonts and images (Cache Storage, served by a service worker) while Aura tries to take off and small Auras work on her ship inside a progress ring; once all is cached she lifts off and the smoke clears to the page. Shown on the first visit and after updates; caching without the screen for reduced motion; switchable in Site settings → Home |
| | Hero placard (added on request) | ✅ The hero Aura holds up a placard with a short announcement (“Registration opening soon”), edited in Site settings → Home → Hero announcements; the text wraps to fit the board, and with it cleared she waves hello instead |
| Themes | Three cards with icon, 2–3 line description, links to related talks, tutorials and hackathon track | ✅ Links open the programme and tutorials pre-filtered by theme, and the matching hackathon track |
| Programme | Tabs by day; each session shows time, title, type tag (Keynote / Talk / Panel / Tutorial / Demo / Hackathon / Break), theme tag, speaker(s), room | ✅ Plus "Other" type, search, *My agenda* (starred sessions), "now / up next" during the event |
| | Filter by theme / type | ✅ Filters are kept in the URL, so filtered views can be shared |
| | "Schedule to be announced" placeholder until finalised | ✅ Programme status *TBA / Draft / Final* |
| | Download PDF schedule | ✅ Generated from the programme automatically, or upload your own PDF |
| Speakers | Card grid: photo, name, designation, affiliation, label (Academia / Industry / Panelist) | ✅ Filter by label; keynote badge |
| | Pop-up with bio, talk title and abstract, profile links | ✅ Accessible dialog, ← → to browse, shareable link `/speakers?speaker=…`, lists the speaker's sessions |
| | "More speakers to be announced" placeholder | ✅ Can be switched off when the line-up is complete |
| Panel discussions | Title, theme, moderator, panelists (linked to speaker cards), time slot | ✅ On `/speakers#panels` and in the programme |
| Tutorials & Demos | Title, instructors, duration, level, prerequisites, material / GitHub links; demos with title, team/company, description, image/video | ✅ Videos load only when clicked (YouTube privacy-enhanced mode or Vimeo) |
| Industry Kiosks | Logo, name, description; "Exhibit with us" enquiry | ✅ The enquiry form goes to Admin → Enquiries (+ e-mail notification) |
| Venue & Travel | Embedded Google Map, directions from airport / railway / metro, campus entry, nearby accommodation | ✅ Plus local tips and an interactive route map on the home page |
| FAQ / Contact | Accordion FAQ; official e-mail, optional phone, LinkedIn / X; contact form | ✅ FAQ search and category filter |

## 4. Hackathon page

| Requirement | Status |
| --- | --- |
| Overview and problem tracks for the three themes | ✅ One track per theme with example problem statements |
| Eligibility, team size, mode (on-site / hybrid), rules and code of conduct | ✅ |
| Timeline graphic: registration → idea submission → shortlisting → final round (15–16 Dec) → results; dates TBA | ✅ Shows the current stage automatically from the dates |
| Prizes, judging criteria, mentors / judges (cards like speakers), resources | ✅ Same card component as speakers and organisers |
| Registration button: external platform (Unstop / Devfolio) or form | ✅ Built-in team form (up to 6 members) or an external link, switchable in the admin |
| Results / winners section enabled after the event | ✅ Hidden until *Post-event: show hackathon winners* is switched on |

## 5. Organisers page

| Requirement | Status |
| --- | --- |
| Card layout: photo, name, role, department / affiliation, profile link | ✅ |
| Faculty: Prof. Sandeep Kumar, Prof. Mausam, Prof. Parag Singla, Prof. Tanmoy Chakraborty, Prof. Souvik Chakraborty (IIT Delhi) | ✅ Pre-loaded; add photos and profile links in the admin |
| Students: Abhishek Gupta (PhD, ScAI), Aditya Shahne (PhD, EE), Ajit Kumar Singh (PhD, EE) | ✅ Pre-loaded |
| Volunteers: "Coming soon" placeholder; easy to add without a developer | ✅ Admin → Organisers & volunteers → group *Volunteer* |

## 6. Design

| Requirement | How |
| --- | --- |
| Clean, modern, tech-forward; IIT Delhi / ScAI branding; subtle network / node graphics | Light pastel palette with an adjustable brand colour, official logos (upload), animated node network in the hero, agent-loop diagram, Aura the guide robot in a different pose in each section |
| Responsive, mobile-friendly | Mobile-first layouts and a full-screen mobile menu; checked at phone, tablet and desktop widths |
| Accessibility | Semantic headings and landmarks, skip link, keyboard-operable menus, tabs and dialogs, visible focus, labelled fields with inline errors, alt text, reduced-motion support, light and dark modes |
| Performance (under 3 s, compressed images, no heavy animation on mobile) | Pre-rendered and cached pages, self-hosted fonts, WebP uploads, lazy map and video embeds; the node network and most Aura animations are switched off on phones and touch devices |
| Same card style for speakers, organisers, mentors, judges | Shared `PersonCard` component |

## 7. Functional and technical

| Requirement | How |
| --- | --- |
| Easy updates without coding (speakers, schedule, announcements, volunteers, sponsors) | Built-in admin panel (`/admin`) covering **all** content, with roles, a media library and an in-app help guide |
| Workshop and hackathon registration; deadlines shown clearly; confirmation e-mail | Built-in forms (or external links), deadline countdowns, automatic closing after the deadline, confirmation e-mails with registration ID and calendar invite (needs SMTP), CSV export |
| IIT Delhi sub-domain or path, with HTTPS | Supports a sub-domain or a sub-path (`NEXT_PUBLIC_BASE_PATH`); Nginx + HTTPS instructions in the README |
| Countdown, add to calendar, share buttons, SEO meta and Open Graph image, Google Analytics, favicon | ✅ All included; GA is enabled by entering an ID in the admin |
| Post-event: photo gallery, slides / recordings, hackathon winners (hidden until enabled) | `/gallery`, `/talks` and winners, each behind a switch in Admin → Site settings → Site-wide → Features & post-event |
| Handover: source code / admin access, short update guide, credentials | This repository; `docs/ADMIN_GUIDE.md` and `/admin/guide`; README handover checklist (credentials stay in the server environment) |
| Volunteers with chosen permissions; their changes reviewable | Admin → Volunteers: one permission per area, and per page for Site settings, enforced by the server; every change in the task tracker |
| Security | Validated, length-capped input on every form; signed JWT sessions checked against the database; bcrypt passwords; CSP and hardening headers. Review and 246 attack checks: `docs/SECURITY_REPORT.md` |

## 8. Content still to come from the organisers

Each pending item has a placeholder and an admin screen ready for it:

| Item | Where to add it |
| --- | --- |
| Official logo, tagline, colour palette (IITD / ScAI logos are built in; replace them only if needed) | Site settings → Site-wide → Colours, Logos & images, Event details |
| Speakers and panelists with photos, bios, talk titles | Speakers |
| Detailed schedule, venue hall names | Programme; Site settings → Site-wide → Event details (hall) |
| Tutorial, demo and kiosk details | Tutorials, Demos, Industry kiosks |
| Hackathon tracks, dates, prizes, platform | Hackathon; Site settings → Site-wide → Registration (platform link) |
| Registration links, fees, deadlines | Site settings → Site-wide → Registration; Registration → Fees |
| Organiser photos and profile links; volunteer list | Organisers & volunteers |
| Sponsors / partners and contact e-mail | Partners & sponsors; Site settings → Site-wide → Contact & social |

## How it was checked

Checked on a production build (`npm run build && npm start`) with MongoDB and the sample content loaded:

- **End-to-end flows** (43 automated checks, Playwright/Chromium): every hero button, countdown, theme toggle (persists), *Ask Aura* (Ctrl/⌘ + K), skip link, programme filters (kept in the URL), *My agenda*, per-session calendar file, day tabs, speaker pop-up (keyboard ← →, Escape, focus return, deep links), workshop and hackathon registration (validation, success ID, duplicate e-mail), contact and exhibitor enquiries, automatic closing after a deadline, admin edits appearing at once, post-event switches, PDF reflecting edits. All also pass when hosted under a sub-path (`NEXT_PUBLIC_BASE_PATH=/agentic-ai-workshop`).
- **Accessibility:** axe-core reports no WCAG 2.1 A/AA violations on any public page, in light and dark mode, at desktop and phone sizes. Lighthouse accessibility is 100 on the home, programme, speakers, hackathon and registration pages.
- **Performance** (Lighthouse, mobile, applied 4G throttling with 4× CPU slowdown): largest contentful paint 1.7–2.1 s on those pages. Performance score 91–97, except the home page at about 80: it holds the most interactive elements, which take longest to start up. Layout shift ≈ 0.
- **Responsive:** no horizontal scrolling at 320, 360, 390 and 768 px on any page; admin panel usable on phones.
- **E-mail:** sent to a local SMTP test server. Confirmation with registration ID and calendar invite, resend on duplicate registration, team confirmation (CC to all members), enquiry acknowledgement and organiser notices.
- **Deployment:** Docker image built and run against MongoDB (health check healthy, first sign-in creates the administrator, default content stored on first start); `docker compose` configuration validated.

**Still to do before launch:** this testing used Chromium only. Check the site on real Android and iOS phones and in Safari and Firefox, as the brief asks.
