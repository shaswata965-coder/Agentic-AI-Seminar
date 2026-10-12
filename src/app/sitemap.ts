import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSettings();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/programme", priority: 0.9, freq: "daily" },
    { path: "/speakers", priority: 0.9, freq: "daily" },
    { path: "/register", priority: 0.9, freq: "weekly" },
    { path: "/hackathon", priority: 0.9, freq: "weekly" },
    { path: "/hackathon/register", priority: 0.7, freq: "weekly" },
    { path: "/tutorials", priority: 0.8, freq: "weekly" },
    { path: "/organisers", priority: 0.6, freq: "monthly" },
    { path: "/meet-aura", priority: 0.3, freq: "monthly" },
    ...(s.showGallery ? [{ path: "/gallery", priority: 0.6, freq: "weekly" as const }] : []),
    ...(s.showTalks ? [{ path: "/talks", priority: 0.6, freq: "weekly" as const }] : []),
  ];
  return pages.map((p) => ({ url: absoluteUrl(p.path), changeFrequency: p.freq, priority: p.priority }));
}
