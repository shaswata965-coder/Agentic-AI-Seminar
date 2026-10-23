import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { PEOPLE_GROUP_META, type PeopleGroup } from "@/lib/content/constants";
import { connectDb } from "@/lib/db";
import { getCollectionModel, HackathonRegistration, Registration, User, VisitorSession } from "@/lib/models";
import { verifyPassword } from "@/lib/password";
import { BASE_PATH } from "@/lib/paths";

/*
 * Signing in on the public site, to keep an agenda. There is no separate sign-up: anyone the event already
 * knows signs in with their e-mail and what they were given:
 *  - an admin panel account (administrators, editors, volunteers): its password;
 *  - a workshop registration: its registration ID;
 *  - a hackathon team (any member's e-mail): the team's registration ID;
 *  - a person under Organisers & volunteers (mentors, judges…): the sign-in e-mail and code set there.
 * This is separate from the admin panel's own sign-in (admin-auth.ts), which it never grants.
 */

export const VISITOR_COOKIE = "aaiw_visitor";
const SESSION_DAYS = 30;
/** People's sign-in codes shorter than this are not accepted. */
export const MIN_CODE = 8;

export interface Visitor {
  email: string;
  name: string;
  kind: string;
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

const sameText = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Who an e-mail and a password, registration ID or sign-in code belong to, or null. */
export async function identify(email: string, code: string): Promise<Visitor | null> {
  await connectDb();
  const id = code.trim().toUpperCase();
  const [user, registration, team, person] = await Promise.all([
    User.findOne({ email }).lean(),
    Registration.findOne({ email, status: { $ne: "cancelled" } }).lean(),
    HackathonRegistration.findOne({ "members.email": email, status: { $ne: "withdrawn" } }).lean(),
    getCollectionModel("people").findOne({ loginEmail: { $regex: `^${escapeRegex(email)}$`, $options: "i" } }).lean(),
  ]);
  // The password is checked even without an account, so a wrong e-mail takes as long as a wrong password.
  const passwordOk = await verifyPassword(code, user?.passwordHash);
  if (user?.active && passwordOk) return { email, name: user.name || email, kind: "team" };
  if (registration && sameText(registration.regId.toUpperCase(), id)) return { email, name: registration.name, kind: "workshop" };
  if (team && sameText(team.regId.toUpperCase(), id)) {
    const member = team.members.find((m) => m.email === email);
    return { email, name: member?.name || team.teamName, kind: "hackathon" };
  }
  const personCode = typeof person?.loginCode === "string" ? person.loginCode.trim() : "";
  if (person && personCode.length >= MIN_CODE && sameText(personCode, code.trim())) {
    const group = String(person.group) as PeopleGroup;
    return { email, name: String(person.name || email), kind: PEOPLE_GROUP_META[group] ? group : "team" };
  }
  return null;
}

/** Start a session for a visitor; returns the cookie to set. */
export async function startVisitorSession(v: Visitor) {
  const token = randomBytes(32).toString("base64url");
  await VisitorSession.create({ _id: sha256(token), ...v, expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) });
  return visitorCookie(token);
}

/** The visitor signed in on this request, or null. */
export async function getVisitor(req: NextRequest): Promise<(Visitor & { sessionId: string }) | null> {
  const token = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  await connectDb();
  const s = await VisitorSession.findById(sha256(token)).lean();
  if (!s || s.expiresAt.getTime() <= Date.now()) return null;
  return { email: s.email, name: s.name, kind: s.kind, sessionId: s._id };
}

export async function endVisitorSession(sessionId: string) {
  await connectDb();
  await VisitorSession.deleteOne({ _id: sessionId });
}

export function visitorCookie(token: string) {
  return {
    name: VISITOR_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    sameSite: "lax" as const,
    path: BASE_PATH || "/",
    maxAge: SESSION_DAYS * 86_400,
  };
}

export const clearedVisitorCookie = () => ({ ...visitorCookie(""), maxAge: 0 });
