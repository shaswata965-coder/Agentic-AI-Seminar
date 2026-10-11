import { after, type NextRequest } from "next/server";
import { getSettings } from "@/lib/content/queries";
import { connectDb } from "@/lib/db";
import { Enquiry } from "@/lib/models";
import { enquiryAckEmail, notifyAddress, organiserNotice } from "@/lib/server/emails";
import { clientIp, error, isSameOrigin, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/rate-limit";
import { enquirySchema } from "@/lib/server/validation";

const LABEL = { contact: "Contact message", exhibitor: "Exhibitor enquiry", sponsor: "Sponsorship enquiry" } as const;

/** Contact form, "Exhibit with us" and "Become a partner" enquiries. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const limit = rateLimit(`enquiry:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) return error(429, "You've sent several messages already. Please wait a few minutes.", { retryAfter: limit.retryAfter });

  const body = await readJson(req);
  if (!body || typeof body !== "object") return error(400, "Invalid request.");
  if ((body as { website?: string }).website) return json({ message: "Thanks!" }, { status: 201 });

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return error(422, "Please check the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const d = parsed.data;

  try {
    await connectDb();
    await Enquiry.create(d);
  } catch (err) {
    console.error("[enquiries]", err);
    return error(503, "We couldn't send your message right now. Please try again shortly.");
  }

  const s = await getSettings();
  after(async () => {
    await sendMail(enquiryAckEmail(s, d));
    const to = notifyAddress(s);
    if (to) {
      await sendMail(
        organiserNotice(
          s,
          to,
          `${LABEL[d.type]} from ${d.name}`,
          [
            ["Name", d.name],
            ["E-mail", d.email],
            ["Organisation", d.organisation || "-"],
            ["Phone", d.phone || "-"],
            ["Subject", d.subject || "-"],
            ["Message", d.message],
          ],
          d.email,
        ),
      );
    }
  });
  return json({ message: "Message sent" }, { status: 201 });
}
