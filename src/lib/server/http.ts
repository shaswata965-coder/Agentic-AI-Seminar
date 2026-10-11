import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodError } from "zod";

export function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init.headers } });
}

export function error(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, { status });
}

/** Client IP (trusts X-Forwarded-For / X-Real-IP set by the reverse proxy). */
export function clientIp(req: NextRequest | Request): string {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown").slice(0, 64);
}

/** Reject cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if (site && !["same-origin", "same-site", "none"].includes(site)) return false;
  if (!origin) return true;
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const MAX_BODY = 64 * 1024;

/** Parse a JSON body with a size cap. Returns null for invalid/oversized bodies. */
export async function readJson(req: Request, max = MAX_BODY): Promise<unknown | null> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > max) return null;
  try {
    const text = await req.text();
    if (text.length > max) return null;
    return JSON.parse(text);
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
