import type { Metadata } from "next";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export const metadata: Metadata = { title: "Hackathon" };

export default function Page() {
  return <SingletonEditor kind="hackathon" />;
}
