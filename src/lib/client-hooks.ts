"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/*
 * Browser-only values read through useSyncExternalStore: the server (and the
 * hydration pass) sees the fallback, then React re-renders with the real
 * value: no hydration mismatch and no setState-in-effect.
 */

const noopSubscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// A shared 1-second clock. The server snapshot is null so nothing renders a
// server time (no hydration mismatch, no prerender clock access).
let now = 0;
const clockListeners = new Set<() => void>();
let clock: ReturnType<typeof setInterval> | undefined;
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!clock) {
    now = Date.now();
    clock = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(cb);
    if (!clockListeners.size && clock) {
      clearInterval(clock);
      clock = undefined;
    }
  };
}

/** The time now, in milliseconds, ticking every second; null on the server and while hydrating. */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeClock,
    () => {
      if (!now) now = Date.now();
      return now;
    },
    () => null,
  );
}

/** A query-string parameter as it was when the page loaded. */
export function useUrlParam(name: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
export function useUrlHash(): string {
  return useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
}

const LOCAL_EVENT = "aaiw-local-storage";

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(LOCAL_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LOCAL_EVENT, cb);
  };
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** A raw localStorage string plus a setter that notifies every subscriber. */
export function useLocalStorage(key: string): [string | null, (value: string) => void] {
  const value = useSyncExternalStore(subscribeStorage, () => readStorage(key), () => null);
  const set = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {}
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    [key],
  );
  return [value, set];
}

let scrollLocks = 0;

/**
 * Keep the page from scrolling while `active` (a modal dialog is open): marks <html data-scroll-lock>,
 * styled in globals.css. Not done with `html:has(dialog[open])`, which made Chrome restyle the whole
 * page on every element added to it.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    scrollLocks += 1;
    document.documentElement.dataset.scrollLock = "";
    return () => {
      scrollLocks -= 1;
      if (!scrollLocks) delete document.documentElement.dataset.scrollLock;
    };
  }, [active]);
}

/** Replace the current URL's query string without a navigation. */
export function replaceQuery(update: (p: URLSearchParams) => void) {
  const url = new URL(window.location.href);
  update(url.searchParams);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}
