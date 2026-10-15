import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { rateLimit } from "./rate-limit";

export interface MailInput {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType: string }[];
  /**
   * The addresses were typed into a public form. Each gets at most a few
   * e-mails a day, so the forms can't be used to flood someone's inbox through
   * the event's mail server.
   */
  visitor?: boolean;
}

const PER_ADDRESS_PER_DAY = 3;
const allowed = (address: string) => rateLimit(`mail-to:${address.trim().toLowerCase()}`, PER_ADDRESS_PER_DAY, 24 * 3_600_000).ok;

let transporter: Transporter | null | undefined;

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function transport(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST) return (transporter = null);
  const port = Number(process.env.SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

/** Send an e-mail. Returns false (and logs) when SMTP is not configured or sending fails. */
export async function sendMail(input: MailInput): Promise<boolean> {
  const t = transport();
  if (!t) {
    console.info(`[mail] SMTP not configured, skipped "${input.subject}" to ${input.to}`);
    return false;
  }
  let cc = input.cc;
  if (input.visitor) {
    if (!allowed(input.to)) {
      console.info(`[mail] daily limit reached for a visitor address, skipped "${input.subject}"`);
      return false;
    }
    cc = cc?.filter(allowed);
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: input.to,
      cc: cc?.length ? cc : undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send "${input.subject}" to ${input.to}:`, (err as Error).message);
    return false;
  }
}
