"use client";

import { ExternalLink, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { withBase } from "@/lib/paths";
import { SINGLETONS } from "@/lib/schema/resources";
import { PageTitle } from "./AdminShell";
import { api, ApiError, useApi } from "./api";
import { RecordForm } from "./RecordForm";

type Values = Record<string, unknown>;

export function SingletonEditor({ kind }: { kind: "settings" | "hackathon" }) {
  const def = SINGLETONS[kind];
  const toast = useToast();
  const router = useRouter();
  const { data, error, loading, setData } = useApi<{ data: Values; updatedAt: string | null }>(`/singleton/${kind}`);
  const [draft, setDraft] = useState<Values | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [tab, setTab] = useState(def.sections[0].key);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const value = draft ?? data?.data ?? null;
  const dirty = draft !== null;
  const updatedAt = savedAt ?? data?.updatedAt ?? null;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const errorTabs = useMemo(() => {
    const keys = Object.keys(errors).map((k) => k.split(".")[0]);
    return new Set(def.sections.filter((s) => s.fields.some((f) => keys.includes(f.name))).map((s) => s.key));
  }, [errors, def.sections]);

  async function save() {
    if (!value) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await api<{ data: Values; updatedAt: string }>(`/singleton/${kind}`, { method: "PUT", json: value });
      setData(res);
      setDraft(null);
      setSavedAt(res.updatedAt);
      router.refresh(); // the admin sidebar and tab titles show the event name too
      toast("Saved. The website now shows your changes.", "success");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors);
        const first = def.sections.find((s) => s.fields.some((f) => Object.keys(e.fieldErrors).some((k) => k.split(".")[0] === f.name)));
        if (first) setTab(first.key);
        toast(e.message, "error");
      } else toast("Could not save.", "error");
    } finally {
      setSaving(false);
    }
  }

  const section = def.sections.find((s) => s.key === tab) ?? def.sections[0];

  return (
    <div className="pb-24">
      <PageTitle
        title={def.label}
        description={def.description}
        actions={
          <a href={withBase(kind === "hackathon" ? "/hackathon" : "/")} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-fg hover:border-brand">
            <ExternalLink size={16} aria-hidden /> View on site
          </a>
        }
      />
      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}
      {error ? <div className="card p-6 text-blush-ink">{error}</div> : null}
      {value ? (
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="Sections" className="lg:sticky lg:top-6 lg:self-start">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {def.sections.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => setTab(s.key)}
                    aria-current={tab === s.key ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold whitespace-nowrap transition",
                      tab === s.key ? "bg-surface text-fg shadow-card ring-1 ring-border" : "text-muted hover:translate-x-0.5 hover:bg-surface/60 hover:text-fg",
                    )}
                  >
                    {s.title}
                    {errorTabs.has(s.key) ? <span className="h-2 w-2 rounded-full bg-blush-ink" aria-label="has errors" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <form
            className="card p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <h2 className="font-display text-2xl font-bold text-fg">{section.title}</h2>
            {section.description ? <p className="mt-1 text-sm text-muted">{section.description}</p> : null}
            <div className="mt-6">
              <RecordForm fields={section.fields} value={value} onChange={(v) => setDraft(v)} errors={errors} />
            </div>
          </form>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-[var(--header-bg)] backdrop-blur-xl lg:left-[17rem]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <p className="text-sm text-muted">{dirty ? <span className="font-semibold text-butter-ink">You have unsaved changes</span> : updatedAt ? `Last saved ${formatDateTime(updatedAt)} IST` : "Defaults, not saved yet"}</p>
          <div className="flex gap-2">
            {dirty ? (
              <Button variant="ghost" onClick={() => { setDraft(null); setErrors({}); }} disabled={saving}>
                Discard
              </Button>
            ) : null}
            <Button onClick={save} disabled={saving || !value} icon={<Save size={17} aria-hidden />}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
