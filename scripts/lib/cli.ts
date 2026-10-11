import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { parseArgs, type ParseArgsConfig } from "node:util";
import { connectDb } from "@/lib/db";

/* Small helpers shared by the command-line scripts in this folder. */

// Load .env / .env.local the same way Next.js does, so scripts use the same database.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info: () => {}, error: console.error });

export function cliArgs<T extends NonNullable<ParseArgsConfig["options"]>>(options: T) {
  return parseArgs({ options: { ...options, help: { type: "boolean", short: "h" } }, allowPositionals: false, strict: true }).values;
}

export async function connect() {
  if (!process.env.MONGODB_URI) fail("MONGODB_URI is not set. Add it to .env.local (see .env.example) or the environment.");
  try {
    await connectDb();
  } catch (err) {
    fail(`Could not connect to MongoDB: ${(err as Error).message}`);
  }
  const { host, name } = mongoose.connection;
  console.log(`Connected to MongoDB database "${name}" on ${host}.`);
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

/** Run a script's main function, then always close the connection. */
export function run(main: () => Promise<void>) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

/** Prompt for input without echoing it (for passwords). Requires an interactive terminal. */
export function promptHidden(question: string): Promise<string> {
  const { stdin, stdout } = process;
  if (!stdin.isTTY) fail("No interactive terminal to type a password in: pass --password instead.");
  return new Promise((resolve) => {
    let value = "";
    const finish = (cancelled = false) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      stdout.write("\n");
      if (cancelled) fail("Cancelled.");
      resolve(value);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") return finish();
        if (ch === "\u0003") return finish(true);
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
  });
}

export const RESTART_HINT = "The website caches pages for up to 5 minutes: press “Refresh website” on the admin dashboard (or restart the site) to show these changes now. Changes saved in the admin panel appear immediately.";
