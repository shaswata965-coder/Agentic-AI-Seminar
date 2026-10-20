import type { SiteSettings } from "@/lib/content/types";

export const THEME_IMAGES: Record<string, string> = {
  healthcare: "/themes/health-care.png",
  science: "/themes/Agentic AI for Scientific Discovery.png",
  entrepreneurship: "/themes/Agentic AI and Enterprise.png",
  "Agentic AI in Healthcare": "/themes/health-care.png",
  "Agentic AI for Scientific Discovery": "/themes/Agentic AI for Scientific Discovery.png",
  "Agentic AI and Enterprise": "/themes/Agentic AI and Enterprise.png",
};

/**
 * The three workshop themes are now integrated directly into the homepage Hero section
 * in the left column beside Aura.
 */
export function Themes({ s: _s }: { s: SiteSettings }) {
  return null;
}
