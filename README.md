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
- **Home (single scroll, sticky navigation):** hero with title, tagline, dates, venue, the workshop registration status (from Site settings → Registration) and a live countdown to 15 December 2026 (the IIT Delhi emblem and the ScAI logo sit at the corners of the navigation bar); the highlights as a tear-off ticket (TBA values decode out of scrambled letters, numbers count up); an announcements box; the three theme cards; About (Aura in a circle of up to 8 topics from the About page; hovering or tapping one makes her point at it and answer with its summary in a speech bubble above her head, and she walks through them when idle; links to the About page); featured speakers; venue and travel with an embedded Google Map; a looping strip of partner logos; FAQ and contact form. The navigation bar links Home, About, Programme and Speakers; everything else is under *Explore*.
- **Inner pages:** `/about` (why the workshop, what agentic AI is, the agent loop, who should attend, what happens, add to calendar and share), `/programme` (at a glance: each day's hours and session count, the session formats and the themes; then day tabs, filters by theme and type, search, *My agenda*, add sessions to a calendar, PDF download; then the industry kiosks with *Exhibit with us*, the hackathon with its schedule slots and key dates, and links to plan the visit), `/partners` (partners by tier, who you'll meet, ways to take part, sponsorship tiers, *Become a partner*, brochure), `/speakers` (filters, pop-up profiles with talk title and abstract, shareable links, panel discussions), `/tutorials` (tutorials and demos), `/hackathon` (tracks, eligibility, team size, mode, rules and code of conduct, timeline, prizes, judging criteria, mentors, judges, resources, winners), `/hackathon/register`, `/register`, `/organisers` (faculty, students and volunteers) and `/meet-aura`.
- **Post-event pages**, hidden until switched on in the admin: `/gallery` (photos), `/talks` (slides and recordings) and hackathon winners.
- **Forms:** workshop registration, hackathon team registration (up to 6 members), and contact / *Exhibit with us* / sponsorship enquiries. They support deadlines and open/closed status, and send confirmation e-mails with a calendar invite.
- **Extras:** *Ask Aura* site search (Ctrl/⌘ + K), add-to-calendar (Google, Outlook, .ics), share buttons, SEO metadata, Open Graph images, JSON-LD event data, sitemap, robots.txt, web manifest, favicon, Google Analytics (optional).

**Admin panel (`/admin`)**
- Sign-in with administrator and editor roles.
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
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | | Outgoing mail for confirmations and organiser notifications. Without them, forms still work but no e-mail is sent |
| `MAIL_FROM` | | Sender, e.g. `"Agentic AI Workshop 2026 <no-reply@iitd.ac.in>"` |
| `NOTIFY_EMAIL` | | Where organiser notifications go: new hackathon teams and enquiries (overridable in Admin → Site settings → Contact) |
| `NEXT_PUBLIC_GA_ID` | | Google Analytics 4 ID `G-…` (or set it in Admin → Site settings → SEO) |
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

The site listens on port 3000 (`PORT` in `.env` changes it). MongoDB data persists in the `mongo-data` volume. To update, run `git pull && docker compose up -d --build`.

The image is built without database access, so its pages start with the default content and switch to what is in MongoDB within about a minute of starting. Press **Refresh website** on the admin dashboard to switch them at once.

### Option B — Node.js + PM2 on a server

```bash
git clone <repo> agentic-ai-workshop && cd agentic-ai-workshop
npm ci
cp .env.example .env.local        # production values; NODE_ENV is set by `npm start`
npm run build
npm install -g pm2
pm2 start npm --name aaiw -- start          # port 3000; use `-- start -- -p 4000` for another port
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
    (site)/            public pages (home, about, programme, speakers, tutorials, hackathon, partners, register, organisers, gallery, talks, meet-aura)
    admin/             admin panel (login, dashboard, content editors, settings, registrations, media, users, guide)
    api/               public APIs (register, hackathon/register, enquiries, calendar, programme/pdf, media, health) and /api/admin/*
    opengraph-image.tsx, sitemap.ts, robots.ts, manifest.ts, icon.svg …
  components/
    aura/              Aura mascot: SVG art, 33 presets, eye-tracking, reactions, fly-in entrances, assistant, playground
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

**Adding a field to a content type** (for example a "pronouns" field for speakers): add it to the collection's `fields` in `src/lib/schema/resources.ts` and to its type in `src/lib/content/types.ts`, then render it. The admin form, validation and database schema follow automatically.

**Caching:** public pages are rendered once and cached (`'use cache'` with tags). Saving in the admin expires the matching tags, so the next visitor gets fresh content. Time-based refresh (5 minutes) is only a safety net for direct database edits.

**Motion:** Aura flies into place (Auras smaller than 56 px just appear). Page heroes use `entrance="load"` (pure CSS, on page load); other Auras fly in from the nearest edge when scrolled into view (`components/aura/entrance.ts`). Pass `entrance="zip" | "drift" | "none"` to change that. Micro-interactions live in `src/app/micro.css` with one delegated script (`components/effects/MicroInteractions.tsx`). Opt an element in with `data-ripple` (ink ripple on press), `data-glow` (cursor-following light on cards), `data-burst` (star spin and ring when pressed), or the `mi-link`, `mi-underline` and `mi-stagger` classes. Segmented controls use `useSlidingPill` (`components/ui/SlidingPill.tsx`). With *reduced motion* turned on, Auras simply appear in place; with JavaScript off, nothing is left hidden.

**Hero network:** the animated agent network fills the hero but keeps clear of text: mark an element `data-graph-avoid="text"` to clear just its lines of text, or `data-graph-avoid=""` to clear its whole box (`components/effects/NetworkCanvas.tsx`).

**Text tags:** eyebrows, badges and small labels are never pill-shaped. Each section picks a tag style (`bracket`, `underline`, `ribbon`, `slash`, `tab`, `stamp`, `corner` or `label`) with `<Section tags="…">`, `data-tags="…"` or, for a whole page, `<TagScope style="…">`; every `.tag` inside follows (`src/app/tags.css`, `components/ui/Tag.tsx`).

**No em dashes:** the site's own text avoids them, and stored content is shown with any em dash replaced (`stripEmDashes` in `src/lib/content/normalize.ts`), without changing the database.

---

## Accessibility, performance and security

- Semantic HTML, a skip link, visible focus styles, labelled form fields with inline errors, keyboard-friendly dialogs and tabs, and colour contrast checked in both themes. Animations respect *reduced motion* and are lighter on small screens.
- Pages are pre-rendered and cached, fonts are self-hosted, images are compressed WebP, heavy widgets (map, videos) load only when clicked or scrolled into view, and there are no large client libraries.
- Admin sessions use signed HTTP-only cookies. Passwords are hashed with bcrypt. Sign-in and form submissions are rate-limited, and state-changing requests must come from the same site. All input is validated on the server. Uploaded SVGs are served with a sandboxing content security policy, and CSV exports are protected against spreadsheet formula injection.

## Handover checklist

- [ ] Source code: this repository.
- [ ] Hosting: server or Docker host, domain or sub-path, HTTPS certificate.
- [ ] Secrets in the server environment, not in git: `MONGODB_URI`, `AUTH_SECRET`, SMTP credentials.
- [ ] Admin accounts for each organiser (Admin → Users); first administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD` or `npm run create-admin`.
- [ ] Update guide for organisers: [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) (also at `/admin/guide`).
- [ ] Sample content removed (`npm run seed:demo -- --remove`); official logos uploaded; contact details filled in.
- [ ] Database backups scheduled.

## Credits and licences

Aura is an original character drawn in SVG for this site. Fonts: Inter and Outfit, bundled in `src/app/fonts` so builds need no internet access (SIL Open Font License; see `src/app/fonts/LICENSE.md`). Icons: Lucide (ISC). The IIT Delhi and ScAI logos are in `public/logos` (white on transparent, darkened automatically in light mode); Admin → Site settings → Branding can replace them.
