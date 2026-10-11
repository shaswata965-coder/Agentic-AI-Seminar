import type { ReactNode } from "react";

/** Tag shapes, drawn in app/tags.css. A section picks one and every tag inside it follows. */
export type TagStyle = "label" | "bracket" | "underline" | "ribbon" | "slash" | "tab" | "stamp" | "corner";

/** Sets the tag style for a whole page without adding a box to the layout. */
export function TagScope({ style, children }: { style: TagStyle; children: ReactNode }) {
  return (
    <div data-tags={style} className="contents">
      {children}
    </div>
  );
}
