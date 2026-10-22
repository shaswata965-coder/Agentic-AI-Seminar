"use client";

import type { ReactNode } from "react";
import { useNow } from "@/lib/client-hooks";
import { deadlinePassed } from "@/lib/event";

/**
 * Shows `children` until the deadline passes, then `closed`. Pages are cached,
 * so the switch happens in the browser; the API enforces the same deadline.
 */
export function DeadlineGate({ deadline, closed, children }: { deadline?: string; closed: ReactNode; children: ReactNode }) {
  const now = useNow();
  return <>{now !== null && deadlinePassed(deadline, now) ? closed : children}</>;
}
