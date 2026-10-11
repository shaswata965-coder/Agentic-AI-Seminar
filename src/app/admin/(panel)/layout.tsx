import { AdminShell } from "@/components/admin/AdminShell";
import { getSettings } from "@/lib/content/queries";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const s = await getSettings();
  return (
    <AdminShell eventName={s.eventName} shortName={s.shortName}>
      {children}
    </AdminShell>
  );
}
