import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodError } from "zod";

export function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init.headers } });
}

export function error(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, { status });
}

/**
 * The visitor's IP address, for rate limits. Behind a reverse proxy (see the
 * README), the last X-Forwarded-For entry is the address the proxy saw;
 * anything before it could have been typed by the visitor, so it is never
 * used. CLIENT_IP_HEADER names another header to trust instead (e.g.
 * x-real-ip, or cf-connecting-ip behind Cloudflare). IPv6 addresses count per
 * /64, the block one connection usually gets, so hopping between addresses in
 * it doesn't get round the limits.
 */
export function clientIp(req: NextRequest | Request): string {
  const h = req.headers;
  const trusted = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  const forwarded = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  const ip = ((trusted ? h.get(trusted)?.split(",")[0] : forwarded?.at(-1)) ?? "").trim().toLowerCase().replace(/^::ffff:(?=\d)/, "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
  if (/^[0-9a-f:]{2,39}$/.test(ip) && ip.includes(":")) {
    const [head, tail = []] = ip.split("::").map((part) => part.split(":").filter(Boolean));
    const groups = [...head, ...Array<string>(Math.max(0, 8 - head.length - tail.length)).fill("0"), ...tail];
    return `${groups.slice(0, 4).join(":")}::/64`;
  }
  return "unknown";
}

/**
 * Reject cross-site state-changing requests (defence in depth on top of
 * SameSite cookies): the browser's Sec-Fetch-Site and Origin must say the
 * request came from this site's own pages. Other subdomains are refused too.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  if (!origin) return true;
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const MAX_BODY = 64 * 1024;

/**
 * Parse a JSON body with a size cap. Returns null for a body that isn't JSON
 * (by its Content-Type or its content), isn't valid UTF-8, or is larger than
 * the cap; reading stops as soon as the cap is passed.
 */
export async function readJson(req: Request, max = MAX_BODY): Promise<unknown | null> {
  if (!/^application\/json\b/i.test(req.headers.get("content-type") ?? "")) return null;
  const len = Number(req.headers.get("content-length") ?? 0);
  if (!Number.isFinite(len) || len > max || !req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    return null;
  }
}

export function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
