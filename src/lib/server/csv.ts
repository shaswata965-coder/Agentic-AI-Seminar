import "server-only";
import { isoToLocalInput } from "@/lib/format";

/** RFC 4180 CSV with a UTF-8 BOM so Excel opens it correctly. Dates are written in IST. Guards against formula injection. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : v instanceof Date ? isoToLocalInput(v.toISOString()).replace("T", " ") : Array.isArray(v) ? v.join("; ") : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
