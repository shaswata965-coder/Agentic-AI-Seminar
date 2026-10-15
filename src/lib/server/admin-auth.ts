import "server-only";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, SESSION_DAYS, signSession, verifySession } from "@/lib/auth-token";
import { connectDb } from "@/lib/db";
import { AdminSession, User, type UserDoc } from "@/lib/models";
import { passwordProblem } from "@/lib/password";
import { BASE_PATH } from "@/lib/paths";
import { normalizePermissions, type Permission, type Role } from "@/lib/permissions";
import { error, isSameOrigin } from "./http";

export { hashPassword, PASSWORD_MIN, verifyPassword } from "@/lib/password";

/** A new password, as every form that sets one checks it. */
export const newPassword = z.string().superRefine((p, ctx) => {
  const problem = passwordProblem(p);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Volunteers only (empty for everyone else). */
  responsibility: string;
  permissions: Permission[];
  /** The session this request was made in. */
  sessionId: string;
}

// lastSeenAt is written at most this often, not on every request.
const TOUCH_MS = 10 * 60_000;
// The oldest sessions beyond this many per account are ended at sign-in.
const MAX_SESSIONS = 10;

/**
 * The signed-in admin for this request. The token's signature and expiry are
 * checked, then its session and account are looked up: a session that was
 * ended, or an account that was disabled or deleted, is signed out.
 */
export async function getAdmin(req: NextRequest): Promise<AdminUser | null> {
  const claims = await verifySession(req.cookies.get(AUTH_COOKIE)?.value);
  if (!claims || !mongoose.isValidObjectId(claims.sub)) return null;
  await connectDb();
  const [session, u] = await Promise.all([AdminSession.findById(String(claims.sid)).lean(), User.findById(claims.sub).lean()]);
  if (!session || String(session.userId) !== claims.sub || session.expiresAt.getTime() <= Date.now()) return null;
  if (!u || !u.active) return null;
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_MS) void AdminSession.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } }).catch(() => {});
  const volunteer = u.role === "volunteer";
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    role: u.role,
    responsibility: volunteer ? (u.responsibility ?? "") : "",
    permissions: volunteer ? normalizePermissions(u.permissions) : [],
    sessionId: session._id,
  };
}

/** Start a session for an account that has just signed in, and return its token for the cookie. */
export async function startSession(u: { _id: unknown; email: string; name: string; role: Role }, req: NextRequest): Promise<string> {
  const sid = randomBytes(32).toString("base64url");
  const userId = String(u._id);
  await AdminSession.create({ _id: sid, userId, userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) });
  const old = await AdminSession.find({ userId }, { _id: 1 }).sort({ createdAt: -1 }).skip(MAX_SESSIONS).lean();
  if (old.length) await AdminSession.deleteMany({ _id: { $in: old.map((s) => s._id) } });
  return signSession({ sub: userId, sid, email: u.email, name: u.name, role: u.role });
}

/** Sign an account out everywhere (or everywhere but one session): after a password change, or when it is disabled or deleted. */
export async function endSessions(userId: string, except?: string) {
  await connectDb();
  await AdminSession.deleteMany({ userId, ...(except ? { _id: { $ne: except } } : {}) });
}

/** Whether a change to an account must sign it out everywhere. */
export const signsOut = (update: Partial<Pick<UserDoc, "passwordHash" | "active">>) => Boolean(update.passwordHash) || update.active === false;

interface Access {
  /** Administrators only. */
  role?: "admin";
  /** Also let in volunteers who hold this permission (or one of these). */
  permission?: Permission | readonly Permission[];
  /** Let in every signed-in user, volunteers included. */
  everyone?: boolean;
}

/**
 * Guard for admin API routes. Returns the user, or a Response to send back.
 * Administrators and editors pass unless the route is `role: "admin"`;
 * volunteers are refused unless the route lets them in.
 * Mutations must come from the same origin (CSRF defence on top of SameSite).
 */
export async function requireAdmin(req: NextRequest, opts: Access = {}): Promise<AdminUser | Response> {
  if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  let user: AdminUser | null;
  try {
    user = await getAdmin(req);
  } catch {
    return error(503, "The database is unavailable. Please try again shortly.");
  }
  if (!user) return error(401, "Your session has expired. Please sign in again.");
  if (opts.role === "admin" && user.role !== "admin") return error(403, "Only administrators can do this.");
  if (user.role === "volunteer" && !opts.everyone) {
    const allowed = typeof opts.permission === "string" ? [opts.permission] : (opts.permission ?? []);
    if (!allowed.some((p) => user.permissions.includes(p))) return error(403, "Your volunteer account doesn't have permission to do this. Ask an administrator.");
  }
  return user;
}

export function sessionCookie(token: string) {
  return {
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    sameSite: "lax" as const,
    path: BASE_PATH || "/",
    maxAge: SESSION_DAYS * 86_400,
  };
}

export function clearedSessionCookie() {
  return { ...sessionCookie(""), maxAge: 0 };
}

