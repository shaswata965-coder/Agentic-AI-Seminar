import type { Metadata } from "next";
import { AccountForm } from "@/components/admin/AccountForm";

export const metadata: Metadata = { title: "My account" };

export default function Page() {
  return <AccountForm />;
}
