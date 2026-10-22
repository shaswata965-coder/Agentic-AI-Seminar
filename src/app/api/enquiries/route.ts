import { after, type NextRequest } from "next/server";
import { getSavedSettings } from "@/lib/content/queries";
import { connectDb } from "@/lib/db";
import { Enquiry } from "@/lib/models";
import { enquiryAckEmail, notifyAddress, organiserNotice } from "@/lib/server/emails";
import { formLimit } from "@/lib/server/form-limits";
import { error, isRecord, isSameOrigin, json, readJson } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { answerText, ENQUIRY_FORMS, FORM_SETTINGS } from "@/lib/forms";
import { checkEnquiry } from "@/lib/server/validation";

const LABEL = { contact: "Contact message", exhibitor: "Exhibitor enquiry", sponsor: "Sponsorship enquiry" } as const;

/** Contact form, "Exhibit with us" and "Become a partner" enquiries. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site requests are not allowed.");
  const body = await readJson(req);
  const limit = formLimit(req, "enquiry", body);
  if (!limit.ok) return error(429, "You've sent several messages already. Please wait a few minutes.", { retryAfter: limit.retryAfter });
  if (!isRecord(body)) return error(400, "Invalid request.");
  if ((body as { website?: string }).website) return json({ message: "Thanks!" }, { status: 201 });

  const s = await getSavedSettings();
  const parsed = checkEnquiry(s, body);
  if (!parsed.ok) return error(422, "Please check the highlighted fields.", { fieldErrors: parsed.fieldErrors });
  const d = parsed.data;

  try {
    await connectDb();
    await Enquiry.create(d);
  } catch (err) {
    console.error("[enquiries]", err);
    return error(503, "We couldn't send your message right now. Please try again shortly.");
  }

  // The notice lists every field shown on the form, by its name there.
  const fields = s[FORM_SETTINGS[ENQUIRY_FORMS[d.type]]].filter((f) => !f.hidden);
  after(async () => {
    await sendMail(enquiryAckEmail(s, { email: d.email, type: d.type }));
    const to = notifyAddress(s);
    if (to) {
      await sendMail(
        organiserNotice(
          s,
          to,
          `${LABEL[d.type]} from ${d.name}`,
          fields.map((f) => [f.label, answerText(f.key in d.answers ? d.answers[f.key] : d[f.key]) || "-"]),
          d.email,
        ),
      );
    }
  });
  return json({ message: "Message sent" }, { status: 201 });
}
