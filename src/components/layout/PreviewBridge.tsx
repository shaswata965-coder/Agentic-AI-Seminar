"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { isPreviewMessage, PREVIEW_SOURCE, type FromFrame, type LayoutIssue, type ToFrame } from "@/lib/preview";

/*
 * Active only when a page is shown in the live preview of Admin → Site
 * settings (framed by the same origin). It re-renders the page when the editor
 * changes something, scrolls to and outlines the section being edited, and
 * measures that section to warn about text that breaks the layout.
 */

// First height of each section at each width, to tell when text makes it much taller or shorter.
const baseline = new Map<string, number>();

const snip = (t: string) => (t.length > 48 ? `${t.slice(0, 47)}…` : t);
const ownText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());

function findSection(anchor: string | null) {
  return anchor ? document.querySelector<HTMLElement>(`[data-edit="${CSS.escape(anchor)}"]`) : null;
}

function measure(anchor: string | null): Extract<FromFrame, { type: "report" }> {
  const issues: LayoutIssue[] = [];
  const sideways = document.documentElement.scrollWidth - window.innerWidth;
  if (sideways > 1) issues.push({ kind: "page", message: `The page now scrolls sideways by ${sideways}px: something is wider than the screen.` });
  const el = findSection(anchor);
  let height = 0;
  if (el) {
    height = Math.round(el.getBoundingClientRect().height);
    for (const h of el.querySelectorAll<HTMLElement>("h1, h2, h3")) {
      if (h.closest(".sr-only")) continue;
      const text = h.textContent?.trim() ?? "";
      if (!text) {
        issues.push({ kind: "empty", message: "A heading in this section is empty, leaving a gap." });
        continue;
      }
      const cs = getComputedStyle(h);
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const lines = Math.round(h.getBoundingClientRect().height / lineHeight);
      if (lines > 3) issues.push({ kind: "lines", message: `“${snip(text)}” runs onto ${lines} lines.` });
    }
    for (const node of el.querySelectorAll<HTMLElement>("*")) {
      if (!ownText(node) || node.closest(".sr-only, [aria-hidden='true'], svg")) continue;
      const box = node.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) continue;
      const cs = getComputedStyle(node);
      const text = snip(node.textContent?.trim() ?? "");
      if (node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1 && cs.overflowX !== "auto" && cs.overflowX !== "scroll") {
        issues.push(
          cs.overflowX === "visible"
            ? { kind: "spill", message: `“${text}” is wider than its box and spills out.` }
            : { kind: "cut", message: `“${text}” is cut off at the side.` },
        );
      } else if (cs.webkitLineClamp !== "none" && cs.webkitLineClamp !== "" && node.scrollHeight > node.clientHeight + 2) {
        issues.push({ kind: "cut", message: `“${text}” is cut off after ${cs.webkitLineClamp} lines.` });
      }
      const card = node.parentElement?.closest<HTMLElement>(".card");
      if (card && card !== node) {
        const c = card.getBoundingClientRect();
        if (box.right > c.right + 1 || box.left < c.left - 1) issues.push({ kind: "spill", message: `“${text}” sticks out of its card.` });
      }
    }
    const key = `${anchor}@${window.innerWidth}`;
    const base = baseline.get(key);
    if (base === undefined) baseline.set(key, height);
    else if (height > base * 1.5 && height - base > 120) issues.push({ kind: "grown", message: `The section is ${Math.round((height / base - 1) * 100)}% taller than with the text it had when you opened it.` });
    else if (height < base * 0.6 && base - height > 120) issues.push({ kind: "shrunk", message: `The section is ${Math.round((1 - height / base) * 100)}% shorter than before: it may look empty.` });
  }
  const seen = new Set<string>();
  return {
    source: PREVIEW_SOURCE,
    type: "report",
    anchor,
    found: Boolean(el),
    height,
    width: window.innerWidth,
    issues: issues.filter((i) => !seen.has(i.message) && seen.add(i.message)).slice(0, 12),
  };
}

function focus(anchor: string | null, scroll: boolean) {
  document.querySelectorAll("[data-edit-focus]").forEach((n) => n.removeAttribute("data-edit-focus"));
  const el = findSection(anchor);
  if (!el) return;
  el.setAttribute("data-edit-focus", "");
  if (scroll) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 80), behavior: "instant" });
}

export function PreviewBridge() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const anchor = useRef<string | null>(null);
  const refreshing = useRef(false);

  useEffect(() => {
    if (window.parent === window) return;
    const post = (msg: FromFrame) => window.parent.postMessage(msg, window.location.origin);
    const report = () => requestAnimationFrame(() => requestAnimationFrame(() => post(measure(anchor.current))));
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent || !isPreviewMessage(e.data)) return;
      const msg = e.data as unknown as ToFrame;
      anchor.current = msg.anchor;
      if (msg.type === "refresh") {
        refreshing.current = true;
        startTransition(() => router.refresh());
      } else if (msg.type === "focus") {
        focus(anchor.current, true);
        report();
      }
    };
    // Links would leave the page being edited.
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a[href]")) e.preventDefault();
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    document.documentElement.setAttribute("data-preview", "");
    post({ source: PREVIEW_SOURCE, type: "ready", path: window.location.pathname });
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  // Once a refresh has rendered, outline the section again and measure it.
  useEffect(() => {
    if (pending || !refreshing.current || window.parent === window) return;
    refreshing.current = false;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        focus(anchor.current, false);
        window.parent.postMessage(measure(anchor.current), window.location.origin);
      }),
    );
  }, [pending]);

  return null;
}
