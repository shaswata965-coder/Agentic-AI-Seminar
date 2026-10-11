/* eslint-disable @next/next/no-img-element -- see Avatar.tsx */
import type { ImgHTMLAttributes } from "react";
import { withBase } from "@/lib/paths";

/** Lazy, async-decoded image for CMS content (uploads are pre-compressed). */
export function Img({ src, alt, loading = "lazy", ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  return <img src={withBase(src)} alt={alt} loading={loading} decoding="async" {...rest} />;
}
