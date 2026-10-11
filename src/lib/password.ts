import bcrypt from "bcryptjs";

/** Password rules and hashing, shared by the admin API and scripts/create-admin.ts. */
export const PASSWORD_MIN = 10;
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
