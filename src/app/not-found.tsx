import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { getSettings } from "@/lib/content/queries";
import { brandName } from "@/lib/event";

export const metadata: Metadata = { title: "Page not found" };

export default async function NotFound() {
  const s = await getSettings();
  return (
    <>
      <header className="container-site flex h-16 items-center">
        <Link href="/">
          <BrandMark {...brandName(s)} srSuffix=", home page" />
        </Link>
      </header>
      <main>
        <NotFoundContent />
      </main>
    </>
  );
}
