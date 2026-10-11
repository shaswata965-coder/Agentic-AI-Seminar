import type { Metadata } from "next";
import { RegistrationsManager } from "@/components/admin/RegistrationsManager";

export const metadata: Metadata = { title: "Registrations" };

export default function Page() {
  return <RegistrationsManager />;
}
