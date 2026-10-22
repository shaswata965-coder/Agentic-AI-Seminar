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

const positive = (value: string | undefined) => (Number(value) > 0 ? Math.floor(Number(value)) : undefined);

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function transport(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST) return (transporter = null);
  const port = Number(process.env.SMTP_PORT ?? 587);
  const perMinute = positive(process.env.SMTP_MAX_PER_MINUTE);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
    // A few connections reused for every e-mail, not a new one each: a registration rush sends thousands
    // within minutes, more connections at once than mail providers allow.
    pool: true,
    maxConnections: positive(process.env.SMTP_MAX_CONNECTIONS) ?? 3,
    // Stay under the provider's sending rate (e.g. 30 a minute for Microsoft 365); e-mails wait their turn.
    ...(perMinute ? { rateLimit: perMinute, rateDelta: 60_000 } : {}),
  });
  return transporter;
}

/**
 * Waits before each further attempt at an e-mail the server turned away for now, about 8 minutes in all.
 * Each wait varies by up to half, so e-mails refused together don't all come back together.
 */
const RETRY_AFTER_MS = [10_000, 30_000, 60_000, 120_000, 240_000];

/** A failure worth trying again: the connection, or a temporary refusal (SMTP 4xx, e.g. too busy). */
function transient(err: unknown) {
  const { code, responseCode } = (err ?? {}) as { code?: string; responseCode?: number };
  if (responseCode) return responseCode >= 400 && responseCode < 500;
  return ["ECONNECTION", "ESOCKET", "ETIMEDOUT", "EDNS"].includes(code ?? "");
}

/** Send an e-mail. Returns false (and logs) when SMTP is not configured or sending fails, after retries. */
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
  for (let attempt = 0; ; attempt++) {
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
      if (attempt < RETRY_AFTER_MS.length && transient(err)) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_AFTER_MS[attempt] * (0.5 + Math.random())));
        continue;
      }
      console.error(`[mail] failed to send "${input.subject}" to ${input.to}:`, (err as Error).message);
      return false;
    }
  }
}
