import type { Metadata } from "next";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export const metadata: Metadata = { title: "Site settings" };

export default function Page() {
  return <SingletonEditor kind="settings" />;
}
