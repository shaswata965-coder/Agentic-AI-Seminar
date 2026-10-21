# Agentic AI Workshop 2026 — website

Official website for the **Agentic AI Workshop 2026**, organised by the Indian Institute of Technology Delhi and the Yardi School of Artificial Intelligence (ScAI), IIT Delhi, **15–16 December 2026**.

It's a fast, accessible, mobile-first site with light and dark modes, a light pastel palette and **Aura**, an original rounded robot guide. Aura looks different in each section: a stethoscope for healthcare, a flask for science, a rocket for entrepreneurship, a clipboard for the programme, a laptop and headset for the hackathon, and so on. Organisers update all content from a built-in admin panel, with no code changes.

**Stack:** Next.js 16 (App Router, React 19, TypeScript) · Node.js · MongoDB (Mongoose) · Tailwind CSS 4.

| Document | For |
| --- | --- |
| This README | Developers and whoever hosts the site |
| [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) | Organisers updating content (also inside the admin at **/admin/guide**) |
| [`docs/REQUIREMENTS_CHECKLIST.md`](docs/REQUIREMENTS_CHECKLIST.md) | How each item of the website brief is met |

---

## What's included

**Public site**
- **Home (single scroll, sticky navigation):** a loading screen the first time the site is opened in a browser, and after each update (the main pages' scripts, styles, fonts and images are fetched and cached behind it while Aura's ship (shaped like her, her floating head the cockpit) tries to take off from a pad seen through a round window, small Auras in hard hats work on it and a ring around the window fills with the progress; then she lifts off, smoke fills the screen and clears to reveal the page, and the hero's Aura flies down into place); hero with title, tagline, dates, venue, Aura holding up two placards in turn (workshop registration and hackathon registration, each with its live status, with a switch under her), two large registration cards below (*Workshop registration* and *Hackathon team registration*, each with its status from Site settings → Site-wide → Registration and a big button; the one matching Aura's placard lights up, and pointing at one brings its placard up) and a live countdown to 15 December 2026 (the IIT Delhi emblem and the ScAI logo sit at the corners of the navigation bar); the highlights as a tear-off ticket (TBA values decode out of scrambled letters, numbers count up); an announcements box; the three theme cards; About (Aura in a circle of up to 8 topics from the About page; at rest she strikes a thinking pose with nothing above her head; hovering or tapping a topic makes her point at it and answer with its summary in a speech bubble above her head, which goes away again when you move off it; links to the About page); featured speakers; the hackathon (title, tagline, tracks, team size, mode and prize pool, with *Register your team* and *Hackathon details* buttons); venue and travel as an interactive route map (pick air, train, metro or road and a small Aura travels the route to IIT Delhi on a schematic map of Delhi, drawing it as she goes, while the metro lines that matter light up; links to the full travel guide); a looping strip of partner logos; FAQ and contact form. The navigation bar links Home, About, Programme and Speakers; everything else is under *Explore*.
- **Inner pages:** `/about` (why the workshop, what agentic AI is, the agent loop, who should attend, what happens, add to calendar and share), `/programme` (at a glance: each day's hours and session count, the session formats and the themes; then day tabs, filters by theme and type, search, *My agenda*, add sessions to a calendar, PDF download; then the industry kiosks with *Exhibit with us*, the hackathon with its schedule slots and key dates, and links to plan the visit), `/venue` (the venue on Google Maps, campus entry, directions by air, train, metro and road with Google Maps links, nearby accommodation and local tips), `/partners` (partners by tier, who you'll meet, ways to take part, sponsorship tiers, *Become a partner*, brochure), `/speakers` (filters, pop-up profiles with talk title and abstract, shareable links, panel discussions), `/tutorials` (tutorials and demos), `/hackathon` (at a glance: team size, who can join, dates, location, mode and prize pool, with eligibility; the prize money on a podium; the timeline; team registration at `#register`; then tracks, judging criteria, mentors, judges, resources, rules and code of conduct, winners; the old `/hackathon/register` redirects to the form), `/register` (workshop registration only), `/organisers` (faculty, students and volunteers) and `/meet-aura`.
- **Post-event pages**, hidden until switched on in the admin: `/gallery` (photos), `/talks` (slides and recordings) and hackathon winners.
- **Forms:** workshop registration, hackathon team registration (up to 6 members), and contact / *Exhibit with us* / sponsorship enquiries. They support deadlines and open/closed status, and send confirmation e-mails with a calendar invite.
- **Extras:** *Ask Aura* site search (Ctrl/⌘ + K), add-to-calendar (Google, Outlook, .ics), share buttons, SEO metadata, Open Graph images, JSON-LD event data, sitemap, robots.txt, web manifest, favicon, Google Analytics (optional).

**Admin panel (`/admin`)**
- Sign-in with administrator, editor and volunteer roles. Volunteers get a responsibility and only the permissions an administrator ticks, and everything they change goes to a **task tracker** where administrators see who changed what (before and after) and mark it reviewed.
- **Site settings with a tab per page:** every section's texts, colours and background, the order of each page's sections (drag or arrows; the hero stays at the top), and the site's accent colours, with the real page as a live preview beside the form (Next.js Draft Mode, visible only to the editor until saved) and warnings when text is too long or short for the layout, both from recommended lengths and from measuring the previewed page.
- Edit everything: event details and dates, registration status and deadlines, announcements, speakers, programme, panels, tutorials, demos, kiosks, sponsors and tiers, organisers, volunteers, mentors and judges, FAQs, venue and travel, contact and social links, branding (logos, brand colour), SEO and Analytics, and the post-event switches.
- Media library: uploads are resized and compressed automatically and stored in MongoDB.
- Registrations and enquiries: search, status, notes and CSV export for Excel.
- Changes appear on the website immediately.

---

## Quick start (development)

Requirements: **Node.js 20.9+** (22 LTS recommended) and **MongoDB 6+**, either local or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
npm install
cp .env.example .env.local      # set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD (AUTH_SECRET optional in dev)
npm run seed                    # stores the default event content (also happens automatically on first start)
npm run dev                     # http://localhost:3000
```

Sign in at <http://localhost:3000/admin> with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. On an empty database the first sign-in creates the administrator. You can also create users from the command line:

```bash
npm run create-admin -- --email you@iitd.ac.in --name "Your Name"            # asks for a password
npm run create-admin -- --email editor@iitd.ac.in --role editor
```

The same command resets the password of an existing user.

### Sample content for previews

The brief's real speakers, schedule and partners are not announced yet, so the site starts with friendly "to be announced" placeholders. To preview a fully populated site, load sample content. Every sample item is labelled as a sample (names like *Dr. Meera Placeholder*, *Example University*):

```bash
npm run seed:demo                 # adds 8 speakers, a 2-day programme, tutorials, demos, kiosks, partners, mentors, judges, volunteers, announcements
npm run seed:demo -- --remove     # removes exactly those items (your own content is kept)
```

While samples are loaded, the admin dashboard shows a warning. **Remove them before launch.**

> Scripts write straight to the database, so the running site can take up to 5 minutes to show their changes. To show them at once, press **Refresh website** on the admin dashboard (or restart the site). Changes made in the admin panel show up immediately.

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` · `npm run check` | ESLint · TypeScript · both |
| `npm run seed` | Add default content where missing (never overwrites) |
| `npm run seed:demo [-- --remove \| --reset]` | Add / remove sample content |
| `npm run create-admin -- --email …` | Create a user or reset a password |

---

## Configuration

All settings are environment variables; [`.env.example`](.env.example) documents each one. `NEXT_PUBLIC_*` values are compiled in at build time, so **rebuild after changing them**.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/aaiw` or an Atlas `mongodb+srv://…` URI |
| `MONGODB_DB` | | Database name, if not in the URI |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Public origin, e.g. `https://agenticai.iitd.ac.in`. Used in e-mails, calendar files, the sitemap and social previews |
| `NEXT_PUBLIC_BASE_PATH` | | Serve under a path, e.g. `/agentic-ai-workshop` for `https://scai.iitd.ac.in/agentic-ai-workshop` |
| `AUTH_SECRET` | yes (prod) | 32+ random characters for signing admin sessions (`openssl rand -base64 48`). Without it the admin panel refuses sign-ins in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | | First administrator, created on the first sign-in to an empty database (password: 10+ characters) |
| `COOKIE_SECURE` | | `false` only to test a production build over plain HTTP. Not needed on localhost |
| `CLIENT_IP_HEADER` | | Header holding the visitor's IP address, if your proxy sets one it overwrites (e.g. `x-real-ip`, `cf-connecting-ip`). By default the last `X-Forwarded-For` entry is used. Used for rate limits |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | | Outgoing mail for confirmations and organiser notifications. Without them, forms still work but no e-mail is sent |
| `MAIL_FROM` | | Sender, e.g. `"Agentic AI Workshop 2026 <no-reply@iitd.ac.in>"` |
| `NOTIFY_EMAIL` | | Where organiser notifications go: new hackathon teams and enquiries (overridable in Admin → Site settings → Site-wide → Contact & social) |
| `NEXT_PUBLIC_GA_ID` | | Google Analytics 4 ID `G-…` (or set it in Admin → Site settings → Site-wide → SEO & analytics) |
| `MAX_UPLOAD_MB` | | Max size per upload (default 8) |

**How content is stored:** everything editable lives in MongoDB, including uploaded images and PDFs (GridFS bucket `media`). Backing up the database backs up the whole site. If the database is unreachable, the public site still renders with the built-in default content from the brief, and forms show a friendly error.

---

## Deployment

The site needs a Node.js server; it is not a static export. Use either of the two options below. Serve it over **HTTPS** at an IIT Delhi subdomain (e.g. `agenticai.iitd.ac.in`) or a path (e.g. `scai.iitd.ac.in/agentic-ai-workshop`, with `NEXT_PUBLIC_BASE_PATH=/agentic-ai-workshop`).

### Option A — Docker Compose (website + MongoDB)

```bash
cp .env.example .env    # set NEXT_PUBLIC_SITE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, SMTP_* (MONGODB_URI is set by compose)
docker compose up -d --build
docker compose run --rm tools seed                                   # optional: default content (also automatic)
docker compose run --rm tools create-admin -- --email you@iitd.ac.in --password 'a-long-password'
```

The site listens on port 3000 of this machine only (`PORT` in `.env` changes the port), for the reverse proxy below; set `BIND=0.0.0.0` to publish it on every interface. MongoDB data persists in the `mongo-data` volume. To update, run `git pull && docker compose up -d --build`.

The image is built without database access, so its pages start with the default content and switch to what is in MongoDB within about a minute of starting. Press **Refresh website** on the admin dashboard to switch them at once.

### Option B — Node.js + PM2 on a server

```bash
git clone <repo> agentic-ai-workshop && cd agentic-ai-workshop
npm ci
cp .env.example .env.local        # production values; NODE_ENV is set by `npm start`
npm run build
npm install -g pm2
pm2 start npm --name aaiw -- start -- -H 127.0.0.1   # port 3000, for the reverse proxy only; add `-p 4000` for another port
pm2 save && pm2 startup                     # restart on reboot
```

To update: `git pull && npm ci && npm run build && pm2 restart aaiw`.

### Reverse proxy with HTTPS (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name agenticai.iitd.ac.in;
    ssl_certificate     /etc/ssl/iitd/fullchain.pem;   # institute certificate or Let's Encrypt (certbot --nginx)
    ssl_certificate_key /etc/ssl/iitd/privkey.pem;
    client_max_body_size 10m;                          # uploads (MAX_UPLOAD_MB)

    location / {                                       # for a sub-path use: location /agentic-ai-workshop/ { … }
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr; # overwrite (not append) so clients can't spoof their IP
    }
}
server { listen 80; server_name agenticai.iitd.ac.in; return 301 https://$host$request_uri; }
```

`Host` must be passed through: the admin API rejects cross-site requests by comparing the browser's `Origin` with it. For a sub-path, build with `NEXT_PUBLIC_BASE_PATH` set to the same path and proxy that location without stripping the prefix.

### After deploying

1. Open `/api/health`. It should return `{"status":"ok","db":"connected"}`.
2. Sign in at `/admin`, change the password (My account), and add the other organisers under **Users**.
3. In **Site settings**, set the contact e-mail and phone, check the registration status and deadlines, and add the Google Analytics ID.
4. Confirm `NEXT_PUBLIC_SITE_URL` is right. Social previews and e-mail links use it.
5. Send a test registration to check that e-mail works.

### Backups

```bash
mongodump --uri "$MONGODB_URI" --archive=aaiw-$(date +%F).gz --gzip     # includes uploaded files
mongorestore --uri "$MONGODB_URI" --archive=aaiw-2026-12-01.gz --gzip
```

With Docker, run the same commands inside the `mongo` container, e.g. `docker compose exec mongo mongodump --archive --gzip > backup.gz`.

---

## Project structure

```
src/
  app/
    (site)/            public pages (home, about, programme, speakers, tutorials, hackathon, venue, partners, register, organisers, gallery, talks, meet-aura)
    admin/             admin panel (login, dashboard, content editors, settings, registrations, media, users, volunteers, task tracker, guide)
    api/               public APIs (register, hackathon/register, enquiries, calendar, programme/pdf, media, health) and /api/admin/*
    opengraph-image.tsx, sitemap.ts, robots.ts, manifest.ts, icon.svg …
  components/
    aura/              Aura mascot: SVG art, 33 presets, eye-tracking, reactions, fly-in entrances, assistant, playground
    loading/           the home page's loading screen (Aura's ship, the crew, the progress ring, the smoke), the asset caching behind it, and the service worker registration
    home/ programme/ partners/ speakers/ tutorials/ hackathon/ gallery/ forms/ share/ layout/ ui/ effects/ admin/
  lib/
    schema/            field definitions for every content type (drive the admin forms, validation and database schemas)
    content/           defaults from the brief, cached queries, bootstrap
    server/            auth, e-mail, PDF, CSV, validation, admin CRUD (server-only)
  proxy.ts             protects /admin pages
scripts/               seed, seed:demo, create-admin
assets/fonts/          fonts for the social preview images (SIL Open Font License); site fonts are in src/app/fonts
docs/                  admin guide and requirements checklist
```

**Section order:** the sections of a page that admins may move are listed, in their default order, in `src/lib/schema/section-order.ts` (by their Site settings section keys). Each such page gets a *Section order* tab in Site settings (an `order` field, `<page>Order`, so volunteers can move only their own pages' sections), and the page renders those sections through `<InOrder s={s} page="…" sections={{ key: <Section …/>, … }}>` (`components/layout/InOrder.tsx`), with its hero outside it, first. A saved order is made whole as it's read: unknown keys are dropped and sections added since are put back after the one they follow by default. To make a new section movable, add its key to the page's list and to the page's `sections`.

**Adding a field to a content type** (for example a "pronouns" field for speakers): add it to the collection's `fields` in `src/lib/schema/resources.ts` and to its type in `src/lib/content/types.ts`, then render it. The admin form, validation and database schema follow automatically.

**Caching:** public pages are rendered once and cached (`'use cache'` with tags). Saving in the admin expires the matching tags, so the next visitor gets fresh content. Time-based refresh (5 minutes) is only a safety net for direct database edits.

**Placard:** `<Aura placard="…">` has Aura hold a large sign with those words in front of her in both fins (the `holdWide` pose); `AuraArt` breaks the text into up to three lines at the largest size that fits the board, from the display font's measured letter widths. When the words change the board flips down to show the new ones (`placardFlip`). The home hero's Aura holds up two in turn, workshop and hackathon registration (`components/home/HeroPlacards.tsx`), from Site settings → Home → Hero announcements: a bar filling under the switch times each one (CSS, so it pauses with the page's animations, while the pointer or focus is on her or a registration card, and never runs with reduced motion); the hero section is marked `data-placard` so the matching card in `RegisterChooser.tsx` lights up, and pointing at a card (`data-placard-key`) brings its placard up.

**Motion:** Aura flies into place (Auras smaller than 56 px just appear). Page heroes use `entrance="load"` (pure CSS, on page load); other Auras fly in from the nearest edge when scrolled into view (`components/aura/entrance.ts`). A flight takes 2 s (1.6 s on phones; `zip` 1.1 s, `drift` 2.2 s), set by `--fly-dur` in `components/aura/aura.css`. Pass `entrance="zip" | "drift" | "none"` to change that. Micro-interactions live in `src/app/micro.css` with one delegated script (`components/effects/MicroInteractions.tsx`). Opt an element in with `data-ripple` (ink ripple on press), `data-glow` (cursor-following light on cards), `data-burst` (star spin and ring when pressed), or the `mi-link`, `mi-underline` and `mi-stagger` classes. Segmented controls use `useSlidingPill` (`components/ui/SlidingPill.tsx`). With *reduced motion* turned on, Auras simply appear in place; with JavaScript off, nothing is left hidden. **Loading screen and caching** (`components/loading/`): an inline script in the root layout's `<head>` (`flag.ts`) names the build from the home page's content-hashed script and stylesheet URLs and, if this browser hasn't cached that build's files yet, marks `<html data-launch="run">` before anything is drawn, so the screen covers the page from the first paint and the hero Aura's fly-in waits for it (`"quiet"` instead, with no screen, for `#section` links and reduced motion). The screen draws from the first bytes of HTML: CSS is inlined into the page (`experimental.inlineCss`), so there are no stylesheet requests to wait for, and the fonts aren't preloaded (Chrome holds the first paint for preloaded fonts). The head script moves the ring while the page's own scripts and images load; then `warm.ts` waits for the fonts, prefetches the main pages through the router (their data and scripts), and saves the images they show (listed by the home page from the content) and the build files loaded so far in the `aaiw-assets-v1` Cache Storage cache, from a worker, reporting real progress to the ring. When all is cached (or after 10 s, with caching going on behind), Aura lifts off, and the build is remembered in localStorage, so the screen is skipped until the next update. `public/sw.js`, registered on every public page in production, serves build files and uploads from that cache (cache first; other images are refreshed in the background) and leaves pages, the admin and the API alone. Every moving part of the screen is its own element animated only with `transform` and `opacity`, which the browser's compositor runs off the main thread, so it stays smooth while the page loads; behind it the page is hidden and its animations paused (the hero's network canvas rests too). If the screen's script never runs, it hides itself after 16 s. To see it again, open the site in a private window or clear its site data.

**Hero network:** the animated agent network fills the hero but keeps clear of text: mark an element `data-graph-avoid="text"` to clear just its lines of text, or `data-graph-avoid=""` to clear its whole box (`components/effects/NetworkCanvas.tsx`).

**Buttons and links to other pages:** nothing is pill-shaped. Buttons are keycaps (`.key` in `src/app/micro.css`, used by `Button`/`ButtonLink` in `components/ui/Button.tsx`): rounded rectangles on a solid edge that rise on hover and press down while held; filter toggles that are on stay pressed in. A link from a section to another page is a `Portal` (`components/ui/Portal.tsx`) instead: a card with a small preview of the destination (`components/portals/PortalArt.tsx`: speakers' faces, the agent loop, a crop of the route map, a two-day timetable, the hackathon trophy, FAQ bubbles) and an agent trace that signals the arrow on hover. **Section header labels** (`Eyebrow` in `components/ui/Section.tsx`, used by `SectionHeading` and `PageHero`) are one style everywhere, with no box: larger letter-spaced text in the section's colour, led by a mini Aura in the section's colour that floats, blinks, glances at the label and now and then waves (`components/aura/MiniAura.tsx`); centred headings get one on each side, facing the label (`.eyebrow` in `src/app/tags.css`). **Text tags:** badges and small labels are never pill-shaped. Each section picks a tag style (`bracket`, `underline`, `ribbon`, `slash`, `tab`, `stamp`, `corner` or `label`) with `<Section tags="…">`, `data-tags="…"` or, for a whole page, `<TagScope style="…">`; every `.tag` inside follows (`src/app/tags.css`, `components/ui/Tag.tsx`).

**No em dashes:** the site's own text avoids them, and stored content is shown with any em dash replaced (`stripEmDashes` in `src/lib/content/normalize.ts`), without changing the database.

---

## Accessibility, performance and security

- Semantic HTML, a skip link, visible focus styles, labelled form fields with inline errors, keyboard-friendly dialogs and tabs, and colour contrast checked in both themes. Animations respect *reduced motion* and are lighter on small screens.
- Pages are pre-rendered and cached, fonts are self-hosted, images are compressed WebP, heavy widgets (map, videos) load only when clicked or scrolled into view, and there are no large client libraries.
- Admin sessions are signed JWTs (HS256, `AUTH_SECRET`) in HTTP-only, SameSite cookies, each tied to a session stored in the database: signing out, a password change or a disabled account ends them at once. Passwords are stored only as bcrypt hashes (cost 12). Sign-in is rate-limited by failed attempts (without letting anyone lock an account), takes the same time whether or not an account exists, and state-changing requests must come from the site's own pages. Every field of every form is type- and length-checked on the server and cleaned of control characters; links must be http(s), mailto, tel or a path on the site. Pages send a Content-Security-Policy, HSTS and the usual hardening headers; uploaded SVGs are checked for scripts, downloaded rather than shown when opened directly, and sandboxed; CSV exports are protected against formula injection. Details and test results: [docs/SECURITY_REPORT.md](docs/SECURITY_REPORT.md).

## Handover checklist

- [ ] Source code: this repository.
- [ ] Hosting: server or Docker host, domain or sub-path, HTTPS certificate.
- [ ] Secrets in the server environment, not in git: `MONGODB_URI`, `AUTH_SECRET`, SMTP credentials.
- [ ] Admin accounts for each organiser (Admin → Users) and volunteer (Admin → Volunteers); first administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD` or `npm run create-admin`.
- [ ] Update guide for organisers: [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) (also at `/admin/guide`).
- [ ] Sample content removed (`npm run seed:demo -- --remove`); official logos uploaded; contact details filled in.
- [ ] Database backups scheduled.

## Credits and licences

Aura is an original character drawn in SVG for this site. Fonts: Inter and Outfit, bundled in `src/app/fonts` so builds need no internet access (SIL Open Font License; see `src/app/fonts/LICENSE.md`). Icons: Lucide (ISC). The IIT Delhi and ScAI logos are in `public/logos` (white on transparent, darkened automatically in light mode); Admin → Site settings → Branding can replace them.
