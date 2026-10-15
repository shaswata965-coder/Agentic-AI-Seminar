/*
 * Messages between Admin → Site settings and the page shown in its preview
 * frame (components/layout/PreviewBridge.tsx). Both sides are the same origin.
 */

export const PREVIEW_SOURCE = "aaiw-preview";

/** A layout problem found by measuring the previewed section. */
export interface LayoutIssue {
  kind: "lines" | "spill" | "cut" | "page" | "grown" | "shrunk" | "empty";
  message: string;
}

export type ToFrame = { source: typeof PREVIEW_SOURCE; type: "refresh" | "focus"; anchor: string | null };

export type FromFrame =
  | { source: typeof PREVIEW_SOURCE; type: "ready"; path: string }
  | { source: typeof PREVIEW_SOURCE; type: "report"; anchor: string | null; found: boolean; height: number; width: number; issues: LayoutIssue[] };

export const isPreviewMessage = (data: unknown): data is { source: string; type: string } =>
  typeof data === "object" && data !== null && (data as { source?: unknown }).source === PREVIEW_SOURCE;
