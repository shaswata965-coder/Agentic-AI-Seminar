"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails */
import { Copy, FileText, Trash, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { absoluteUrl, withBase } from "@/lib/paths";
import { can } from "@/lib/permissions";
import { PageTitle, useMe } from "./AdminShell";
import { api, ApiError, formatBytes, useApi } from "./api";
import { uploadFile, type MediaItem } from "./MediaPicker";

export function MediaLibrary() {
  const toast = useToast();
  const canDelete = can(useMe(), "delete");
  const { data, loading, reload } = useApi<MediaItem[]>("/media");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      try {
        const m = await uploadFile(f);
        toast(`Uploaded ${m.filename}`, "success");
      } catch (e) {
        toast(e instanceof ApiError ? `${f.name}: ${e.message}` : `${f.name}: upload failed`, "error");
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    reload();
  }

  async function remove(m: MediaItem) {
    if (!window.confirm(`Delete ${m.filename}? Pages using it will show a broken image.`)) return;
    await api(`/media/${m.id}`, { method: "DELETE" }).then(reload, (e: Error) => toast(e.message, "error"));
  }

  return (
    <div>
      <PageTitle
        title="Media library"
        description="Logos, photos and PDFs. Images are resized and compressed automatically on upload."
        actions={
          <Button onClick={() => input.current?.click()} disabled={busy} icon={<Upload size={17} aria-hidden />}>
            {busy ? "Uploading…" : "Upload files"}
          </Button>
        }
      />
      <input ref={input} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
      <div
        className="card mb-6 grid place-items-center border-2 border-dashed border-border-strong p-8 text-center text-sm text-muted"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        Drag & drop files here, or use “Upload files”. Max {8} MB each.
      </div>
      {loading ? <p className="text-muted">Loading…</p> : null}
      {data && !data.length ? <p className="text-muted">Nothing uploaded yet.</p> : null}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(data ?? []).map((m) => (
          <li key={m.id} className="card overflow-hidden">
            <div className="grid aspect-square place-items-center bg-[repeating-conic-gradient(var(--surface-2)_0_25%,var(--surface)_0_50%)] bg-[length:16px_16px]">
              {m.contentType.startsWith("image/") ? <img src={withBase(m.url)} alt={m.alt || m.filename} className="max-h-full max-w-full object-contain" loading="lazy" /> : <FileText size={36} className="text-subtle" aria-hidden />}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-fg" title={m.filename}>
                {m.filename}
              </p>
              <p className="text-xs text-subtle">
                {formatBytes(m.size)}
                {m.width ? ` · ${m.width}×${m.height}` : ""}
              </p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(absoluteUrl(m.url)).then(() => toast("Link copied", "success"))}
                  data-ripple=""
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-muted hover:text-fg"
                >
                  <Copy size={13} aria-hidden /> Copy link
                </button>
                {canDelete ? (
                  <button type="button" onClick={() => remove(m)} data-ripple="" className="grid w-9 place-items-center rounded-lg border border-border text-subtle hover:border-blush-ink hover:text-blush-ink" aria-label={`Delete ${m.filename}`}>
                    <Trash size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
