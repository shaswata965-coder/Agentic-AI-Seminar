"use client";

import { useCallback, useEffect, useState } from "react";
import { withBase } from "@/lib/paths";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Call an admin API route (/api/admin/...). Redirects to sign-in when the session has expired. */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(withBase(`/api/admin${path}`), {
    ...rest,
    credentials: "same-origin",
    headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 401 && !path.startsWith("/auth/login")) {
    window.location.href = withBase(`/admin/login?next=${encodeURIComponent(window.location.pathname.replace(/^\/[^/]*(?=\/admin)/, ""))}`);
    throw new ApiError("Signed out", 401);
  }
  const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string; fieldErrors?: Record<string, string> };
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.fieldErrors);
  return body.data as T;
}

/** Load data from an admin endpoint with loading/error state and a reload function. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api<T>(path)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading: loading && data === null, reload, setData };
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
