import { after, type NextRequest } from "next/server";
import { getSavedSettings } from "@/lib/content/queries";
import { connectDb, isDuplicateKeyError } from "@/lib/db";
import { deadlinePassed } from "@/lib/event";
import { Registration } from "@/lib/models";
import { registrationEmail } from "@/lib/server/emails";
import { formLimit } from "@/lib/server/form-limits";
import { error, isRecord, isSameOrigin, json, readJson } from "@/lib/server/http";
import { makeRegId } from "@/lib/server/ids";
import { mailConfigured, sendMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/rate-limit";
import { checkRegistration } from "@/lib/server/validation";

// With e-mail set up, every successful submission gets this answer: the registration ID is in the e-mail.
const accepted = () => json({ data: { regId: null, emailSent: true } }, { status: 201 });

/**
 * Workshop registration (built-in form). With e-mail set up, the answer is the
 * same whether or not the address was already registered (the ID goes to the
 * inbox, and an earlier registration's confirmation is sent again), so the
 * form can't be used to find out who has registered.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const body = await readJson(req);
  const limit = formLimit(req, "register", body);
  if (!limit.ok) return error(429, "Too many attempts. Please wait a few minutes and try again.", { retryAfter: limit.retryAfter });
  if (!isRecord(body)) return error(400, "Invalid request.");
  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if ((body as { website?: string }).website) return mailConfigured() ? accepted() : json({ data: { regId: "AAIW26-THANKS", emailSent: false } }, { status: 201 });

  const s = await getSavedSettings();
  if (s.workshopUrl) return error(409, "Registration is handled through the official external form.");
  if (s.workshopStatus !== "open") return error(403, s.workshopStatus === "closed" ? "Registration is closed." : "Registration has not opened yet.");
  if (deadlinePassed(s.workshopDeadline)) return error(403, "Registration is closed: the deadline has passed.");

  const parsed = checkRegistration(s, body);
  if (!parsed.ok) return error(422, "Please check the highlighted fields.", { fieldErrors: parsed.fieldErrors });
  const data = parsed.data;

  try {
    await connectDb();
  } catch {
    return error(503, "Registration is temporarily unavailable. Please try again shortly.");
  }

  const mail = mailConfigured();
  const existing = await Registration.findOne({ email: data.email }).lean();
  if (existing) {
    if (mail) {
      if (rateLimit(`resend:${data.email}`, 1, 30 * 60_000).ok) after(() => sendMail(registrationEmail(s, { name: existing.name, email: existing.email, regId: existing.regId })));
      return accepted();
    }
    return error(409, "This e-mail address is already registered. Contact the organisers if you need your registration details.", { fieldErrors: { email: "Already registered" } });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const regId = makeRegId();
    try {
      const doc = await Registration.create({ ...data, regId });
      after(async () => {
        const sent = await sendMail(registrationEmail(s, { name: doc.name, email: doc.email, regId }));
        if (sent) await Registration.updateOne({ _id: doc._id }, { emailSent: true });
      });
      return mail ? accepted() : json({ data: { regId, emailSent: false } }, { status: 201 });
    } catch (err) {
      if (!isDuplicateKeyError(err)) {
        console.error("[register]", err);
        return error(500, "Something went wrong while saving your registration.");
      }
      const dupEmail = /email/.test(String((err as { message?: string }).message));
      if (dupEmail) return mail ? accepted() : error(409, "This e-mail address is already registered.", { fieldErrors: { email: "Already registered" } });
    }
  }
  return error(500, "Could not generate a registration ID. Please try again.");
}
