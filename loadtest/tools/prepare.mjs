#!/usr/bin/env node
/*
 * Gets a load-test database ready: empties it, stores the default content and the sample speakers,
 * programme and partners (so pages are as full as they will be during the event), opens both
 * registrations, publishes the programme, and creates the organiser account the k6 scripts sign in with.
 *
 *   MONGODB_URI=mongodb://127.0.0.1:27017/aaiw-loadtest node loadtest/tools/prepare.mjs
 *
 * It refuses any database whose name doesn't contain "loadtest", so it can't wipe a real one.
 */
import { execFileSync } from "node:child_process";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const admin = { email: process.env.LOADTEST_ADMIN_EMAIL ?? "loadtest-admin@example.com", password: process.env.LOADTEST_ADMIN_PASSWORD ?? "Load-test-organiser-2026" };
if (!uri) throw new Error("Set MONGODB_URI to the load-test database.");

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 5000 });
const db = mongoose.connection.db;
if (!/loadtest/i.test(db.databaseName)) {
  console.error(`Refusing to wipe "${db.databaseName}": use a database whose name contains "loadtest".`);
  process.exit(1);
}
await db.dropDatabase();
console.log(`Emptied database "${db.databaseName}".`);

const npm = (...args) => execFileSync("npm", ["run", "--silent", ...args], { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, NODE_ENV: "production" } });
npm("seed"); // default content, and every index (one registration per e-mail, one team per name)
npm("seed:demo"); // speakers, a two-day programme, partners …
npm("create-admin", "--", "--email", admin.email, "--name", "Load test organiser", "--role", "admin", "--password", admin.password);

// Both registrations open with no deadline, and the programme published (calendar and PDF have sessions).
const open = { "data.workshopStatus": "open", "data.workshopUrl": "", "data.workshopDeadline": "", "data.hackathonStatus": "open", "data.hackathonUrl": "", "data.hackathonDeadline": "", "data.programmeStatus": "final" };
await db.collection("singletons").updateOne({ key: "settings" }, { $set: open });
console.log("Opened workshop and hackathon registration; programme status final.");
await mongoose.disconnect();
