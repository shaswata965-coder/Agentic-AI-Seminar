"use client";

/* eslint-disable @next/next/no-img-element -- admin previews */
import { FileText, ImagePlus, Library, Loader, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";
import { api, ApiError, formatBytes, useApi } from "./api";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  uploadedAt: string;
}

export async function uploadFile(file: File, alt = ""): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", file);
  if (alt) fd.append("alt", alt);
  return api<MediaItem>("/media", { method: "POST", body: fd });
}

const isImage = (url: string, type?: string) => (type ? type.startsWith("image/") : /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url) || url.startsWith("/api/media/"));

export function MediaLibraryPicker({ open, onClose, onPick, accept }: { open: boolean; onClose: () => void; onPick: (m: MediaItem) => void; accept?: string }) {
  const { data, loading, error } = useApi<MediaItem[]>(open ? "/media" : null);
  const wantPdf = accept?.includes("pdf") && !accept.includes("image");
  const items = (data ?? []).filter((m) => (wantPdf ? m.contentType === "application/pdf" : accept?.startsWith("image") ? m.contentType.startsWith("image/") : true));
  return (
    <Modal open={open} onClose={onClose} labelledBy="media-picker-title" size="xl">
      <div className="p-6">
        <h2 id="media-picker-title" className="font-display text-2xl font-bold text-fg">
          Media library
        </h2>
        <p className="mt-1 text-sm text-muted">Pick a previously uploaded file.</p>
        {loading ? <p className="mt-6 text-muted">Loading…</p> : null}
        {error ? <p className="mt-6 text-blush-ink">{error}</p> : null}
        {!loading && !items.length ? <p className="mt-6 text-muted">Nothing uploaded yet.</p> : null}
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(m);
                  onClose();
                }}
                className="group block w-full overflow-hidden rounded-2xl border border-border bg-surface-2 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
              >
                <span className="grid aspect-square place-items-center bg-[repeating-conic-gradient(var(--surface-2)_0_25%,var(--surface)_0_50%)] bg-[length:16px_16px]">
                  {m.contentType.startsWith("image/") ? (
                    <img src={withBase(m.url)} alt={m.alt || m.filename} className="max-h-full max-w-full object-contain" loading="lazy" />
                  ) : (
                    <FileText size={32} className="text-subtle" aria-hidden />
                  )}
                </span>
                <span className="block truncate px-2.5 py-2 text-xs font-medium text-muted">{m.filename}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

/** Image / file field: upload (auto-compressed), choose from the library or paste a link. */
export function MediaPicker({ value, onChange, accept = "image/*", id, invalid }: { value: string; onChange: (v: string) => void; accept?: string; id?: string; invalid?: boolean }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [meta, setMeta] = useState<{ size: number; type: string } | null>(null);

  async function onFile(file?: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const m = await uploadFile(file);
      onChange(m.url);
      setMeta({ size: m.size, type: m.contentType });
      toast(`Uploaded ${m.filename} (${formatBytes(m.size)})`, "success");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div
      className={cn("rounded-2xl border border-dashed p-3 transition", invalid ? "border-blush-ink" : "border-border-strong")}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[repeating-conic-gradient(var(--surface-2)_0_25%,var(--surface)_0_50%)] bg-[length:14px_14px] ring-1 ring-border">
          {value ? isImage(value, meta?.type) ? <img src={withBase(value)} alt="" className="max-h-full max-w-full object-contain" /> : <FileText size={28} className="text-subtle" aria-hidden /> : <ImagePlus size={26} className="text-subtle" aria-hidden />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} disabled={busy} data-ripple="" className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-brand-fg hover:-translate-y-0.5 hover:bg-brand-strong disabled:opacity-60">
              {busy ? <Loader size={15} className="animate-spin" aria-hidden /> : <ImagePlus size={15} aria-hidden />} {busy ? "Uploading…" : "Upload"}
            </button>
            <button type="button" onClick={() => setLibraryOpen(true)} data-ripple="" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-fg hover:-translate-y-0.5 hover:border-brand">
              <Library size={15} aria-hidden /> Library
            </button>
            {value ? (
              <button type="button" onClick={() => onChange("")} data-ripple="" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-blush-ink hover:bg-blush-soft">
                <Trash size={15} aria-hidden /> Remove
              </button>
            ) : null}
          </div>
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="…or paste a link (https://)"
            className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none"
          />
          {meta ? <p className="text-xs text-subtle">Optimised to {meta.type.replace("image/", "").toUpperCase()} · {formatBytes(meta.size)}</p> : null}
        </div>
      </div>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-hidden tabIndex={-1} />
      <MediaLibraryPicker open={libraryOpen} onClose={() => setLibraryOpen(false)} onPick={(m) => onChange(m.url)} accept={accept} />
    </div>
  );
}
