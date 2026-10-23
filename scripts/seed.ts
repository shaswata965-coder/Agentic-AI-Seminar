/**
 * Store the default content from the website brief: event details, hackathon
 * outline, organisers, FAQs and the tentative programme. Safe to run any number of times: it only adds
 * what is missing and never overwrites edits made in the admin panel.
 *
 *   npm run seed
 */
import mongoose from "mongoose";
import { ensureDefaultContent } from "@/lib/content/bootstrap";
import { cliArgs, connect, RESTART_HINT, run } from "./lib/cli";

run(async () => {
  const args = cliArgs({});
  if (args.help) {
    console.log("Usage: npm run seed\n\nAdds the default event content (settings, hackathon, organisers, FAQs, the tentative programme) where it is missing.");
    return;
  }
  await connect();

  // Make sure every index exists (e.g. one registration per e-mail address).
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));

  const created = await ensureDefaultContent({ fillEmpty: true });
  if (created.length) {
    console.log(`✔ Added: ${created.join(", ")}.`);
    console.log(RESTART_HINT);
  } else {
    console.log("✔ Default content is already in place, nothing to add.");
  }
  console.log("Next: create an administrator with `npm run create-admin -- --email you@example.com`, or sign in with ADMIN_EMAIL / ADMIN_PASSWORD.");
});
