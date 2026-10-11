import { Readable } from "node:stream";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { mediaBucket } from "@/lib/models";

/** Serve an uploaded file from MongoDB GridFS. IDs are immutable, so cache forever. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/media/[id]">) {
  const { id: raw } = await ctx.params;
  const id = raw.replace(/\.[a-z0-9]{2,5}$/i, "");
  if (!/^[a-f0-9]{24}$/i.test(id)) return new Response("Not found", { status: 404 });
  const etag = `"${id}"`;
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ETag: etag } });

  try {
    await connectDb();
  } catch {
    return new Response("Media temporarily unavailable", { status: 503 });
  }
  const bucket = mediaBucket();
  const _id = new mongoose.Types.ObjectId(id);
  const [file] = await bucket.find({ _id }).limit(1).toArray();
  if (!file) return new Response("Not found", { status: 404 });

  const type = String(file.metadata?.contentType ?? "application/octet-stream");
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Content-Length": String(file.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
  };
  // SVGs can contain scripts: sandbox them when opened directly.
  if (type.includes("svg")) headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  const stream = Readable.toWeb(bucket.openDownloadStream(_id)) as ReadableStream<Uint8Array>;
  return new Response(stream, { headers });
}
