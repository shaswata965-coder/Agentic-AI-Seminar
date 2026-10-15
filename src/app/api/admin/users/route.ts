import type { NextRequest } from "next/server";
import { z } from "zod";
import { isDuplicateKeyError } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword, newPassword, requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";

const create = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid e-mail address."),
  name: z.string().trim().max(120).default(""),
  role: z.enum(["admin", "editor"]).default("editor"),
  password: newPassword,
});

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const users = await User.find({ role: { $ne: "volunteer" } }, { passwordHash: 0 }).sort({ createdAt: 1 }).lean();
  return json({ data: users.map((u) => ({ id: String(u._id), email: u.email, name: u.name, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt })) });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const parsed = create.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  try {
    const u = await User.create({ ...parsed.data, passwordHash: await hashPassword(parsed.data.password) });
    return json({ data: { id: String(u._id), email: u.email, name: u.name, role: u.role, active: u.active } }, { status: 201 });
  } catch (err) {
    if (isDuplicateKeyError(err)) return error(409, "A user with this e-mail already exists.", { fieldErrors: { email: "Already exists" } });
    throw err;
  }
}
