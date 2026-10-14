import "server-only";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, SESSION_DAYS, verifySession } from "@/lib/auth-token";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { BASE_PATH } from "@/lib/paths";
import { isPermission, type Permission, type Role } from "@/lib/permissions";
import { error, isSameOrigin } from "./http";

export { hashPassword, PASSWORD_MIN, verifyPassword } from "@/lib/password";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Volunteers only (empty for everyone else). */
  responsibility: string;
  permissions: Permission[];
}

/** The signed-in admin for this request (re-checked against the database). */
export async function getAdmin(req: NextRequest): Promise<AdminUser | null> {
  const claims = await verifySession(req.cookies.get(AUTH_COOKIE)?.value);
  if (!claims) return null;
  await connectDb();
  const u = await User.findById(claims.sub).lean();
  if (!u || !u.active) return null;
  const volunteer = u.role === "volunteer";
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    role: u.role,
    responsibility: volunteer ? (u.responsibility ?? "") : "",
    permissions: volunteer ? (u.permissions ?? []).filter(isPermission) : [],
  };
}

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

