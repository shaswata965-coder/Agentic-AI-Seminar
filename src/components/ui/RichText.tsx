import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Minimal, safe Markdown subset for CMS text: paragraphs, line breaks,
 * "- " bullet and "1. " numbered lists, **bold**, *italic*, `code` and
 * [links](https://…). Rendered as React elements, never as raw HTML.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const label = tok.slice(1, tok.indexOf("]("));
      const href = tok.slice(tok.indexOf("](") + 2, -1);
      if (SAFE_HREF.test(href)) {
        const external = /^https?:\/\//i.test(href);
        out.push(
          <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {label}
          </a>,
        );
      } else out.push(label);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function block(raw: string, key: number): ReactNode {
  const lines = raw.split("\n");
  if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
    return (
      <ul key={key}>
        {lines.map((l, j) => (
          <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${key}-${j}`)}</li>
        ))}
      </ul>
    );
  }
  if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
    return (
      <ol key={key}>
        {lines.map((l, j) => (
          <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), `${key}-${j}`)}</li>
        ))}
      </ol>
    );
  }
  return (
    <p key={key}>
      {lines.map((l, j) => (
        <Fragment key={j}>
          {j > 0 ? <br /> : null}
          {inline(l, `${key}-${j}`)}
        </Fragment>
      ))}
    </p>
  );
}

export function RichText({ text, className }: { text?: string | null; className?: string }) {
  if (!text?.trim()) return null;
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return <div className={cn("rich", className)}>{blocks.map((b, i) => block(b, i))}</div>;
}

/** Plain-text version (for meta descriptions, PDFs, e-mails). */
export function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "• ");
}
