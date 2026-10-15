/* Password rules, shared by the admin forms (client) and the API (src/lib/password.ts). */

export const PASSWORD_MIN = 10;
/** bcrypt reads only the first 72 bytes of a password, so longer ones are refused rather than silently cut. */
export const PASSWORD_MAX_BYTES = 72;

export const passwordBytes = (password: string) => new TextEncoder().encode(password).length;

/** Why a new password isn't acceptable, or null. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (passwordBytes(password) > PASSWORD_MAX_BYTES) return `Use at most ${PASSWORD_MAX_BYTES} characters (fewer with accented letters or emoji).`;
  if (new Set(password).size < 4) return "Use a less repetitive password.";
  return null;
}
