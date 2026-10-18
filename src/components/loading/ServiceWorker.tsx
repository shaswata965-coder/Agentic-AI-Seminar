"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/paths";

/**
 * Registers public/sw.js, which serves the site's cached files (see that file). Production only: in
 * development a worker would hold on to files that change on every save, so any left from a production
 * run on the same address is removed.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const url = withBase("/sw.js");
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(url, { scope: withBase("/") }).catch(() => {});
    } else {
      navigator.serviceWorker
        .getRegistrations()
        .then((all) => all.filter((r) => r.active?.scriptURL.endsWith(url)).forEach((r) => r.unregister()))
        .catch(() => {});
    }
  }, []);
  return null;
}
