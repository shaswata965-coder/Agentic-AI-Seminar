import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import sharp from "sharp";
import { mediaBucket } from "@/lib/models";
import { UPLOAD_PERMISSIONS } from "@/lib/permissions";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json } from "@/lib/server/http";
import { cleanLine } from "@/lib/safe-text";

const RASTER = new Set(["jpeg", "png", "webp", "gif", "avif", "tiff", "heif"]);
// Scripts (also as <x:script> in another namespace), event handlers, embedded documents, entity
// tricks, and script or HTML URLs. No nested quantifiers: linear on any input.
const UNSAFE_SVG = /<\s*(?:[\w.-]+:)?(?:script|foreignObject|iframe|embed|object|handler|listener)\b|<!ENTITY|\bon[a-z]+\s*=|(?:java|vb)script\s*:|data\s*:\s*(?:text\/html|image\/svg|application\/(?:xhtml|xml))/i;

/** The SVG's text as a browser would read it for the check: character references decoded, and the whitespace browsers ignore inside a URL scheme dropped. */
function svgForCheck(text: string) {
  const decoded = text
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_, h: string) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)))
    .replace(/&#(\d{1,7});?/g, (_, d: string) => String.fromCodePoint(Math.min(Number(d), 0x10ffff)))
    .replace(/&(colon|tab|newline);/gi, (_, n: string) => ({ colon: ":", tab: "\t", newline: "\n" })[n.toLowerCase() as "colon"]);
  return decoded.replace(/[\t\n\r]+/g, "");
}

const cleanName = (name: string) =>
  (name || "upload")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "upload";

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { permission: UPLOAD_PERMISSIONS });
  if (user instanceof Response) return user;
  const files = await mediaBucket().find({}).sort({ uploadDate: -1 }).limit(500).toArray();
  return json({
    data: files.map((f) => ({
      id: String(f._id),
      url: `/api/media/${f._id}`,
      filename: f.filename,
      contentType: String(f.metadata?.contentType ?? ""),
      size: f.length,
      width: f.metadata?.width ?? null,
      height: f.metadata?.height ?? null,
      alt: f.metadata?.alt ?? "",
      uploadedAt: f.uploadDate,
    })),
  });
}

/** Upload an image (compressed to WebP, max 1920px) or a PDF/SVG into MongoDB GridFS. */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req, { permission: UPLOAD_PERMISSIONS });
  if (user instanceof Response) return user;
  const max = (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024;
  // Refuse an oversized upload before reading it (the form adds a little to the file's size).
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) return error(411, "Upload a file using the form.");
  if (len > max + 64 * 1024) return error(413, `Files must be smaller than ${Math.round(max / 1024 / 1024)} MB.`);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error(400, "Upload a file using the form.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return error(400, "No file received.");
  if (file.size > max) return error(413, `Files must be smaller than ${Math.round(max / 1024 / 1024)} MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  const alt = cleanLine(String(form.get("alt") ?? "")).trim().slice(0, 300);
  const base = cleanName(file.name);

  let out: Buffer;
  let contentType: string;
  let filename: string;
  let width: number | null = null;
  let height: number | null = null;

  if (input.subarray(0, 5).toString("latin1") === "%PDF-") {
    out = input;
    contentType = "application/pdf";
    filename = `${base}.pdf`;
  } else if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    const text = input.toString("utf8");
    if (!/<svg[\s>]/i.test(text.slice(0, 4096))) return error(415, "That doesn't look like an SVG file.");
    // SVGs can carry scripts. They are only ever shown as images, and served with a sandbox, but refuse them anyway.
    if (UNSAFE_SVG.test(svgForCheck(text))) return error(415, "This SVG contains scripts, event handlers or embedded pages, which aren't allowed. Export it again as a plain SVG, or upload a PNG.");
    out = input;
    contentType = "image/svg+xml";
    filename = `${base}.svg`;
  } else {
    try {
      const meta = await sharp(input).metadata();
      if (!meta.format || !RASTER.has(meta.format)) return error(415, "Unsupported file type. Upload JPG, PNG, WebP, GIF, SVG or PDF.");
      const animated = meta.format === "gif" && (meta.pages ?? 1) > 1;
      out = await sharp(input, { animated })
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      const after = await sharp(out).metadata();
      width = after.width ?? null;
      height = after.pageHeight ?? after.height ?? null;
      contentType = "image/webp";
      filename = `${base}.webp`;
    } catch {
      return error(415, "This image could not be read. Try a JPG or PNG file.");
    }
  }

  const upload = mediaBucket().openUploadStream(filename, {
    metadata: { contentType, width, height, alt, originalName: file.name.slice(0, 200), uploadedBy: user.email },
  });
  await new Promise<void>((resolve, reject) => {
    upload.once("finish", () => resolve());
    upload.once("error", reject);
    upload.end(out);
  });
  const id = String(upload.id as mongoose.Types.ObjectId);
  await recordActivity(user, { action: "uploaded", area: "media", target: filename, targetId: id });
  return json({ data: { id, url: `/api/media/${id}`, filename, contentType, size: out.length, width, height, alt } }, { status: 201 });
}
