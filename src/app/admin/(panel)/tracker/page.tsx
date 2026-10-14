import type { Metadata } from "next";
import { ActivityTracker } from "@/components/admin/ActivityTracker";

export const metadata: Metadata = { title: "Task tracker" };

export default function Page() {
  return <ActivityTracker />;
}
