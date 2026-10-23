import { after, type NextRequest } from "next/server";
import { getHackathon, getSavedSettings } from "@/lib/content/queries";
import { connectDb, isDuplicateKeyError } from "@/lib/db";
import { deadlinePassed } from "@/lib/event";
import { answerText } from "@/lib/forms";
import { HackathonRegistration } from "@/lib/models";
import { hackathonEmail, notifyAddress, organiserNotice } from "@/lib/server/emails";
import { formLimit } from "@/lib/server/form-limits";
import { error, isRecord, isSameOrigin, json, readJson } from "@/lib/server/http";
import { makeRegId } from "@/lib/server/ids";
import { mailConfigured, sendMail } from "@/lib/server/mail";
import { checkTeam } from "@/lib/server/validation";

const teamKey = (name: string) => name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "");

/** Hackathon team registration (built-in form). */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const body = await readJson(req);
  const limit = formLimit(req, "hackathon", body);
  if (!limit.ok) return error(429, "Too many attempts. Please wait a few minutes and try again.", { retryAfter: limit.retryAfter });
  if (!isRecord(body)) return error(400, "Invalid request.");
  if ((body as { website?: string }).website) return json({ data: { regId: "HACK26-THANKS", emailSent: false } }, { status: 201 });

  const [s, h] = await Promise.all([getSavedSettings(), getHackathon()]);
  if (s.hackathonUrl) return error(409, `Hackathon registration happens on ${s.hackathonPlatform || "the external platform"}.`);
  if (!s.showHackathon) return error(403, "Hackathon registration has not opened yet.");
  if (s.hackathonStatus !== "open") return error(403, s.hackathonStatus === "closed" ? "Hackathon registration is closed." : "Hackathon registration has not opened yet.");
  if (deadlinePassed(s.hackathonDeadline)) return error(403, "Hackathon registration is closed: the deadline has passed.");

  const parsed = checkTeam(s, body);
  if (!parsed.ok) return error(422, "Please check the highlighted fields.", { fieldErrors: parsed.fieldErrors });
  const d = parsed.data;
  const key = teamKey(d.teamName);
  if (key.length < 2) return error(422, "Please choose a team name with letters or numbers.", { fieldErrors: { teamName: "Invalid team name" } });

  try {
    await connectDb();
  } catch {
    return error(503, "Registration is temporarily unavailable. Please try again shortly.");
  }

  const emails = d.members.map((m) => m.email);
  // Each participant can be in only one team. The answer doesn't say which address or which team, so it reveals as little as the rule allows.
  const clash = await HackathonRegistration.exists({ "members.email": { $in: emails }, status: { $ne: "withdrawn" } });
  if (clash) return error(409, "Someone in this team is already part of a registered team. Each participant can be in only one team: check the e-mail addresses, or contact the organisers.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const regId = makeRegId("HACK26");
    try {
      const doc = await HackathonRegistration.create({ ...d, teamKey: key, regId, leaderEmail: d.members[0].email });
      after(async () => {
        const sent = await sendMail(hackathonEmail(s, h, { teamName: d.teamName, regId, leaderName: d.members[0].name, leaderEmail: d.members[0].email, members: d.members }));
        if (sent) await HackathonRegistration.updateOne({ _id: doc._id }, { emailSent: true });
        const to = notifyAddress(s);
        if (to) {
          await sendMail(
            organiserNotice(s, to, `New hackathon team: ${d.teamName}`, [
              ["Team", d.teamName],
              ["ID", regId],
              ["Lead", `${d.members[0].name} <${d.members[0].email}>`],
              ["Members", String(d.members.length)],
              ["Idea", answerText(d.ideaTitle) || "-"],
            ]),
          );
        }
      });
      return json({ data: { regId, emailSent: mailConfigured() } }, { status: 201 });
    } catch (err) {
      if (!isDuplicateKeyError(err)) {
        console.error("[hackathon/register]", err);
        return error(500, "Something went wrong while saving your registration.");
      }
      if (/teamKey/.test(String((err as { message?: string }).message))) {
        return error(409, "That team name is already taken. Please choose another.", { fieldErrors: { teamName: "Team name taken" } });
      }
    }
  }
  return error(500, "Could not generate a registration ID. Please try again.");
}
