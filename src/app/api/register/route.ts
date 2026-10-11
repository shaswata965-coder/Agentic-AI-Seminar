import { after, type NextRequest } from "next/server";
import { getSettings } from "@/lib/content/queries";
import { connectDb, isDuplicateKeyError } from "@/lib/db";
import { deadlinePassed } from "@/lib/event";
import { Registration } from "@/lib/models";
import { registrationEmail } from "@/lib/server/emails";
import { clientIp, error, isSameOrigin, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { makeRegId } from "@/lib/server/ids";
import { mailConfigured, sendMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/rate-limit";
import { registrationSchema } from "@/lib/server/validation";

/** Workshop registration (built-in form). */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const limit = rateLimit(`register:${clientIp(req)}`, 8, 15 * 60_000);
  if (!limit.ok) return error(429, "Too many attempts — please wait a few minutes and try again.", { retryAfter: limit.retryAfter });

  const body = await readJson(req);
  if (!body || typeof body !== "object") return error(400, "Invalid request.");
  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if ((body as { website?: string }).website) return json({ data: { regId: "AAIW26-THANKS", emailSent: false } }, { status: 201 });

  const s = await getSettings();
  if (s.workshopUrl) return error(409, "Registration is handled through the official external form.");
  if (s.workshopStatus !== "open") return error(403, s.workshopStatus === "closed" ? "Registration is closed." : "Registration has not opened yet.");
  if (deadlinePassed(s.workshopDeadline)) return error(403, "Registration is closed — the deadline has passed.");

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return error(422, "Please check the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const data = parsed.data;

  try {
    await connectDb();
  } catch {
    return error(503, "Registration is temporarily unavailable. Please try again shortly.");
  }

  const existing = await Registration.findOne({ email: data.email }).lean();
  if (existing) {
    if (rateLimit(`resend:${data.email}`, 1, 30 * 60_000).ok) {
      after(() => sendMail(registrationEmail(s, { name: existing.name, email: existing.email, regId: existing.regId })));
    }
    return error(409, "This e-mail address is already registered. We've re-sent your confirmation e-mail.", { fieldErrors: { email: "Already registered" } });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const regId = makeRegId();
    try {
      const doc = await Registration.create({ ...data, regId });
      after(async () => {
        const sent = await sendMail(registrationEmail(s, { name: doc.name, email: doc.email, regId }));
        if (sent) await Registration.updateOne({ _id: doc._id }, { emailSent: true });
      });
      return json({ data: { regId, emailSent: mailConfigured() } }, { status: 201 });
    } catch (err) {
      if (!isDuplicateKeyError(err)) {
        console.error("[register]", err);
        return error(500, "Something went wrong while saving your registration.");
      }
      const dupEmail = /email/.test(String((err as { message?: string }).message));
      if (dupEmail) return error(409, "This e-mail address is already registered.", { fieldErrors: { email: "Already registered" } });
    }
  }
  return error(500, "Could not generate a registration ID. Please try again.");
}
