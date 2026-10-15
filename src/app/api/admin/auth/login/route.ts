import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authSecret } from "@/lib/auth-token";
import { connectDb, isDuplicateKeyError } from "@/lib/db";
import { User } from "@/lib/models";
import { passwordProblem } from "@/lib/password";
import { hashPassword, sessionCookie, startSession, verifyPassword } from "@/lib/server/admin-auth";
import { clientIp, error, isSameOrigin, json, readJson } from "@/lib/server/http";
import { clearHits, hit, isLimited, rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().min(3).max(254), password: z.string().min(1).max(200) });

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const WINDOW = 15 * 60_000;
const FAILED = "Incorrect e-mail or password.";
// Failed sign-ins allowed in the window: from one address (to any account and to one account), and to
// one account from everywhere together.
const FAILS_PER_ADDRESS = 10;
const FAILS_PER_ACCOUNT_AND_ADDRESS = 8;
const FAILS_PER_ACCOUNT = 100;

/**
 * Sign in. On a fresh install (no users yet) the first sign-in with
 * ADMIN_EMAIL / ADMIN_PASSWORD from the environment creates the admin account.
 * Wrong e-mails, wrong passwords and disabled accounts get the same answer in
 * the same time, so sign-in can't be used to find out who has an account.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  if (!authSecret()) return error(500, "Server misconfigured: set AUTH_SECRET (at least 32 characters).");
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 30, WINDOW).ok || isLimited(`login-fail:${ip}`, FAILS_PER_ADDRESS, WINDOW).limited) return error(429, "Too many sign-in attempts. Please wait 15 minutes.");

  const parsed = schema.safeParse(await readJson(req, 4096));
  if (!parsed.success) return error(400, "Enter your e-mail and password.");
  const { email, password } = parsed.data;
  // Only failed attempts count against an account, so signing in normally never locks it; the
  // per-account total slows guessing spread over many addresses.
  const fromHere = `login-fail:${email}:${ip}`;
  const anywhere = `login-fail:${email}`;
  if (isLimited(fromHere, FAILS_PER_ACCOUNT_AND_ADDRESS, WINDOW).limited || isLimited(anywhere, FAILS_PER_ACCOUNT, WINDOW).limited) {
    return error(429, "Too many sign-in attempts for this account. Please wait 15 minutes.");
  }

  try {
    await connectDb();
  } catch {
    return error(503, "The database is unavailable. Please try again shortly.");
  }

  let user = await User.findOne({ email });
  if (!user && (await User.estimatedDocumentCount()) === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD ?? "";
    if (envEmail && !passwordProblem(envPass) && email === envEmail && sameSecret(password, envPass)) {
      try {
        user = await User.create({ email, name: "Administrator", passwordHash: await hashPassword(password), role: "admin" });
      } catch (err) {
        if (!isDuplicateKeyError(err)) throw err;
        user = await User.findOne({ email });
      }
    }
  }

  // The password is checked even for a missing or disabled account, so every failure takes as long.
  const ok = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok || !user.active) {
    hit(`login-fail:${ip}`, WINDOW);
    hit(fromHere, WINDOW);
    hit(anywhere, WINDOW);
    return error(401, FAILED);
  }
  clearHits(fromHere);
  user.lastLoginAt = new Date();
  await user.save();
  const token = await startSession(user, req);
  const res = json({ data: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
  res.cookies.set(sessionCookie(token));
  return res;
}
