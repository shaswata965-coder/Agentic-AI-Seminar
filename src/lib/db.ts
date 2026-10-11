import mongoose from "mongoose";

export class DbUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbUnavailableError";
  }
}

type ConnCache = {
  promise: Promise<typeof mongoose> | null;
  failedAt: number;
  boot: Promise<void> | null;
};

// Reuse one connection across hot reloads and route invocations.
const g = globalThis as unknown as { __aaiwMongo?: ConnCache };
const cache: ConnCache = (g.__aaiwMongo ??= { promise: null, failedAt: 0, boot: null });

export const isDbConfigured = () => Boolean(process.env.MONGODB_URI);

/** Connect (once) to MongoDB. Throws DbUnavailableError when not configured or unreachable. */
export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DbUnavailableError("MONGODB_URI is not configured");
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!cache.promise) {
    // Don't hammer an unreachable server (e.g. during a build without a database).
    if (Date.now() - cache.failedAt < 10_000) throw new DbUnavailableError("Database was unreachable moments ago");
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || undefined,
        serverSelectionTimeoutMS: 5_000,
        maxPoolSize: 10,
        bufferCommands: false,
      })
      .catch((err: Error) => {
        cache.promise = null;
        cache.failedAt = Date.now();
        throw new DbUnavailableError(err.message);
      });
  }
  await cache.promise;
  return mongoose;
}

/** Run a one-time task per process (used to bootstrap default content). */
export function once(task: () => Promise<void>): Promise<void> {
  if (!cache.boot) {
    cache.boot = task().catch((err) => {
      cache.boot = null;
      throw err;
    });
  }
  return cache.boot;
}

export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
