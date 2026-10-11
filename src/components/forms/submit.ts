import { withBase } from "@/lib/paths";

export interface SubmitResult<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/** POST JSON to one of the site's API routes and normalise the response. */
export async function postJson<T = unknown>(path: string, body: unknown): Promise<SubmitResult<T>> {
  try {
    const res = await fetch(withBase(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: T; message?: string; error?: string; fieldErrors?: Record<string, string> };
    if (!res.ok) return { ok: false, message: json.error || json.message || "Something went wrong. Please try again.", fieldErrors: json.fieldErrors };
    return { ok: true, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: "Network error — please check your connection and try again." };
  }
}

export function formToObject(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    if (typeof v === "string") out[k] = v;
  });
  return out;
}
