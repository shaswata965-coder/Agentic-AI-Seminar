import bcrypt from "bcryptjs";
/*
 * Password hashing, shared by the admin API and scripts/create-admin.ts.
 * Passwords are stored only as bcrypt hashes (cost 12, salted), never in plain text.
 */
export { PASSWORD_MAX_BYTES, PASSWORD_MIN, passwordBytes, passwordProblem } from "./password-rules";

const COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

// Compared against when an account doesn't exist, so a sign-in takes as long whether or not it does.
let dummy: Promise<string> | null = null;

/**
 * Check a password against a stored hash; with no hash, spend the same time
 * and fail. (Accounts from before the 72-byte rule may have longer passwords:
 * bcrypt compares their first 72 bytes, as it did when they were set.)
 */
export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) {
    await bcrypt.compare(password, await (dummy ??= bcrypt.hash("timing-equaliser", COST)));
    return false;
  }
  return bcrypt.compare(password, hash);
}
