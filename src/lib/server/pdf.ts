import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { stripMarkdown } from "@/components/ui/RichText";
import { SESSION_TYPE_META, THEME_META } from "@/lib/content/constants";
import { getSessions, getSettings, getSpeakers } from "@/lib/content/queries";
import type { Session, SiteSettings, Speaker } from "@/lib/content/types";
import { eventDays, venueLine } from "@/lib/event";
import { eventDayLabel, formatDate, formatDateRange, timeRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

const A4 = { w: 595.28, h: 841.89 };
const M = 44;
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.28, 0.33, 0.41);
const SUBTLE = rgb(0.45, 0.5, 0.58);
const LINE = rgb(0.88, 0.9, 0.94);
const BRAND = rgb(0.23, 0.36, 0.86);
const TINT: Record<string, ReturnType<typeof rgb>> = {
  azure: rgb(0.92, 0.96, 1),
  lilac: rgb(0.95, 0.93, 1),
  mint: rgb(0.91, 0.97, 0.95),
  peach: rgb(1, 0.95, 0.91),
  blush: rgb(1, 0.93, 0.95),
  butter: rgb(1, 0.97, 0.86),
  aqua: rgb(0.89, 0.98, 1),
};

const REPLACE: Record<string, string> = { "‘": "'", "’": "'", "“": '"', "”": '"', "‑": "-", " ": " ", "₹": "Rs.", "→": "->", "←": "<-" };

/** Standard PDF fonts only cover WinAnsi; replace anything else. */
function safe(font: PDFFont, text: string) {
  let out = "";
  for (const ch of text.replace(/\r?\n/g, " ")) {
    const c = REPLACE[ch] ?? ch;
    try {
      font.widthOfTextAtSize(c, 10);
      out += c;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(font: PDFFont, size: number, text: string, width: number): string[] {
  const words = safe(font, text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= width) line = test;
    else {
      if (line) lines.push(line);
      line = w;
      while (font.widthOfTextAtSize(line, size) > width && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > width) cut--;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

async function build(s: SiteSettings, sessions: Session[], speakers: Speaker[], generated: Date): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${s.eventName} — Programme`);
  doc.setAuthor("IIT Delhi · Yardi School of Artificial Intelligence");
  doc.setSubject("Workshop programme");
  doc.setCreator(absoluteUrl("/"));
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const byId = Object.fromEntries(speakers.map((sp) => [sp.id, sp]));

  let page: PDFPage = doc.addPage([A4.w, A4.h]);
  let y = A4.h - M;

  const header = (first: boolean) => {
    if (first) {
      page.drawRectangle({ x: 0, y: A4.h - 150, width: A4.w, height: 150, color: rgb(0.94, 0.95, 1) });
      page.drawText(safe(bold, "PROGRAMME"), { x: M, y: A4.h - 52, size: 10, font: bold, color: BRAND });
      page.drawText(safe(bold, s.eventName), { x: M, y: A4.h - 82, size: 24, font: bold, color: INK });
      page.drawText(safe(font, `${formatDateRange(s.startDate, s.endDate)}  ·  ${venueLine(s)}`), { x: M, y: A4.h - 104, size: 11, font, color: MUTED });
      page.drawText(safe(font, s.organisedBy), { x: M, y: A4.h - 122, size: 9, font, color: SUBTLE });
      y = A4.h - 178;
      if (s.programmeStatus === "draft") {
        page.drawRectangle({ x: M, y: y - 6, width: A4.w - 2 * M, height: 22, color: TINT.butter });
        page.drawText(safe(bold, "Draft schedule — sessions and timings may change. Check the website for the latest version."), { x: M + 8, y: y + 1, size: 9, font: bold, color: rgb(0.54, 0.37, 0) });
        y -= 34;
      }
    } else {
      page.drawText(safe(bold, `${s.eventName} — Programme (continued)`), { x: M, y: A4.h - M, size: 10, font: bold, color: SUBTLE });
      y = A4.h - M - 26;
    }
  };
  header(true);

  const ensure = (needed: number) => {
    if (y - needed < M + 30) {
      page = doc.addPage([A4.w, A4.h]);
      header(false);
    }
  };

  const cols = { time: M, session: M + 78, type: A4.w - M - 150, room: A4.w - M - 78 };
  const sessionWidth = cols.type - cols.session - 12;

  if (s.programmeStatus === "tba" || sessions.length === 0) {
    page.drawText(safe(bold, "Schedule to be announced"), { x: M, y, size: 20, font: bold, color: INK });
    y -= 26;
    for (const line of wrap(font, 11, s.programmeNote, A4.w - 2 * M)) {
      page.drawText(line, { x: M, y, size: 11, font, color: MUTED });
      y -= 16;
    }
    y -= 8;
    page.drawText(safe(font, `Latest updates: ${absoluteUrl("/programme")}`), { x: M, y, size: 11, font, color: BRAND });
  } else {
    for (const d of eventDays(s)) {
      const list = sessions.filter((x) => Number(x.day) === d.day);
      if (!list.length) continue;
      ensure(70);
      page.drawText(safe(bold, `Day ${d.day}  ·  ${eventDayLabel(s.startDate, d.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`), { x: M, y, size: 14, font: bold, color: INK });
      y -= 20;
      page.drawLine({ start: { x: M, y: y + 6 }, end: { x: A4.w - M, y: y + 6 }, thickness: 1, color: LINE });
      for (const [label, x] of [["TIME", cols.time], ["SESSION", cols.session], ["TYPE", cols.type], ["ROOM", cols.room]] as const) {
        page.drawText(label, { x, y: y - 8, size: 7.5, font: bold, color: SUBTLE });
      }
      y -= 22;
      for (const x of list) {
        const type = SESSION_TYPE_META[x.type] ?? SESSION_TYPE_META.other;
        const people = (x.type === "panel" ? x.panelists : x.speakers).map((id) => byId[id]).filter(Boolean);
        const moderator = x.moderator ? byId[x.moderator] : undefined;
        const who = [moderator ? `Moderator: ${moderator.name}` : "", people.length ? `${x.type === "panel" ? "Panelists: " : ""}${people.map((p) => (p.affiliation ? `${p.name} (${p.affiliation})` : p.name)).join(", ")}` : x.speakerNote]
          .filter(Boolean)
          .join("  ·  ");
        const titleLines = wrap(bold, 10.5, x.title, sessionWidth);
        const whoLines = who ? wrap(font, 8.5, who, sessionWidth) : [];
        const themeLine = x.theme && x.theme !== "general" ? THEME_META[x.theme].short : "";
        const roomLines = wrap(font, 8.5, x.type === "break" ? "" : x.room || "TBA", 72);
        const h = Math.max(titleLines.length * 13 + whoLines.length * 11 + (themeLine ? 11 : 0), roomLines.length * 11, 16) + 12;
        ensure(h);
        if (x.type === "break") page.drawRectangle({ x: M - 6, y: y - h + 10, width: A4.w - 2 * M + 12, height: h - 2, color: TINT.butter });
        page.drawText(safe(bold, timeRange(x.start, x.end)), { x: cols.time, y, size: 9.5, font: bold, color: INK });
        let ty = y;
        for (const l of titleLines) {
          page.drawText(l, { x: cols.session, y: ty, size: 10.5, font: bold, color: INK });
          ty -= 13;
        }
        for (const l of whoLines) {
          page.drawText(l, { x: cols.session, y: ty, size: 8.5, font, color: MUTED });
          ty -= 11;
        }
        if (themeLine) page.drawText(safe(font, themeLine), { x: cols.session, y: ty, size: 8, font, color: SUBTLE });
        const tw = bold.widthOfTextAtSize(type.label, 8) + 10;
        page.drawRectangle({ x: cols.type, y: y - 4, width: tw, height: 14, color: TINT[type.tone] ?? TINT.azure });
        page.drawText(type.label, { x: cols.type + 5, y, size: 8, font: bold, color: INK });
        let ry = y;
        for (const l of roomLines) {
          page.drawText(l, { x: cols.room, y: ry, size: 8.5, font, color: MUTED });
          ry -= 11;
        }
        y -= h;
        page.drawLine({ start: { x: M, y: y + 8 }, end: { x: A4.w - M, y: y + 8 }, thickness: 0.5, color: LINE });
      }
      y -= 14;
    }
  }

  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const footer = safe(font, `Generated ${formatDate(generated.toISOString(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} IST  ·  ${absoluteUrl("/programme")}  ·  Page ${i + 1} of ${pages.length}`);
    p.drawText(footer, { x: M, y: 24, size: 8, font, color: SUBTLE });
  });
  return doc.save();
}

/** The programme as a PDF, regenerated automatically when sessions, speakers or settings change. */
export async function getSchedulePdf(): Promise<Uint8Array> {
  "use cache";
  cacheTag("sessions", "speakers", "settings");
  cacheLife("cms");
  const [s, sessions, speakers] = await Promise.all([getSettings(), getSessions(), getSpeakers()]);
  const plain = sessions.map((x) => ({ ...x, description: stripMarkdown(x.description) }));
  return build(s, plain, speakers, new Date());
}
