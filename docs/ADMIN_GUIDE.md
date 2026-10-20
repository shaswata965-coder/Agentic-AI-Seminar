# Updating the website — guide for organisers

This guide is for the organising team of the **Agentic AI Workshop 2026**. It explains how to keep the website up to date. No coding is needed. The same guide is inside the admin panel under **Help guide**.

- **Admin panel:** `https://<your-site>/admin`. There is also an *Organiser login* link in the website footer.
- **Who can sign in:** anyone an administrator adds under **Users** or **Volunteers**.
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
- **Every text and colour of the site** is in **Site settings**, page by page, with a live preview beside it (see section 3).
- **"To be announced".** Wherever something isn't ready (speakers, schedule, venue hall, prizes), the website automatically shows a friendly placeholder.
- **Refresh website** (on the dashboard). Only needed if the site shows old content after the website host deploys an update or changes the database directly. Normal saves don't need it.

## 2. Signing in and your account

1. Go to `/admin` and sign in with your e-mail and password.
2. Change your password under **My account**. Use 10 to 72 characters. Changing it signs you out on your other browsers and devices.
3. Forgotten your password? Ask an administrator to reset it under **Users**. A reset signs the account out everywhere.
4. Each sign-in lasts 7 days, and you can be signed in on several devices at once. **My account → Where you're signed in** lists them; **Sign out on the other devices** ends all but this one. **Sign out** ends the session on the server, so a copied cookie stops working too.
5. After several wrong passwords, sign-in from that network pauses for 15 minutes. You can still sign in from elsewhere.

**Roles:** *Editors* can change all content. *Administrators* can also add or remove users and volunteers, see the task tracker and delete registrations. *Volunteers* see only the parts of the panel an administrator gave them; their dashboard shows their responsibility, what they can work on and their recent changes.

## 3. Site settings: every page, with a live preview

**Site settings** has a tab for each page of the site (*Home*, *About*, *Programme*, *Speakers*, *Tutorials*, *Hackathon*, *Hackathon registration*, *Registration*, *Partners*, *Venue*, *Organisers*, *Photo gallery*, *Slides & recordings*, *Meet Aura*) and a **Site-wide** tab for what every page shares. Each tab lists the page's sections in the order they appear.

- **Section order:** on *Home*, *About*, *Programme*, *Hackathon*, *Partners*, *Venue*, *Organisers* and *Meet Aura*, the last tab, **Section order**, lists the page's sections so you can put them in order of priority: drag a section into place, or move it one step at a time with its arrows. The preview jumps to the section you moved. The hero (the page's landing section) always stays at the top and can't be moved. **Back to the default order** undoes it all. A section that isn't showing right now (the hackathon results before they're switched on, say) keeps its place for when it appears. Backgrounds are set per section, so after a move check that tinted and plain sections still take turns. On *Programme*, the "On this page" bar under the hero follows the new order. The other pages have a single section, or parts that sit side by side (*Registration*), so there is nothing to move.

- **A section's texts and colours:** its colour, its background (*Plain*, *Tinted band* or *Soft glow*), the small label above the title, the title, the introduction, and its button labels, card texts and the messages shown while something is still empty ("Speakers will be announced soon").
- **Live preview:** the real page is shown beside the form and follows what you type, with the section you're editing outlined. Switch between **Desktop** and **Phone**. Only you see unsaved changes; visitors see the saved site until you press **Save changes** (or **Discard** to go back). Links don't work inside the preview, so it stays on the page you're editing.
- **Layout check:** each text has a counter with its recommended length. If a text is so long that it wraps much further or pushes the layout out of line, or so short that it leaves a gap, a warning appears under it and on the page and section tabs. The preview also measures the real page and reports what your changes break, for example a title running onto 4 lines, text spilling out of its box or cut off, the section growing much taller, or the page scrolling sideways. Warnings never stop you saving.
- **Placeholders:** in many texts you can write `{event}`, `{dates}` or `{venue}`, and they are filled in from *Event details*, so the texts stay right when the dates change. The hint under a field lists the ones it accepts.
- **Colours:** *Site-wide → Colours* sets the brand colour and the seven accent colours sections choose from. Leave one blank for the built-in shade; lighter tints, dark text and dark mode follow automatically.
- **Navigation, header, footer and banner** names are under *Site-wide*.
- The items themselves (speakers, sessions, FAQs…) are still added under their own menu entries; the sections that show them say where.

If two people edit Site settings at the same time, their previews show each other's unsaved changes. Whoever saves last decides what is saved.

## 4. Event details, dates and registration

**Site settings → Site-wide → Event details**
- Event name, short name, tagline, short description (used by search engines and social media), organised by. The event name appears everywhere the event is named: the logo, the home page title, page titles, e-mails, calendar invites and the programme PDF. A few texts mention the name in their own words (*Workshop motivation* in the *About* tab, and the *Introduction* in *Partners → Hero*); update those by hand when the name changes, or use `{event}` where a field accepts it.
- **Starts / Ends** (Indian Standard Time). The countdown on the home page counts down to the start time.
- Venue, hall/building (leave blank to show "to be announced") and full address.

**Site settings → Site-wide → Registration**
- **Workshop registration:** *Opening soon*, *Open* or *Closed*, plus the deadline. The deadline appears on the website, and the form closes automatically once it passes. The home page shows the same status under the title (*Open until …*, *Opening soon* or *Closed*). Afterwards, also set the status to *Closed*.
- **External form (optional):** paste a Google Form / Unstop / Devfolio link to send people there instead of the built-in form.
- **Fees:** in the *Registration* tab → *Fees*: one row per category (e.g. Students, Academia, Industry), plus an optional note.
- **Confirmation e-mail text:** extra lines added to the confirmation e-mail, for example what to bring.
- **Hackathon registration:** status, deadline, and optionally the external platform link and its name.

**Site settings → Home:** whether the loading screen is used and its texts (*Loading screen*: the status lines under the progress ring and the line at lift-off; the first time someone opens the site, and after each update, it caches the site's files so the rest of the visit is quick; it isn't shown in the preview, so open the home page in a private window to see it), the highlight strip (e.g. *Speakers — TBA*, *Prize pool — TBA*; up to 6), whether the countdown is shown (*Hero*), what the large placard Aura holds in both fins in the hero says (*Hero announcements*; “Registration opening soon” to start with; about 35 characters fit, and with the text cleared she waves hello instead), how many featured speakers appear on the home page (*Speakers*), and the button labels of the hackathon section (*Hackathon*; its title, tagline, tracks and facts come from **Hackathon**).

**Site settings → Home → About and Themes**, and the **About** tab: the topics circled around Aura in the home page About section (up to 8: a two or three word topic, an icon, and the summary she gives in her speech bubble when a visitor hovers over or taps the topic; write {dates}, {venue} or {event} in a summary to fill them in from these settings); the text of the About page (workshop motivation, "What is agentic AI?", who should attend, activities); and the three theme cards (title and a 2–3 line description).

## 5. Announcements

**Announcements → New announcement**
- Title, short text, date, style (*Info*, *Important*, *Success*).
- Optional link and link label (e.g. to the registration page or a PDF).
- **Pin** important news to keep it at the top.

The newest announcements appear in the box on the home page.

## 6. Speakers and the programme

**Speakers → New speaker**
- Name, designation, affiliation, **label** (*Academia*, *Industry* or *Panelist*), theme, photo.
- Bio, talk title and talk abstract. These appear in the pop-up when a visitor clicks the speaker card.
- Profile links (website, LinkedIn, X, Google Scholar, GitHub).
- **Keynote speaker** adds a keynote badge. **Feature on the home page** adds the speaker to the home page grid.
- The "More speakers to be announced" card can be switched off in **Site settings → Home → Speakers** once the line-up is complete.

**Programme → New session**
- Day, start and end time, title, **type** (*Keynote*, *Talk*, *Panel*, *Tutorial*, *Demo*, *Hackathon*, *Break* or *Other*), theme, room/hall.
- **Speakers / instructors:** pick from your speakers. Add the speakers first. If a speaker isn't confirmed yet, use *Speaker text* (e.g. "Speaker to be announced").
- **Panels:** choose the *Moderator* and *Panelists*. The panel then also appears under *Panel discussions* on the Speakers page, linked to each speaker's card.

**Site settings → Programme → Schedule → Programme status**
- *To be announced:* the website shows "Schedule to be announced" (the default).
- *Draft:* sessions are shown with a "subject to change" note.
- *Final:* sessions are shown without the note.

The **PDF schedule** is generated automatically from the programme. To use your own PDF instead, upload it under *Schedule PDF*.

## 7. Tutorials, demos, kiosks and partners

- **Tutorials:** title, instructors (name, affiliation, link), level, duration, schedule text, prerequisites (one per line, e.g. "Laptop with Python 3.11"), materials and GitHub links, capacity.
- **Demos:** title, team or company, short description, an image and/or a YouTube/Vimeo link.
- **Industry kiosks:** company, booth, logo, short description of what they show, website. They are listed on the Programme page. Companies can apply through the **Exhibit with us** button there; applications arrive under **Enquiries**.
- **Partners & sponsors:** name, tier (*Title*, *Platinum*, *Gold* …), logo, website, short text. Their logos loop in a strip near the bottom of the home page (placeholder tiles until the first partner is added) and are grouped by tier on the **Partners & sponsors** page (`/partners`, under *Explore*). Edit the sponsorship tiers, introduction and brochure in **Site settings → Partners & kiosks**; they appear on that page with the **Become a partner** button.

## 8. Organisers, volunteers, mentors and judges

**Organisers & volunteers → New person.** Choose the **group**:

| Group | Shown on |
| --- | --- |
| Faculty organiser | Organisers page |
| Student organiser | Organisers page |
| Volunteer | Organisers page (a "Coming soon" card shows until the first volunteer is added) |
| Mentor | Hackathon page |
| Judge | Hackathon page |

Fill in name, role (e.g. "PhD scholar"), department, affiliation, profile link and photo. Everyone uses the same card style.

## 9. Hackathon

**Hackathon** (left menu) has tabs:
- **Overview:** title, tagline, description, mode (on-site / hybrid), team size, prize pool, eligibility.
- **Problem tracks:** one per theme (Healthcare, Scientific Discovery, Enterprise), each with example problems.
- **Rules & conduct:** rules and code of conduct.
- **Timeline:** registration → idea submission → shortlisting → final round (15–16 Dec) → results. Add dates as they are confirmed; the timeline highlights the current stage automatically.
- **Prizes & judging:** prizes and judging criteria (with weights if you like).
- **Resources:** APIs, datasets, compute credits and other links for participants.
- **Results:** winners. They stay hidden until you switch on **Post-event: show hackathon winners** in **Site settings → Site-wide → Features & post-event**.

Mentors and judges are added under **Organisers & volunteers** (section 7).

## 10. Venue and travel

**Site settings → Venue.** The home page shows a route map: visitors pick how they're arriving and see the route to IIT Delhi. Everything else is on the **Venue & travel** page (`/venue`).
- **Map location:** the text the embedded Google Map searches for (e.g. "Lecture Hall Complex, IIT Delhi"). For an exact pin, paste the link from Google Maps → *Share* → *Embed a map* → copy the `src` value.
- **Directions:** by air, train, metro and road. Each one becomes a button on the home page route map, which draws the matching route (airport, railway stations, metro or road), and a card on the Venue & travel page.
- **Campus entry information**, e.g. ID requirements and which gate to use.
- **Nearby accommodation:** guest houses, hotels or areas, with distance and links.
- **Local tips.**

## 11. Contact, social links, branding and SEO

All under **Site settings → Site-wide**.

- **Contact & social:** official e-mail, phone (optional), LinkedIn, X, Instagram, YouTube, and the address that is e-mailed about new hackathon teams and enquiries (workshop registrations are listed under **Registrations**).
- **Logos & images:** the **IIT Delhi** emblem (left corner of the navigation bar) and the **ScAI** logo (right corner) are built in; upload a file only to replace one (PNG or SVG with a transparent background is best). Also: an event logo and a custom social-media preview image (1200 × 630 px).
- **Colours:** the **brand colour** (e.g. `#3b5bdb`) for buttons and highlights, and the seven accent colours the sections use (see section 3).
- **SEO & analytics:** the Google Analytics ID (`G-…`) and search keywords.
- **Banner:** a site-wide notice (e.g. "Registration closes on 30 November"), its link and colour.
- **Features & post-event:** the *Ask Aura* helper and the post-event switches. (The *More speakers* card is under *Home → Speakers*.)

## 12. FAQs

**FAQs → New question:** question, answer (formatting allowed) and category (*General*, *Registration*, *Programme*, *Hackathon*, *Travel*, *Sponsorship*). Visitors can search and filter them.

## 13. Registrations and enquiries

**Registrations**
- *Workshop* and *Hackathon teams* tabs. Search by name, e-mail, organisation or ID, and filter by status.
- Change the status and add private notes. Workshop: *registered*, *confirmed*, *waitlisted*, *cancelled*. Hackathon teams: *registered*, *shortlisted*, *not shortlisted*, *withdrawn*.
- **Download CSV** opens in Excel (times are in IST).
- Each person receives a registration ID (e.g. `AAIW26-7KQ2M`) and a confirmation e-mail with a calendar invite, if e-mail is set up on the server.

**Enquiries:** contact-form messages, *Exhibit with us* requests and sponsorship enquiries. Use **Reply** to answer by e-mail, update the status, or download a CSV.

> If the dashboard says *E-mail is not configured*, forms still work and everything is saved. Ask the website host to add the SMTP settings so confirmation e-mails are sent.

## 14. After the event

1. **Photo gallery:** upload photos with captions and choose the day.
2. **Slides & recordings:** add each talk with the slides (PDF upload) and/or a YouTube link.
3. **Hackathon → Results:** add the winners.
4. In **Site settings → Site-wide → Features & post-event**, switch on the gallery, the slides & recordings and the winners. They appear in the menu automatically.

## 15. Users (administrators only)

**Users → Add user:** name, e-mail, role (*Editor* or *Administrator*) and a starting password. Share the password safely and ask them to change it under *My account*. You can reset passwords, change roles, or **Disable** someone who no longer needs access (they can be enabled again later).

## 16. Volunteers and the task tracker (administrators only)

**Volunteers → Add volunteer:** name, e-mail, password (type one or press **Generate**), their **responsibility** (for example *"Speaker coordination: keep speaker profiles and the programme up to date"*) and their **permissions**:
- Tick the areas they may open and change, grouped as in the menu: Hackathon, each content type, Registrations, Enquiries and the Media library. Everything else is hidden from them and refused by the server.
- **Site settings** is given page by page: one box per tab (Site-wide, Home, About, Programme … Meet Aura). A volunteer given *Home* and *Venue* sees only those two tabs, and the server reads and saves only those pages' fields for them: they never see private settings such as the notification e-mail unless they have *Site-wide*, and whatever else a request contains is ignored. Their previews show only their changes too. *Site-wide* covers the event details, dates, registration, colours, logos, contact and notification e-mails, navigation, footer, banner, features and SEO, so give it sparingly. Volunteers created before this change who had "Site settings" keep every page.
- **Delete items** is separate. Without it they can add, edit, hide and reorder, but not delete. Only administrators can delete registrations and enquiries.
- Anyone who edits something with a photo or file can upload images, even without the Media library.

Share the e-mail and password with them safely. **Edit** changes their details, permissions or password; changes apply straight away, even if they are signed in. A new password, **Disable** or **Remove** signs them out at once on every device. **Disable** pauses their access; **Remove** deletes the account. Their entries stay in the task tracker either way (Site settings entries name the pages changed, e.g. *Site settings › Home*).

**Task tracker** lists everything volunteers do, newest first: who did it, when, where, and for edits each changed field's value **before** and **after** (for additions and deletions, what was entered or deleted). Volunteers' downloads of registration or enquiry spreadsheets and their password changes are listed too. Filter by volunteer or area, press **Mark reviewed** once you've checked an entry (click again to undo), or **Mark all as reviewed**. The dashboard shows how many changes are waiting for review. Administrators' and editors' own changes are not tracked.

To list volunteers on the **website**, use *Organisers & volunteers*; that is separate from their sign-in.

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
