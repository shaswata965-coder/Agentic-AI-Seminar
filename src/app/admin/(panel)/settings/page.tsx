import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsStudio } from "@/components/admin/settings/SettingsStudio";

export const metadata: Metadata = { title: "Site settings" };

export default function Page() {
  return (
    <Suspense fallback={<div className="card p-10 text-center text-muted">Loading…</div>}>
      <SettingsStudio />
    </Suspense>
  );
}
