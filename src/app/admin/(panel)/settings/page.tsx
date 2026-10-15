import type { Metadata } from "next";
import { SettingsStudio } from "@/components/admin/settings/SettingsStudio";

export const metadata: Metadata = { title: "Site settings" };

export default function Page() {
  return <SettingsStudio />;
}
