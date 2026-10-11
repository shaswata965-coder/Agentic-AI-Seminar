/**
 * Create an admin-panel user, or reset the password of an existing one.
 *
 *   npm run create-admin -- --email you@iitd.ac.in --name "Your Name"
 *   npm run create-admin -- --email editor@iitd.ac.in --role editor
 *
 * The password is asked for without echoing it. On servers without an
 * interactive terminal, pass --password (it may end up in shell history).
 */
import { User } from "@/lib/models";
import { hashPassword, PASSWORD_MIN } from "@/lib/password";
import { cliArgs, connect, fail, promptHidden, run } from "./lib/cli";

const USAGE = `Usage: npm run create-admin -- --email <address> [--name "Full name"] [--role admin|editor] [--password <password>]

Creates the user, or resets the password (and updates name/role) if the e-mail already exists.
Administrators can manage users and delete registrations; editors can change all content.`;

run(async () => {
  const args = cliArgs({
    email: { type: "string", short: "e" },
    name: { type: "string", short: "n" },
    role: { type: "string", short: "r" },
    password: { type: "string", short: "p" },
  });
  if (args.help) return void console.log(USAGE);

  const email = args.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(`Pass a valid --email.\n\n${USAGE}`);
  const role = args.role ?? "admin";
  if (role !== "admin" && role !== "editor") fail("--role must be admin or editor.");

  let password = args.password ?? "";
  if (!password) {
    password = await promptHidden(`New password for ${email} (min ${PASSWORD_MIN} characters): `);
    if (password.length >= PASSWORD_MIN && (await promptHidden("Repeat the password: ")) !== password) fail("The passwords did not match.");
  }
  if (password.length < PASSWORD_MIN) fail(`The password must be at least ${PASSWORD_MIN} characters.`);
  if (password.length > 200) fail("The password is too long (max 200 characters).");

  await connect();
  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.active = true;
    if (args.name) existing.name = args.name;
    if (args.role) existing.role = role;
    await existing.save();
    console.log(`✔ Updated ${existing.role} ${email}: password reset and account active.`);
  } else {
    await User.create({ email, name: args.name || (role === "admin" ? "Administrator" : "Editor"), passwordHash, role });
    console.log(`✔ Created ${role} ${email}. Sign in at /admin.`);
  }
});
