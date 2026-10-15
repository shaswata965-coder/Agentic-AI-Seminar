"use client";

import { CircleCheck, ExternalLink, Info, Save, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/lib/content/types";
import { siteVars } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import { withBase } from "@/lib/paths";
import { settingsPagesFor } from "@/lib/permissions";
import { PAGE_COPY, type CopyField, type CopyKey } from "@/lib/schema/page-copy";
import { SETTINGS_PAGES, type SettingsPage, type SettingsSection } from "@/lib/schema/resources";
import { PageTitle, useMe } from "../AdminShell";
import { api, ApiError, useApi } from "../api";
import { RecordForm } from "../RecordForm";
import { CopyForm, copyIssues } from "./CopyForm";
import { PreviewPane, type Report } from "./PreviewPane";

type Values = Record<string, unknown>;

const labelOf = (key: CopyKey, name: string) => (PAGE_COPY[key] as Record<string, CopyField>)[name]?.label ?? name;

/** The section and page a saved field belongs to ("homeThemes.title", "highlights.0.label"…). */
function sectionOf(key: string): { page: SettingsPage; section: SettingsSection } | null {
  const top = key.split(".")[0];
  for (const page of SETTINGS_PAGES) for (const section of page.sections) if (section.copy === top || section.fields.some((f) => f.name === top)) return { page, section };
  return null;
}

/**
 * Admin → Site settings: a tab per page of the site (plus Site-wide), each
 * page's sections with their texts, colours and settings, and the real page
 * beside them showing unsaved changes as they are typed. Volunteers see only
 * the pages they were given (the API holds them to those too).
 * ?page=<key> opens a page's tab.
 */
export function SettingsStudio() {
  const me = useMe();
  const pages = useMemo(() => settingsPagesFor(me), [me]);
  const asked = useSearchParams().get("page");
  if (!me) return <div className="card p-10 text-center text-muted">Loading…</div>;
  if (!pages.length) return null; // the page gate explains
  const start = pages.find((p) => p.key === asked) ?? pages.find((p) => p.key === "home") ?? pages[0];
  return <Studio key={me.id} pages={pages} start={start} />;
}

function Studio({ pages, start }: { pages: SettingsPage[]; start: SettingsPage }) {
  const toast = useToast();
  const router = useRouter();
  const { data, error, loading, setData } = useApi<{ data: Values; updatedAt: string | null }>("/singleton/settings");
  const [draft, setDraft] = useState<Values | null>(null);
  const [pageKey, setPageKey] = useState(start.key);
  const [sectionKey, setSectionKey] = useState(start.sections[0].key);
  // A link to another page's tab (?page=) while this one is open.
  const [opened, setOpened] = useState(start.key);
  if (opened !== start.key) {
    setOpened(start.key);
    setPageKey(start.key);
    setSectionKey(start.sections[0].key);
  }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const hadDraft = useRef(false);

  const value = draft ?? data?.data ?? null;
  const dirty = draft !== null;
  const page = pages.find((p) => p.key === pageKey) ?? pages[0];
  const section = page.sections.find((s) => s.key === sectionKey) ?? page.sections[0];
  const vars = useMemo(() => (value ? siteVars(value as unknown as SiteSettings) : {}), [value]);

  // Unsaved changes go to the preview a moment after typing stops.
  useEffect(() => {
    if (!draft) return;
    hadDraft.current = true;
    const t = setTimeout(() => {
      api("/preview", { method: "POST", json: draft })
        .then(() => setRevision((r) => r + 1))
        .catch(() => {})
        .finally(() => setSyncing(false));
    }, 450);
    return () => clearTimeout(t);
  }, [draft]);

  // A draft left behind by an editor that closed without cleaning up (a crash, a lost connection)
  // must not show up in this preview: clear it before the preview opens.
  const [previewReady, setPreviewReady] = useState(false);
  useEffect(() => {
    api("/preview", { method: "DELETE" })
      .catch(() => {})
      .finally(() => setPreviewReady(true));
  }, []);

  // Leaving the editor forgets the draft and turns the preview mode off.
  useEffect(() => {
    const leave = () => void fetch(withBase("/api/admin/preview"), { method: "DELETE", keepalive: true, credentials: "same-origin" }).catch(() => {});
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Back to the saved settings in the preview. */
  const clearPreview = useCallback(async () => {
    setSyncing(false); // a change still waiting to be sent is dropped with the draft
    if (!hadDraft.current) return;
    hadDraft.current = false;
    await api("/preview", { method: "DELETE" }).catch(() => {});
    setRevision((r) => r + 1);
  }, []);

  async function save() {
    if (!value) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await api<{ data: Values; updatedAt: string }>("/singleton/settings", { method: "PUT", json: value });
      setData(res);
      setDraft(null);
      await clearPreview();
      router.refresh(); // the admin sidebar shows the event name too
      toast("Saved. The website now shows your changes.", "success");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors);
        const first = Object.keys(e.fieldErrors).map(sectionOf).find(Boolean);
        if (first) {
          setPageKey(first.page.key);
          setSectionKey(first.section.key);
        }
        toast(e.message, "error");
      } else toast("Could not save.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function discard() {
    setDraft(null);
    setErrors({});
    await clearPreview();
  }

  const onReport = useCallback((r: Report) => setReport(r), []);
  const edit = (v: Values) => {
    setDraft(v);
    setSyncing(true);
  };

  // Pages and sections whose texts are likely to break the layout.
  const flagged = useMemo(() => {
    const out = new Set<string>();
    if (!value) return out;
    for (const p of pages)
      for (const s of p.sections)
        if (s.copy && copyIssues(s.copy, value[s.copy] as Record<string, string>, vars).some((x) => x.issue.level === "warn")) {
          out.add(p.key);
          out.add(`${p.key}.${s.key}`);
        }
    return out;
  }, [value, vars, pages]);

  const sectionErrors = (prefix: string) => Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith(`${prefix}.`)).map(([k, v]) => [k.slice(prefix.length + 1), v]));
  const lengthNotes = section.copy && value ? copyIssues(section.copy, value[section.copy] as Record<string, string>, vars).filter((x) => x.issue.level === "warn") : [];
  const domNotes = report && report.anchor === section.anchor ? report.issues : [];
  const missing = report && report.anchor === section.anchor && !report.found;
  const path = section.path ?? page.path;

  return (
    <div className="pb-24">
      <PageTitle
        title="Site settings"
        description="Every page of the site, section by section: its texts, colours and settings, with the page beside them showing your changes as you type. Nothing goes live until you save."
        actions={
          <a href={withBase(path)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-fg hover:border-brand">
            <ExternalLink size={16} aria-hidden /> View on site
          </a>
        }
      />
      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}
      {error ? <div className="card p-6 text-blush-ink">{error}</div> : null}

      {value ? (
        <>
          <nav aria-label="Pages" className="-mx-1 mb-4 overflow-x-auto px-1 pb-1">
            <ul className="flex gap-1.5">
              {pages.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    aria-current={p.key === page.key ? "page" : undefined}
                    onClick={() => {
                      setPageKey(p.key);
                      setSectionKey(p.sections[0].key);
                      setReport(null);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 transition",
                      p.key === page.key ? "bg-brand text-brand-fg ring-brand" : "bg-surface text-muted ring-border hover:text-fg",
                    )}
                  >
                    {p.title}
                    {flagged.has(p.key) ? <span className="h-2 w-2 rounded-full bg-butter-ink" aria-label="has layout warnings" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="min-w-0">
              {page.description ? <p className="mb-3 text-sm text-muted">{page.description}</p> : null}
              <nav aria-label={`Sections of ${page.title}`} className="mb-4">
                <ul className="flex flex-wrap gap-1.5">
                  {page.sections.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        aria-current={s.key === section.key ? "true" : undefined}
                        onClick={() => setSectionKey(s.key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 transition",
                          s.key === section.key ? "bg-surface text-fg shadow-card ring-border-strong" : "text-muted ring-transparent hover:bg-surface/70 hover:text-fg",
                        )}
                      >
                        {s.title}
                        {flagged.has(`${page.key}.${s.key}`) ? <span className="h-2 w-2 rounded-full bg-butter-ink" aria-label="has layout warnings" /> : null}
                        {Object.keys(errors).some((k) => sectionOf(k)?.section === s) ? <span className="h-2 w-2 rounded-full bg-blush-ink" aria-label="has errors" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <section aria-label="Layout check" className="card mb-4 px-5 py-4" data-layout-check="">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg">
                  {lengthNotes.length || domNotes.length ? <TriangleAlert size={17} aria-hidden className="text-butter-ink" /> : <CircleCheck size={17} aria-hidden className="text-mint-ink" />}
                  Layout check
                </h3>
                {missing ? (
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted">
                    <Info size={15} aria-hidden className="mt-0.5 shrink-0" /> This section isn&apos;t on the page right now (for example, it appears once something is added or switched on), so it can&apos;t be measured.
                  </p>
                ) : null}
                {lengthNotes.length || domNotes.length ? (
                  <ul className="mt-2 grid gap-1.5 text-sm">
                    {lengthNotes.map(({ name, issue }) => (
                      <li key={`len-${name}`} className="flex items-start gap-2 text-fg" data-issue="length">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-ink" aria-hidden />
                        <span>
                          <strong>{section.copy ? labelOf(section.copy, name) : name}:</strong> {issue.message}
                        </span>
                      </li>
                    ))}
                    {domNotes.map((n) => (
                      <li key={`dom-${n.message}`} className="flex items-start gap-2 text-fg" data-issue={n.kind}>
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-ink" aria-hidden />
                        <span>
                          <strong>On the page:</strong> {n.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : !missing ? (
                  <p className="mt-2 text-sm text-muted">The texts fit: nothing is too long or too short for this section&apos;s layout{report?.width ? ` at ${report.width}px wide` : ""}.</p>
                ) : null}
              </section>
              <form
                className="card p-5 sm:p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <h2 className="font-display text-xl font-bold text-fg">
                  {page.title} <span className="text-subtle">›</span> {section.title}
                </h2>
                {section.description ? <p className="mt-1 text-sm text-muted">{section.description}</p> : null}

                <div className="mt-5 grid gap-6">
                  {section.copy ? (
                    <CopyForm
                      key={section.copy}
                      copyKey={section.copy}
                      value={(value[section.copy] ?? {}) as Record<string, string>}
                      onChange={(v) => edit({ ...value, [section.copy as string]: v })}
                      errors={sectionErrors(section.copy)}
                      vars={vars}
                    />
                  ) : null}
                  {section.fields.length ? (
                    <div className={cn(section.copy && "border-t border-border pt-6")}>
                      <RecordForm fields={section.fields} value={value} onChange={edit} errors={errors} />
                    </div>
                  ) : null}
                </div>
              </form>

            </div>

            <div className="min-w-0 xl:sticky xl:top-4 xl:h-[calc(100dvh-8rem)] xl:self-start">
              {previewReady ? (
                <PreviewPane path={path} anchor={section.anchor ?? null} revision={revision} syncing={syncing} onReport={onReport} />
              ) : (
                <div className="card grid h-full min-h-[28rem] place-items-center text-sm text-muted">Opening the preview…</div>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-[var(--header-bg)] backdrop-blur-xl lg:left-[17rem]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <p className="text-sm text-muted">
            {dirty ? (
              <span className="font-semibold text-butter-ink">Unsaved changes: only you can see them, in the preview</span>
            ) : data?.updatedAt ? (
              `Last saved ${formatDateTime(data.updatedAt)} IST`
            ) : (
              "Defaults, not saved yet"
            )}
          </p>
          <div className="flex gap-2">
            {dirty ? (
              <Button variant="ghost" onClick={discard} disabled={saving}>
                Discard
              </Button>
            ) : null}
            <Button onClick={save} disabled={saving || !dirty} icon={<Save size={17} aria-hidden />}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
