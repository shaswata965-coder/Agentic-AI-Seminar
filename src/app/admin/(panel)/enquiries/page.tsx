import type { Metadata } from "next";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";

export const metadata: Metadata = { title: "Enquiries" };

export default function Page() {
  return <EnquiriesManager />;
}
