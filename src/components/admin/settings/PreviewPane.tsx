"use client";

import { ExternalLink, Loader, Monitor, RotateCw, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";
import { isPreviewMessage, PREVIEW_SOURCE, type FromFrame, type ToFrame } from "@/lib/preview";

export type Report = Extract<FromFrame, { type: "report" }>;

const WIDTH = { desktop: 1280, phone: 390 } as const;

/**
 * The real page of the site in a frame, with the unsaved draft (Draft Mode).
 * `revision` changes whenever a new draft has been stored, and the page then
 * re-renders in place; `anchor` is the section being edited.
 */
export function PreviewPane({ path, anchor, revision, syncing, onReport }: { path: string; anchor: string | null; revision: number; syncing: boolean; onReport: (r: Report) => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<keyof typeof WIDTH>("desktop");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const anchorRef = useRef(anchor);
  const revisionRef = useRef(revision);

  const send = useCallback((type: ToFrame["type"]) => {
    frame.current?.contentWindow?.postMessage({ source: PREVIEW_SOURCE, type, anchor: anchorRef.current } satisfies ToFrame, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || !isPreviewMessage(e.data)) return;
      const msg = e.data as unknown as FromFrame;
      if (msg.type === "ready") {
        setLoading(false);
        send("focus");
        // A change stored while the page was loading may have missed it: render again with the latest draft.
        if (revisionRef.current) send("refresh");
      } else if (msg.type === "report") onReport(msg);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send, onReport]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A new section: scroll to it. A new draft: re-render the page.
  useEffect(() => {
    anchorRef.current = anchor;
    send("focus");
  }, [anchor, send]);
  useEffect(() => {
    revisionRef.current = revision;
    if (revision) send("refresh");
  }, [revision, send]);

  const width = WIDTH[device];
  const scale = size.w ? Math.min(1, size.w / width) : 1;
  const src = withBase(`/api/admin/preview?path=${encodeURIComponent(path)}`);

  return (
    <div className="card flex h-full min-h-[28rem] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div role="radiogroup" aria-label="Preview size" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {(
            [
              ["desktop", "Desktop", Monitor],
              ["phone", "Phone", Smartphone],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={device === key}
              onClick={() => setDevice(key)}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold", device === key ? "bg-brand text-brand-fg" : "text-muted hover:text-fg")}
            >
              <Icon size={14} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-subtle" title={path}>
          {path}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-subtle" aria-live="polite">
          {syncing || loading ? (
            <>
              <Loader size={13} aria-hidden className="animate-spin" /> Updating…
            </>
          ) : (
            "Live preview"
          )}
        </span>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setReload((n) => n + 1);
          }}
          className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg"
          aria-label="Reload preview"
          title="Reload preview"
        >
          <RotateCw size={15} aria-hidden />
        </button>
        <a href={src} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg" aria-label="Open the preview in a new tab" title="Open the preview in a new tab">
          <ExternalLink size={15} aria-hidden />
        </a>
      </div>
      <div ref={box} className="relative min-h-0 flex-1 overflow-hidden bg-[repeating-conic-gradient(var(--surface-2)_0_25%,var(--surface)_0_50%)] bg-[length:18px_18px]">
        {size.w ? (
          <iframe
            key={`${src}#${reload}`}
            ref={frame}
            src={src}
            title={`Preview of ${path}`}
            onLoad={() => setLoading(false)}
            className="absolute top-0 border-0 bg-bg shadow-card"
            style={{
              width,
              height: size.h / scale,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              left: Math.max(0, (size.w - width * scale) / 2),
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
