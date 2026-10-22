"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/*
 * Vercel Web Analytics: live page views in the Vercel dashboard (Analytics tab), without cookies. Rendered
 * only when the site runs on Vercel (see the (site) layout): its script and endpoint (/_vercel/insights/*)
 * exist only there. Page views in the admin's live preview (the site framed by Site settings) aren't
 * counted, as it reloads with every edit.
 */

const dropPreview = (event: BeforeSendEvent) => (window.self === window.top ? event : null);

export function VercelAnalytics() {
  return <Analytics beforeSend={dropPreview} />;
}
