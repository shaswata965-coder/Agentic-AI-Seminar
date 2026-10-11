import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/paths";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agentic AI Workshop 2026 · IIT Delhi",
    short_name: "AAIW 2026",
    description: "Agentic AI Workshop 2026 at IIT Delhi — talks, tutorials, demos, kiosks and a hackathon. 15–16 December 2026.",
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
