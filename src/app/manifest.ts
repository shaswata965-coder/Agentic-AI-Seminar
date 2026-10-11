import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content/queries";
import { BASE_PATH } from "@/lib/paths";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: `${s.eventName} · IIT Delhi`,
    short_name: s.shortName || s.eventName,
    description: s.description || s.tagline,
    start_url: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#f6f8fc",
    theme_color: "#3b5bdb",
    icons: [
      { src: `${BASE_PATH}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${BASE_PATH}/apple-icon`, sizes: "180x180", type: "image/png" },
    ],
  };
}
