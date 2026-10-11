import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { getSettings } from "@/lib/content/queries";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: "Admin", template: `%s · Admin · ${s.shortName || s.eventName}` },
    robots: { index: false, follow: false },
  };
}

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <ToastProvider>{children}</ToastProvider>;
}
