import type { NextRequest } from "next/server";
import { z } from "zod";
import { authSecret, signSession } from "@/lib/auth-token";
import { connectDb, isDuplicateKeyError } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword, PASSWORD_MIN, sessionCookie, verifyPassword } from "@/lib/server/admin-auth";
import { clientIp, error, isSameOrigin, json, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().max(200), password: z.string().max(200) });

/**
 * Sign in. On a fresh install (no users yet) the first sign-in with
 * ADMIN_EMAIL / ADMIN_PASSWORD from the environment creates the admin account.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  if (!authSecret()) return error(500, "Server misconfigured: set AUTH_SECRET (at least 32 characters).");
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000).ok) return error(429, "Too many sign-in attempts. Please wait 15 minutes.");

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Enter your e-mail and password.");
  const { email, password } = parsed.data;
  if (!rateLimit(`login-user:${email}`, 8, 15 * 60_000).ok) return error(429, "Too many sign-in attempts for this account. Please wait 15 minutes.");

  try {
    await connectDb();
  } catch {
    return error(503, "The database is unavailable. Check MONGODB_URI and try again.");
  }

  let user = await User.findOne({ email });
  if (!user && (await User.estimatedDocumentCount()) === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD ?? "";
    if (envEmail && envPass.length >= PASSWORD_MIN && email === envEmail && password === envPass) {
      try {
        user = await User.create({ email, name: "Administrator", passwordHash: await hashPassword(password), role: "admin" });
      } catch (err) {
        if (!isDuplicateKeyError(err)) throw err;
        user = await User.findOne({ email });
      }
    }
  }

  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return error(401, "Incorrect e-mail or password.");
  }
  user.lastLoginAt = new Date();
  await user.save();
  const token = await signSession({ sub: String(user._id), email: user.email, name: user.name, role: user.role });
  const res = json({ data: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
  res.cookies.set(sessionCookie(token));
  return res;
}
