import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSettings } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const s = await getSettings();
  return (
    <main className="tone-lilac relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="wash absolute inset-0 -z-10" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-10 opacity-60" />
      <LoginForm eventName={s.eventName} />
    </main>
  );
}
