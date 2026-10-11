import type { MetadataRoute } from "next";
import { absoluteUrl, BASE_PATH } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: `${BASE_PATH}/`, disallow: [`${BASE_PATH}/admin`, `${BASE_PATH}/api/`] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
