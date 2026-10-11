import { connection } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";

/** Liveness/readiness probe for the server and its database. */
export async function GET() {
  await connection();
  let db: "connected" | "not-configured" | "unreachable" = "not-configured";
  if (isDbConfigured()) {
    try {
      await connectDb();
      db = "connected";
    } catch {
      db = "unreachable";
    }
  }
  return Response.json({ status: db === "unreachable" ? "degraded" : "ok", db }, { status: db === "unreachable" ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}
