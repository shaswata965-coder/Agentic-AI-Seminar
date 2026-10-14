import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import sharp from "sharp";
import { mediaBucket } from "@/lib/models";
import { UPLOAD_PERMISSIONS } from "@/lib/permissions";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json } from "@/lib/server/http";

const RASTER = new Set(["jpeg", "png", "webp", "gif", "avif", "tiff", "heif"]);

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
  const alt = String(form.get("alt") ?? "").slice(0, 300);
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
    if (!/<svg[\s>]/i.test(input.toString("utf8", 0, 4096))) return error(415, "That doesn't look like an SVG file.");
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
    metadata: { contentType, width, height, alt, originalName: file.name, uploadedBy: user.email },
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
