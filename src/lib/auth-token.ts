import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/lib/permissions";

/*
 * Session tokens for the admin panel: a signed (HS256) JWT stored in an
 * HTTP-only cookie. It names a session stored in the database (sid), which
 * the admin API checks on every request, so signing out or changing a
 * password ends it even before it expires. Shared by proxy.ts (which only
 * checks the signature, to send signed-out visitors to the sign-in page) and
 * the admin API routes.
 */

export const AUTH_COOKIE = "aaiw_admin";
export const SESSION_DAYS = 7;
const ISSUER = "aaiw";
const AUDIENCE = "aaiw-admin";

export interface SessionClaims {
  sub: string;
  /** The session's id in the database. */
  sid: string;
  email: string;
  name: string;
  role: Role;
}

// Only used in development when AUTH_SECRET is not set. Never valid in production.
const DEV_SECRET = "development-only-secret-do-not-use-in-production-aaiw-2026";
let warned = false;

/** Long, varied and not the development secret: e.g. `openssl rand -base64 48`. */
const strong = (raw: string) => raw.length >= 32 && new Set(raw).size >= 12 && raw !== DEV_SECRET;

/** AUTH_SECRET (32+ random characters) is required in production; without it sign-in is refused. */
export function authSecret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (raw && strong(raw)) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV === "production") return null;
  if (!warned) {
    warned = true;
    console.warn("[auth] AUTH_SECRET is missing or shorter than 32 characters; using an insecure development secret.");
  }
  return new TextEncoder().encode(DEV_SECRET);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new SignJWT({ email: claims.email, name: claims.name, role: claims.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setJti(claims.sid)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySession(token?: string | null): Promise<SessionClaims | null> {
  const secret = authSecret();
  if (!token || !secret || token.length > 4096) return null;
  try {
    // Only HS256 with this secret: "none" and other algorithms are refused, as are expired tokens and other apps' tokens.
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE, requiredClaims: ["sub", "jti", "exp", "iat"] });
    if (typeof payload.sub !== "string" || typeof payload.jti !== "string" || typeof payload.email !== "string") return null;
    return { sub: payload.sub, sid: payload.jti, email: payload.email, name: String(payload.name ?? ""), role: payload.role === "admin" || payload.role === "volunteer" ? payload.role : "editor" };
  } catch {
    return null;
  }
}
