import { after, type NextRequest } from "next/server";
import { getSavedSettings } from "@/lib/content/queries";
import { connectDb } from "@/lib/db";
import { Enquiry } from "@/lib/models";
import { enquiryAckEmail, notifyAddress, organiserNotice } from "@/lib/server/emails";
import { formLimit } from "@/lib/server/form-limits";
import { error, isRecord, isSameOrigin, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { enquirySchema } from "@/lib/server/validation";

const LABEL = { contact: "Contact message", exhibitor: "Exhibitor enquiry", sponsor: "Sponsorship enquiry" } as const;

/** Contact form, "Exhibit with us" and "Become a partner" enquiries. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const body = await readJson(req);
  const limit = formLimit(req, "enquiry", body);
  if (!limit.ok) return error(429, "You've sent several messages already. Please wait a few minutes.", { retryAfter: limit.retryAfter });
  if (!isRecord(body)) return error(400, "Invalid request.");
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

  const s = await getSavedSettings();
  after(async () => {
    await sendMail(enquiryAckEmail(s, { email: d.email, type: d.type }));
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
