import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="tone-lilac relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="wash absolute inset-0 -z-10" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-10 opacity-60" />
      <LoginForm />
    </main>
  );
}
