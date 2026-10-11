import { jwtVerify, SignJWT } from "jose";

/*
 * Session tokens for the admin panel: a signed (HS256) JWT stored in an
 * HTTP-only cookie. Shared by proxy.ts and the admin API routes.
 */

export const AUTH_COOKIE = "aaiw_admin";
export const SESSION_DAYS = 7;

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

// Only used in development when AUTH_SECRET is not set. Never valid in production.
const DEV_SECRET = "development-only-secret-do-not-use-in-production-aaiw-2026";
let warned = false;

/** AUTH_SECRET (32+ characters) is required in production. */
export function authSecret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV === "production") return null;
  if (!warned) {
    warned = true;
    console.warn("[auth] AUTH_SECRET is missing or shorter than 32 characters — using an insecure development secret.");
  }
  return new TextEncoder().encode(DEV_SECRET);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new SignJWT({ email: claims.email, name: claims.name, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySession(token?: string | null): Promise<SessionClaims | null> {
  const secret = authSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: String(payload.name ?? ""), role: payload.role === "admin" ? "admin" : "editor" };
  } catch {
    return null;
  }
}
