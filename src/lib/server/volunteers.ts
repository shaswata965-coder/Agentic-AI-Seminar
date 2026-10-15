import "server-only";
import { z } from "zod";
import { isPermission, normalizePermissions, type Permission } from "@/lib/permissions";
import { newPassword } from "./admin-auth";

/* Validation for volunteer accounts, shared by /api/admin/volunteers and /api/admin/volunteers/[id]. */

export const volunteerFields = {
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid e-mail address."),
  name: z.string().trim().min(1, "Enter their name.").max(120),
  responsibility: z.string().trim().min(1, "Describe what they are responsible for.").max(500),
  permissions: z
    .array(z.string().refine(isPermission, "Unknown permission."))
    .max(100)
    .transform((list) => [...new Set(list)] as Permission[]),
  password: newPassword,
};

export interface VolunteerRow {
  id: string;
  email: string;
  name: string;
  responsibility: string;
  permissions: string[];
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date | null;
}

export function volunteerRow(u: { _id: unknown; email: string; name: string; responsibility?: string; permissions?: string[]; active: boolean; lastLoginAt: Date | null; createdAt?: Date }): VolunteerRow {
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    responsibility: u.responsibility ?? "",
    permissions: normalizePermissions(u.permissions),
    active: u.active,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt ?? null,
  };
}
