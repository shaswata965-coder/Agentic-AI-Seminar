"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Accessible modal built on the native <dialog> element: focus is trapped,
 * Esc closes it, the page behind is inert and focus returns to the trigger.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  className,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[min(92dvh,56rem)] w-[calc(100%-1.5rem)] overflow-visible rounded-[1.75rem] border border-border bg-surface p-0 text-fg shadow-card-lg backdrop:bg-[rgb(10_15_30/0.45)] backdrop:backdrop-blur-sm open:animate-pop",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
        size === "xl" && "max-w-4xl",
        className,
      )}
    >
      {open ? (
        <div className="relative max-h-[min(92dvh,56rem)] overflow-y-auto overscroll-contain rounded-[1.75rem]">
          <button
            type="button"
            onClick={onClose}
            data-ripple=""
            className="group absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted transition hover:bg-surface-3 hover:text-fg"
            aria-label="Close"
          >
            <X size={18} className="transition-transform duration-300 group-hover:rotate-90" />
          </button>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
