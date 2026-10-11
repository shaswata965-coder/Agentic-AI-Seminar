# Updating the website — guide for organisers

This guide is for the organising team of the **Agentic AI Workshop 2026**. It explains how to keep the website up to date. No coding is needed. The same guide is inside the admin panel under **Help guide**.

- **Admin panel:** `https://<your-site>/admin`. There is also an *Organiser login* link in the website footer.
- **Who can sign in:** anyone the administrator adds under **Users**.
- **Need help?** Contact the person who hosts the website, listed at the end of this guide.

---

## 1. The basics

- **Changes go live immediately.** When you press **Save**, the website updates within a few seconds. There is no separate "publish" step.
- **Hide instead of delete.** Every item has a **Published** switch (the eye icon in lists). Turn it off to hide an item without losing it.
- **Order.** Use the ↑ ↓ arrows in a list to change the order in which items appear on the website.
- **Formatting.** Text boxes with a *Preview* button support simple formatting:
  - `**bold**` → **bold**
  - `*italic*` → *italic*
  - `[link text](https://example.com)` → a link
  - lines starting with `- ` → a bullet list
- **Images.** Click **Upload** next to any image field, choose **Library** to reuse an uploaded file, or paste a link. Photos are resized and compressed automatically. Square photos of at least 400 × 400 px look best for people.
- **Unsaved changes.** In **Site settings** and **Hackathon**, a bar at the bottom shows when you have unsaved changes. Press **Save changes**.
- **"To be announced".** Wherever something isn't ready (speakers, schedule, venue hall, prizes), the website automatically shows a friendly placeholder.
- **Refresh website** (on the dashboard). Only needed if the site shows old content after the website host deploys an update or changes the database directly. Normal saves don't need it.

## 2. Signing in and your account

1. Go to `/admin` and sign in with your e-mail and password.
2. Change your password under **My account**. Use at least 10 characters.
3. Forgotten your password? Ask an administrator to reset it under **Users**.

**Roles:** *Editors* can change all content. *Administrators* can also add or remove users and delete registrations.

## 3. Event details, dates and registration

**Site settings → Event details**
- Event name, short name, tagline, short description (used by search engines and social media), organised by. The event name appears everywhere the event is named: the logo, the home page title, page titles, e-mails, calendar invites and the programme PDF. A few texts mention the name in their own words (*Workshop motivation* under *About & themes*, and *Sponsorship introduction* under *Partners & kiosks*); update those by hand when the name changes.
- **Starts / Ends** (Indian Standard Time). The countdown on the home page counts down to the start time.
- Venue, hall/building (leave blank to show "to be announced") and full address.

**Site settings → Registration**
- **Workshop registration:** *Opening soon*, *Open* or *Closed*, plus the deadline. The deadline appears on the website, and the form closes automatically once it passes. The home page shows the same status under the title (*Open until …*, *Opening soon* or *Closed*). Afterwards, also set the status to *Closed*.
- **External form (optional):** paste a Google Form / Unstop / Devfolio link to send people there instead of the built-in form.
- **Fees:** add one row per category (e.g. Students, Academia, Industry), plus an optional note.
- **Confirmation e-mail text:** extra lines added to the confirmation e-mail, for example what to bring.
- **Hackathon registration:** status, deadline, and optionally the external platform link and its name.

**Site settings → Home page:** the highlight strip (e.g. *Speakers — TBA*, *Prize pool — TBA*; up to 6), whether the countdown is shown, and how many featured speakers appear on the home page.

**Site settings → About & themes:** workshop motivation, "What is agentic AI?", who should attend, activities, and the three theme cards (title and a 2–3 line description).

## 4. Announcements

**Announcements → New announcement**
- Title, short text, date, style (*Info*, *Important*, *Success*).
- Optional link and link label (e.g. to the registration page or a PDF).
- **Pin** important news to keep it at the top.

The newest announcements appear in the box on the home page.

## 5. Speakers and the programme

**Speakers → New speaker**
- Name, designation, affiliation, **label** (*Academia*, *Industry* or *Panelist*), theme, photo.
- Bio, talk title and talk abstract. These appear in the pop-up when a visitor clicks the speaker card.
- Profile links (website, LinkedIn, X, Google Scholar, GitHub).
- **Keynote speaker** adds a keynote badge. **Feature on the home page** adds the speaker to the home page grid.
- The "More speakers to be announced" card can be switched off in **Site settings → Features** once the line-up is complete.

**Programme → New session**
- Day, start and end time, title, **type** (*Keynote*, *Talk*, *Panel*, *Tutorial*, *Demo*, *Hackathon*, *Break* or *Other*), theme, room/hall.
- **Speakers / instructors:** pick from your speakers. Add the speakers first. If a speaker isn't confirmed yet, use *Speaker text* (e.g. "Speaker to be announced").
- **Panels:** choose the *Moderator* and *Panelists*. The panel then also appears under *Panel discussions* on the Speakers page, linked to each speaker's card.

**Site settings → Programme → Programme status**
- *To be announced:* the website shows "Schedule to be announced" (the default).
- *Draft:* sessions are shown with a "subject to change" note.
- *Final:* sessions are shown without the note.

The **PDF schedule** is generated automatically from the programme. To use your own PDF instead, upload it under *Schedule PDF*.

## 6. Tutorials, demos, kiosks and partners

- **Tutorials:** title, instructors (name, affiliation, link), level, duration, schedule text, prerequisites (one per line, e.g. "Laptop with Python 3.11"), materials and GitHub links, capacity.
- **Demos:** title, team or company, short description, an image and/or a YouTube/Vimeo link.
- **Industry kiosks:** company, booth, logo, short description of what they show, website. Companies can apply through the **Exhibit with us** button; applications arrive under **Enquiries**.
- **Partners & sponsors:** name, tier (*Title*, *Platinum*, *Gold* …), logo, website, short text. Edit the sponsorship tiers, introduction and brochure in **Site settings → Partners & kiosks**.

## 7. Organisers, volunteers, mentors and judges

**Organisers & volunteers → New person.** Choose the **group**:

| Group | Shown on |
| --- | --- |
| Faculty organiser | Organisers page |
| Student organiser | Organisers page |
| Volunteer | Organisers page (a "Coming soon" card shows until the first volunteer is added) |
| Mentor | Hackathon page |
| Judge | Hackathon page |

Fill in name, role (e.g. "PhD scholar"), department, affiliation, profile link and photo. Everyone uses the same card style.

## 8. Hackathon

**Hackathon** (left menu) has tabs:
- **Overview:** title, tagline, description, mode (on-site / hybrid), team size, prize pool, eligibility.
- **Problem tracks:** one per theme (Healthcare, Scientific Discovery, Entrepreneurship), each with example problems.
- **Rules & conduct:** rules and code of conduct.
- **Timeline:** registration → idea submission → shortlisting → final round (15–16 Dec) → results. Add dates as they are confirmed; the timeline highlights the current stage automatically.
- **Prizes & judging:** prizes and judging criteria (with weights if you like).
- **Resources:** APIs, datasets, compute credits and other links for participants.
- **Results:** winners. They stay hidden until you switch on **Post-event: show hackathon winners** in **Site settings → Features & post-event**.

Mentors and judges are added under **Organisers & volunteers** (section 7).

## 9. Venue and travel

**Site settings → Venue & travel**
- **Map location:** the text the embedded Google Map searches for (e.g. "Lecture Hall Complex, IIT Delhi"). For an exact pin, paste the link from Google Maps → *Share* → *Embed a map* → copy the `src` value.
- **Directions:** by air, train, metro and road.
- **Campus entry information**, e.g. ID requirements and which gate to use.
- **Nearby accommodation:** guest houses, hotels or areas, with distance and links.
- **Local tips.**

## 10. Contact, social links, branding and SEO

- **Contact & social:** official e-mail, phone (optional), LinkedIn, X, Instagram, YouTube, and the address that is e-mailed about new hackathon teams and enquiries (workshop registrations are listed under **Registrations**).
- **Branding:** the **IIT Delhi** emblem (left corner of the navigation bar) and the **ScAI** logo (right corner) are built in; upload a file only to replace one (PNG or SVG with a transparent background is best). Also: an event logo, and the **brand colour** (e.g. `#3b5bdb`). The colour updates buttons and highlights across the site. You can also upload a custom social-media preview image (1200 × 630 px).
- **SEO & analytics:** the Google Analytics ID (`G-…`) and search keywords.
- **Features & post-event:** a site-wide banner (e.g. "Registration closes on 30 November"), the *Ask Aura* helper, the *More speakers* card, and the post-event switches.

## 11. FAQs

**FAQs → New question:** question, answer (formatting allowed) and category (*General*, *Registration*, *Programme*, *Hackathon*, *Travel*, *Sponsorship*). Visitors can search and filter them.

## 12. Registrations and enquiries

**Registrations**
- *Workshop* and *Hackathon teams* tabs. Search by name, e-mail, organisation or ID, and filter by status.
- Change the status and add private notes. Workshop: *registered*, *confirmed*, *waitlisted*, *cancelled*. Hackathon teams: *registered*, *shortlisted*, *not shortlisted*, *withdrawn*.
- **Download CSV** opens in Excel (times are in IST).
- Each person receives a registration ID (e.g. `AAIW26-7KQ2M`) and a confirmation e-mail with a calendar invite, if e-mail is set up on the server.

**Enquiries:** contact-form messages, *Exhibit with us* requests and sponsorship enquiries. Use **Reply** to answer by e-mail, update the status, or download a CSV.

> If the dashboard says *E-mail is not configured*, forms still work and everything is saved. Ask the website host to add the SMTP settings so confirmation e-mails are sent.

## 13. After the event

1. **Photo gallery:** upload photos with captions and choose the day.
2. **Slides & recordings:** add each talk with the slides (PDF upload) and/or a YouTube link.
3. **Hackathon → Results:** add the winners.
4. In **Site settings → Features & post-event**, switch on the gallery, the slides & recordings and the winners. They appear in the menu automatically.

## 14. Users (administrators only)

**Users → Add user:** name, e-mail, role (*Editor* or *Administrator*) and a starting password. Share the password safely and ask them to change it under *My account*. You can reset passwords, change roles, or **Disable** someone who no longer needs access (they can be enabled again later).

---

### Good practice

- Keep at least two administrators.
- Before launch, check the dashboard for the **sample content** warning. Remove any sample items.
- Use real photos with permission, and write alt text (image descriptions) where asked.
- Pin only one or two announcements at a time.

### Contacts

| Topic | Who |
| --- | --- |
| Website content | Organising team (add names here) |
| Hosting, domain, e-mail (SMTP), backups | Website host / IIT Delhi IT services (add contact here) |
