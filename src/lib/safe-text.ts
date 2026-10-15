/*
 * Cleaning for text typed into any form, and the rule for links, shared by
 * the public forms' and the admin's validation (client- and server-safe).
 */

// C0 and C1 control characters other than tab and line breaks, DEL, and the
// invisible bidirectional overrides that can make text display differently
// from what it is ("Trojan Source"). Joiners used by Indic scripts are kept.
const CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069\ufeff]/g;

/** Multi-line text: control characters removed, line breaks normalised. */
export const cleanText = (s: string) => s.replace(CONTROLS, "").replace(/\r\n?/g, "\n");

/** Single-line text (names, titles, e-mail addresses): line breaks and tabs become spaces, so nothing can start a new e-mail header or CSV row. */
export const cleanLine = (s: string) => s.replace(CONTROLS, "").replace(/[\t\r\n\u2028\u2029]+/g, " ");

/** A link the site may show: https://, http://, mailto:, tel:, or a path on this site (not //other-host). */
export const SAFE_LINK = /^(https?:\/\/[^\s/]|mailto:[^\s]|tel:[+\d(]|\/(?![/\\]))/i;

/**
 * Whether a link that is still being typed is harmless: it may be unfinished,
 * but if it has a scheme, the scheme must be http(s), mailto or tel. Browsers
 * ignore tabs, line breaks and leading spaces when reading a scheme, so this
 * does too ("java\nscript:" is javascript:).
 */
export function harmlessLink(v: string): boolean {
  const s = v.replace(/[\t\n\r]/g, "").replace(/^[\u0000- ]+/, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(s)?.[1]?.toLowerCase();
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme)) return false;
  return !/^[/\\]{2}/.test(s) && !/^\/\\/.test(s);
}
