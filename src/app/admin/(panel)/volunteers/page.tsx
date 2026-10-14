import type { Metadata } from "next";
import { VolunteersManager } from "@/components/admin/VolunteersManager";

export const metadata: Metadata = { title: "Volunteers" };

export default function Page() {
  return <VolunteersManager />;
}
