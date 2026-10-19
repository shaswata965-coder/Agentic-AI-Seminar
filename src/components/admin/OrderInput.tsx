"use client";

import { ArrowDown, ArrowUp, GripVertical, Lock, RotateCcw } from "lucide-react";
import { useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import type { OrderField } from "@/lib/schema/fields";
import { arrange } from "@/lib/schema/section-order";

const moveItem = (list: string[], from: number, to: number) => {
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

/**
 * An "order" field: its items as a list to drag into place, or to move one step at a time with the arrows
 * (keyboard and touch). Pinned items sit above it and don't move. `onMove` hears which item was moved.
 */
export function OrderInput({ field: f, value, onChange, onMove, error }: { field: OrderField; value: unknown; onChange: (v: string[]) => void; onMove?: (key: string) => void; error?: string }) {
  const defaults = f.options.map((o) => o.value);
  const saved = arrange(defaults, value);
  const labelOf = (key: string) => f.options.find((o) => o.value === key)?.label ?? key;

  // While dragging, the list follows the pointer; the new order is kept when the item is dropped.
  const [drag, setDrag] = useState<{ key: string; list: string[] } | null>(null);
  const list = drag?.list ?? saved;
  const [said, setSaid] = useState("");
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const refocus = useRef<{ key: string; dir: "up" | "down" } | null>(null);

  // Moving a row can take the focus with it: put it back on the arrow that was pressed (or the other one at either end).
  useLayoutEffect(() => {
    const want = refocus.current;
    if (!want) return;
    refocus.current = null;
    const el = buttons.current.get(`${want.key}:${want.dir}`);
    (el && !el.disabled ? el : buttons.current.get(`${want.key}:${want.dir === "up" ? "down" : "up"}`))?.focus();
  });

  const commit = (next: string[], key: string) => {
    if (next.join() === saved.join()) return;
    onChange(next);
    onMove?.(key);
    setSaid(`${labelOf(key)} moved to place ${next.indexOf(key) + 1} of ${next.length}.`);
  };

  const step = (i: number, dir: "up" | "down") => {
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= saved.length) return;
    refocus.current = { key: saved[i], dir };
    commit(moveItem(saved, i, j), saved[i]);
  };

  const over = (e: DragEvent<HTMLLIElement>, j: number) => {
    if (!drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const i = drag.list.indexOf(drag.key);
    if (i === j) return;
    // Swap places only once the pointer is past the middle of the row it is over, so rows don't flicker back and forth.
    const box = e.currentTarget.getBoundingClientRect();
    const past = i < j ? e.clientY > box.top + box.height / 2 : e.clientY < box.top + box.height / 2;
    if (past) setDrag({ key: drag.key, list: moveItem(drag.list, i, j) });
  };

  const changed = saved.join() !== defaults.join();

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-fg">{f.label}</legend>
      {/* Dropping anywhere on the list (between rows too) keeps the new order. */}
      <ol
        className="grid gap-2"
        onDragOver={(e) => {
          if (drag) e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (drag) commit(drag.list, drag.key);
          setDrag(null);
        }}
      >
        {(f.pinned ?? []).map((label) => (
          <li key={`pinned-${label}`} className="flex items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-2 px-3 py-2.5 text-sm">
            <span className="grid h-8 w-6 place-items-center text-subtle">
              <Lock size={15} aria-hidden />
            </span>
            <span className="font-semibold text-fg">{label}</span>
            <span className="ml-auto text-xs text-subtle">Always at the top</span>
          </li>
        ))}
        {list.map((key, i) => {
          const label = labelOf(key);
          return (
            <li
              key={key}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", label);
                setDrag({ key, list: saved });
              }}
              onDragOver={(e) => over(e, i)}
              onDragEnd={() => setDrag(null)}
              data-order-item={key}
              className={cn(
                "flex items-center gap-2 rounded-2xl border border-border bg-surface p-1.5 pl-2 text-sm shadow-[0_1px_2px_rgb(15_23_42/0.05)] transition-[opacity,box-shadow]",
                drag?.key === key && "opacity-60 ring-2 ring-brand",
              )}
            >
              <span aria-hidden className="grid h-8 w-6 cursor-grab place-items-center text-subtle active:cursor-grabbing">
                <GripVertical size={16} />
              </span>
              <span aria-hidden className="w-6 font-mono text-[11px] text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-fg">{label}</span>
              {(["up", "down"] as const).map((dir) => (
                <button
                  key={dir}
                  ref={(el) => {
                    if (el) buttons.current.set(`${key}:${dir}`, el);
                    else buttons.current.delete(`${key}:${dir}`);
                  }}
                  type="button"
                  onClick={() => step(i, dir)}
                  disabled={dir === "up" ? i === 0 : i === list.length - 1}
                  className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
                  aria-label={`Move ${label} ${dir}`}
                >
                  {dir === "up" ? <ArrowUp size={15} aria-hidden /> : <ArrowDown size={15} aria-hidden />}
                </button>
              ))}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      {changed ? (
        <button
          type="button"
          onClick={() => {
            onChange(defaults);
            setSaid("Back to the default order.");
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 py-1.5 text-sm font-semibold text-brand hover:border-brand"
        >
          <RotateCcw size={15} aria-hidden /> Back to the default order
        </button>
      ) : null}
      {f.help ? <p className="mt-1.5 text-xs text-subtle">{f.help}</p> : null}
      {error ? <p className="mt-1.5 text-sm font-medium text-blush-ink">{error}</p> : null}
    </fieldset>
  );
}
