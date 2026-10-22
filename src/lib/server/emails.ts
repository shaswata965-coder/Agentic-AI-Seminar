import "server-only";
import { buildIcs } from "@/lib/calendar";
import type { HackathonInfo, SiteSettings } from "@/lib/content/types";
import { eventDays, venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";
import type { MailInput } from "./mail";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(s: SiteSettings, title: string, body: string) {
  const dates = formatDateRange(s.startDate, s.endDate);
  return `<!doctype html><html><body style="margin:0;background:#f6f8fc;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e1e7f1">
<tr><td style="padding:28px 32px;background:linear-gradient(135deg,#eaf5ff,#f2eeff);">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#5b3cc4;font-weight:700">${esc(s.eventName)}</p>
<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25">${esc(title)}</h1></td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;color:#334155">${body}</td></tr>
<tr><td style="padding:20px 32px;background:#f3f6fb;font-size:13px;color:#64748b">
${esc(dates)} · ${esc(venueLine(s))}<br/><a href="${absoluteUrl("/")}" style="color:#3b5bdb">${esc(absoluteUrl("/").replace(/^https?:\/\//, ""))}</a>
</td></tr></table></td></tr></table></body></html>`;
}

const box = (inner: string) => `<div style="margin:18px 0;padding:16px 18px;border-radius:14px;background:#f3f6fb;border:1px solid #e1e7f1">${inner}</div>`;
const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:8px;padding:12px 20px;border-radius:999px;background:#3b5bdb;color:#ffffff;text-decoration:none;font-weight:600">${esc(label)}</a>`;

export function workshopIcs(s: SiteSettings) {
  return buildIcs(
    eventDays(s).map((d) => ({
      uid: `aaiw-day-${d.day}@${new URL(absoluteUrl("/")).hostname}`,
      title: `${s.eventName}, Day ${d.day}`,
      start: d.start,
      end: d.end,
      description: `${s.tagline}\n${absoluteUrl("/programme")}`,
      location: s.venueAddress || venueLine(s),
      url: absoluteUrl("/"),
    })),
    s.eventName,
  );
}

export function registrationEmail(s: SiteSettings, r: { name: string; email: string; regId: string }): MailInput {
  const dates = formatDateRange(s.startDate, s.endDate);
  const body = `<p>Hi ${esc(r.name)},</p>
<p>Thank you for registering for the <strong>${esc(s.eventName)}</strong>. We're delighted you'll be joining us!</p>
${box(`<p style="margin:0;font-size:13px;color:#64748b">Your registration ID</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;letter-spacing:.06em;color:#3b5bdb">${esc(r.regId)}</p>`)}
<p><strong>When:</strong> ${esc(dates)}<br/><strong>Where:</strong> ${esc(venueLine(s))}</p>
<p>Please carry a valid photo ID and this registration ID for campus entry. The exact hall and any updates will be shared on the website and by e-mail.</p>
${s.confirmationNote ? `<p>${esc(s.confirmationNote)}</p>` : ""}
<p>We've attached a calendar file so you can add the workshop to your calendar.</p>
<p>${button(absoluteUrl("/programme"), "View the programme")}</p>
<p style="margin-top:24px">See you at IIT Delhi!<br/>The organising team</p>`;
  const text = `Hi ${r.name},

Thank you for registering for the ${s.eventName}.

Your registration ID: ${r.regId}
When: ${dates}
Where: ${venueLine(s)}

Please carry a valid photo ID and this registration ID for campus entry.
${s.confirmationNote ? `\n${s.confirmationNote}\n` : ""}
Programme: ${absoluteUrl("/programme")}

The organising team`;
  return {
    to: r.email,
    subject: `You're registered: ${s.eventName} (${r.regId})`,
    html: layout(s, "Your registration is confirmed", body),
    text,
    replyTo: s.contactEmail || undefined,
    attachments: [{ filename: "agentic-ai-workshop-2026.ics", content: workshopIcs(s), contentType: "text/calendar; charset=utf-8; method=PUBLISH" }],
    visitor: true,
  };
}

export function hackathonEmail(s: SiteSettings, h: HackathonInfo, t: { teamName: string; regId: string; leaderName: string; leaderEmail: string; members: { name: string; email: string }[]; track: string }): MailInput {
  const list = t.members.map((m) => `<li>${esc(m.name)} &lt;${esc(m.email)}&gt;</li>`).join("");
  const body = `<p>Hi ${esc(t.leaderName)},</p>
<p>Your team <strong>${esc(t.teamName)}</strong> is registered for the <strong>${esc(h.title)}</strong>.</p>
${box(`<p style="margin:0;font-size:13px;color:#64748b">Team registration ID</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;letter-spacing:.06em;color:#3b5bdb">${esc(t.regId)}</p>`)}
<p><strong>Theme:</strong> ${esc(t.track || "Undecided")}</p>
<p><strong>Team members</strong></p><ul>${list}</ul>
<p>Keep an eye on the hackathon page for the idea-submission date, rules and timeline.</p>
<p>${button(absoluteUrl("/hackathon"), "Hackathon details")}</p>
<p style="margin-top:24px">Happy building!<br/>The organising team</p>`;
  const text = `Hi ${t.leaderName},

Your team "${t.teamName}" is registered for the ${h.title}.
Team registration ID: ${t.regId}
Theme: ${t.track || "Undecided"}
Members:
${t.members.map((m) => `- ${m.name} <${m.email}>`).join("\n")}

Details: ${absoluteUrl("/hackathon")}

The organising team`;
  // Every member gets a copy, so the whole team has the team ID.
  const lead = t.leaderEmail.toLowerCase();
  const cc = [...new Set(t.members.map((m) => m.email.trim().toLowerCase()).filter((e) => e && e !== lead))];
  return { to: t.leaderEmail, cc, subject: `Team registered: ${t.teamName} (${t.regId})`, html: layout(s, "Your team is registered", body), text, replyTo: s.contactEmail || undefined, visitor: true };
}

const ENQUIRY_LABEL = { contact: "message", exhibitor: "exhibitor enquiry", sponsor: "sponsorship enquiry" } as const;

/**
 * The acknowledgement goes to whatever address was typed into the form, so it
 * repeats nothing the visitor wrote: it can't be used to send someone else a
 * message from the event's address.
 */
export function enquiryAckEmail(s: SiteSettings, e: { email: string; type: keyof typeof ENQUIRY_LABEL }): MailInput {
  const label = ENQUIRY_LABEL[e.type];
  const body = `<p>Hello,</p><p>Thanks for your ${label}. The organising team has received it and will get back to you soon.</p><p>If you didn't send it, you can ignore this e-mail.</p><p>The organising team</p>`;
  return {
    to: e.email,
    subject: `We received your ${label} · ${s.eventName}`,
    html: layout(s, "Thanks for getting in touch", body),
    text: `Hello,\n\nThanks for your ${label}. The organising team will get back to you soon.\n\nIf you didn't send it, you can ignore this e-mail.\n\nThe organising team`,
    replyTo: s.contactEmail || undefined,
    visitor: true,
  };
}

export function organiserNotice(s: SiteSettings, to: string, subject: string, rows: [string, string][], replyTo?: string): MailInput {
  const table = rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join("");
  return {
    to,
    subject,
    html: layout(s, subject, `<table role="presentation" cellpadding="0" cellspacing="0">${table}</table><p>${button(absoluteUrl("/admin"), "Open the admin panel")}</p>`),
    text: `${subject}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${absoluteUrl("/admin")}`,
    replyTo,
  };
}

export function notifyAddress(s: SiteSettings) {
  return s.notifyEmail || process.env.NOTIFY_EMAIL || s.contactEmail || "";
}
