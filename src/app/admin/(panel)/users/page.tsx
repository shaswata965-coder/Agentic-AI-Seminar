import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/UsersManager";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <UsersManager />;
}
